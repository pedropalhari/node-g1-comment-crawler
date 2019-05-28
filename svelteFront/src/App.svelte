<script>
  import Quote from "./Quote.svelte";
  export let name;
</script>

<style>
  .bodyDiv {
    width: 100vw;
    height: 100vh;
    background-color: #3b3f44;
		display: flex;
		justify-content: center;
		align-items: center;
  }
</style>

<div class="bodyDiv">
  <Quote />
</div>
