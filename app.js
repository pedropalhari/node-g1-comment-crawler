//document.querySelectorAll('[id^="comentario"] > div.glbComentarios-conteudo > div > div.glbComentarios-dados-usuario')

//"https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/05/26/manifestantes-fazem-ato-no-rio-pelo-fim-das-politicas-de-intervencao-e-ocupacao-policial-em-areas-residenciais.ghtml"
//"https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/05/26/manifestantes-fazem-ato-pro-bolsonaro-em-copacabana.ghtml"
//"https://g1.globo.com/mundo/noticia/2019/05/27/a-visita-de-trump-a-um-ringue-de-sumo-no-japao-tarde-incrivel.ghtml"
//https://g1.globo.com/ciencia-e-saude/noticia/2019/05/27/oms-define-sindrome-de-burnout-como-estresse-cronico-e-a-inclui-na-lista-oficial-de-doencas.ghtml

const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    //headless: false
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1440, height: 900 });

  console.log("abrindo página");

  await page.goto(
    "https://g1.globo.com/mundo/noticia/2019/05/27/a-visita-de-trump-a-um-ringue-de-sumo-no-japao-tarde-incrivel.ghtml"
  );

  console.log("identificando comentários");
  let commentElements = await scrollAndWait(page, 200);

  console.log("parseando");
  let nameNodeElementsPromiseArray = commentElements.map(elem =>
    elem.$("strong")
  );
  let commentNodeElementsPromiseArray = commentElements.map(elem =>
    elem.$("p")
  );

  let thumbsDownNodeElementsPromiseArray = commentElements.map(elem =>
    elem.$("div > button.glbComentarios-thumbs-down")
  );

  let nameNodeElements = await Promise.all(nameNodeElementsPromiseArray);
  let commentNodeElements = await Promise.all(commentNodeElementsPromiseArray);
  let thumbsDownNodeElements = await Promise.all(
    thumbsDownNodeElementsPromiseArray
  );

  let nameTextValuePromiseArray = nameNodeElements.map(nameNode =>
    nameNode.getProperty("innerText")
  );
  let commentTextValuePromiseArray = commentNodeElements.map(commentNode =>
    commentNode.getProperty("innerText")
  );
  let thumbsDownTextValuePromiseArray = thumbsDownNodeElements.map(
    thumbsDownNode => thumbsDownNode.getProperty("innerText")
  );

  let nameTextElementHandle = await Promise.all(nameTextValuePromiseArray);
  let commentTextElementHandle = await Promise.all(
    commentTextValuePromiseArray
  );
  let thumbsDownTextElementHandle = await Promise.all(
    thumbsDownTextValuePromiseArray
  );

  let nameTextJSONPromiseArray = nameTextElementHandle.map(nameTextEH =>
    nameTextEH.jsonValue()
  );
  let commentTextJSONPromiseArray = commentTextElementHandle.map(
    commentTextEH => commentTextEH.jsonValue()
  );
  let thumbsDownTextJSONPromiseArray = thumbsDownTextElementHandle.map(
    thumbsDownTextEH => thumbsDownTextEH.jsonValue()
  );

  let nameTexts = await Promise.all(nameTextJSONPromiseArray);
  let commentTexts = await Promise.all(commentTextJSONPromiseArray);
  let thumbsDownTexts = await Promise.all(thumbsDownTextJSONPromiseArray);

  let indexNameDescMap = nameTexts.map((aItem, index) => ({
    name: aItem,
    comment: commentTexts[index],
    thumbsDown: thumbsDownTexts[index]
  }));

  console.log("resultado");

  indexNameDescMap.sort(
    (a, b) => parseInt(b.thumbsDown) - parseInt(a.thumbsDown)
  );

  console.log(indexNameDescMap[Math.floor(Math.random() * 10)]);

  // let a = await elements[0].getProperty("innerHTML");
  // let a2 = await a.jsonValue();
  // console.log(a2);

  //await browser.close();
})();

async function scrollAndWait(page, time) {
  return new Promise(async resolve => {
    let elements;
    do {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      elements = await page.$$(
        '[id^="comentario"] > div.glbComentarios-conteudo > div > div.glbComentarios-dados-usuario'
      );

      await new Promise(resolve2 => setTimeout(() => resolve2(), time));
    } while (elements.length <= 0);

    resolve(elements);
  });
}
