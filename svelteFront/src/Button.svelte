<script>
  export let onPress;
</script>

<style>
  div {
    width: 40vw;
    height: 8vh;
    margin-top: 7vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: #52555a;
    cursor: pointer;
  }

  div:hover {
    background-color: white;
  }

  div:hover span {
    color: #52555a;
  }

  div:active {
    transform: translateY(5px);
    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
  }

  span {
    color: white;
    font-style: italic;
    font-size: 30px;
    font-weight: 300;
    text-align: center;
  }
</style>

<div class="shadow selectNone" on:click={onPress}>
  <span>gerar nova frase</span>
</div>
