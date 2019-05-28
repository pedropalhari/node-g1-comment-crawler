<script>
  import Quote from "./Quote.svelte";
  import Button from "./Button.svelte";
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
  <Quote />
  <Button />
</div>
