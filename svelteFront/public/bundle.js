
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                $$.fragment.l(children(options.target));
            }
            else {
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Quote.svelte generated by Svelte v3.4.4 */

    const file = "src/Quote.svelte";

    function create_fragment(ctx) {
    	var div3, div2, div1, div0, span0, t0, t1, br, t2, span1, t3, t4;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(ctx.quoteText);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			span1 = element("span");
    			t3 = text("- ");
    			t4 = text(ctx.quoteName);
    			span0.className = "svelte-7x1ctr";
    			add_location(span0, file, 57, 8, 955);
    			add_location(br, file, 60, 8, 1008);
    			span1.className = "quoteName svelte-7x1ctr";
    			add_location(span1, file, 61, 8, 1023);
    			div0.className = "quoteContainer svelte-7x1ctr";
    			add_location(div0, file, 56, 6, 918);
    			div1.className = "imageContainer fade svelte-7x1ctr";
    			add_location(div1, file, 55, 4, 878);
    			div2.className = "imageContainer image shadow svelte-7x1ctr";
    			add_location(div2, file, 54, 2, 832);
    			div3.className = "container svelte-7x1ctr";
    			add_location(div3, file, 52, 0, 805);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, span0);
    			append(span0, t0);
    			append(div0, t1);
    			append(div0, br);
    			append(div0, t2);
    			append(div0, span1);
    			append(span1, t3);
    			append(span1, t4);
    		},

    		p: function update(changed, ctx) {
    			if (changed.quoteText) {
    				set_data(t0, ctx.quoteText);
    			}

    			if (changed.quoteName) {
    				set_data(t4, ctx.quoteName);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { quoteName, quoteText } = $$props;

    	const writable_props = ['quoteName', 'quoteText'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Quote> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('quoteName' in $$props) $$invalidate('quoteName', quoteName = $$props.quoteName);
    		if ('quoteText' in $$props) $$invalidate('quoteText', quoteText = $$props.quoteText);
    	};

    	return { quoteName, quoteText };
    }

    class Quote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["quoteName", "quoteText"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.quoteName === undefined && !('quoteName' in props)) {
    			console.warn("<Quote> was created without expected prop 'quoteName'");
    		}
    		if (ctx.quoteText === undefined && !('quoteText' in props)) {
    			console.warn("<Quote> was created without expected prop 'quoteText'");
    		}
    	}

    	get quoteName() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quoteName(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quoteText() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quoteText(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Button.svelte generated by Svelte v3.4.4 */

    const file$1 = "src/Button.svelte";

    function create_fragment$1(ctx) {
    	var div, span, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "gerar nova frase";
    			span.className = "svelte-qqtl5d";
    			add_location(span, file$1, 40, 2, 650);
    			div.className = "shadow selectNone svelte-qqtl5d";
    			add_location(div, file$1, 39, 0, 597);
    			dispose = listen(div, "click", ctx.onPress);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { onPress } = $$props;

    	const writable_props = ['onPress'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('onPress' in $$props) $$invalidate('onPress', onPress = $$props.onPress);
    	};

    	return { onPress };
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["onPress"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.onPress === undefined && !('onPress' in props)) {
    			console.warn("<Button> was created without expected prop 'onPress'");
    		}
    	}

    	get onPress() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onPress(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.4.4 */

    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	var div, t, current;

    	var quote_1 = new Quote({
    		props: {
    		quoteName: ctx.quote.name || 'dalai lama',
    		quoteText: ctx.quote.comment || 'dedo no cu e gritaria'
    	},
    		$$inline: true
    	});

    	var button = new Button({
    		props: { onPress: ctx.func },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			quote_1.$$.fragment.c();
    			t = space();
    			button.$$.fragment.c();
    			div.className = "bodyDiv svelte-1ibsbo4";
    			add_location(div, file$2, 33, 0, 641);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(quote_1, div, null);
    			append(div, t);
    			mount_component(button, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var quote_1_changes = {};
    			if (changed.quote) quote_1_changes.quoteName = ctx.quote.name || 'dalai lama';
    			if (changed.quote) quote_1_changes.quoteText = ctx.quote.comment || 'dedo no cu e gritaria';
    			quote_1.$set(quote_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			quote_1.$$.fragment.i(local);

    			button.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			quote_1.$$.fragment.o(local);
    			button.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			quote_1.$destroy();

    			button.$destroy();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	
      let quoteArray = [];

      let quote = [];
      async function getTextFromLocal() {
        let res = await fetch("http://localhost:3000");

        let resObject = await res.json();

        quoteArray = resObject;
      }

      async function randomizeQuote() {
        $$invalidate('quote', quote = quoteArray[Math.floor(Math.random() * quoteArray.length)]);
      }

      getTextFromLocal();

    	function func() {
    		return randomizeQuote();
    	}

    	return { quote, randomizeQuote, func };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    document.body.style.padding = 0;

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
