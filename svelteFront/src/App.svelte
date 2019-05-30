<script>
  import Quote from "./Quote.svelte";
  import Button from "./Button.svelte";
  let quoteArray = [];

  let quote = [];
  async function getTextFromLocal() {
    let res = await fetch("http://localhost:3000");

    let resObject = await res.json();

    quoteArray = resObject;
  }

  async function randomizeQuote() {
    quote = quoteArray[Math.floor(Math.random() * quoteArray.length)];
  }

  getTextFromLocal();
</script>

<style>
  .bodyDiv {
    width: 100vw;
    height: 100vh;
    background-color: #3b3f44;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>

<div class="bodyDiv">
  <Quote
    quoteName={quote.name || 'dalai lama'}
    quoteText={quote.comment || 'dedo no cu e gritaria'} />
  <Button onPress={() => randomizeQuote()} />
</div>
