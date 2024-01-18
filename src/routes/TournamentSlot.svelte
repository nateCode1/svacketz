<script>
  export let displayText;
  export let index;
  export let roundNumber;
  export let numRounds;
</script>


<div style={`flex-grow: 1; text-align: center; display: flex; align-items: center; position: relative;`}>
  <!-- Tick Before & Vertical Line Between -->
  {#if (roundNumber != 0)}
    <div style="height:2px; background-color: black; width: 10px;"></div>
    <div style='position: absolute; padding: 0.9px 0; height: 50%; width: 100%; border-left: 2px solid black; top: 50%; transform: translateY(-50%);'></div>
  {/if}

  <!-- Name -->
  <p class="hover" style="margin: 0 2px; min-width: 70px; padding: 5px; width: 100%;">{displayText}</p>

  <!-- Tick After -->
  {#if (roundNumber != numRounds)}
    <div style="height:2px; background-color: black; width: 5px;"></div>
  {/if}
</div>