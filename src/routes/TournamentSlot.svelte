<script lang="ts">
  export let displayText: string;
  export let index;
  export let roundNumber: number;
  export let numRounds: number;
  export let seed = -1;

  const getSeed = () => {
    return displayText == "BYE" ? '--' : seed == -1 ? '' : seed
  }
</script>


<div style={`flex-grow: 1; text-align: center; display: flex; align-items: center; position: relative;`}>
  <!-- Tick Before & Vertical Line Between -->
  {#if (roundNumber != 0)}
    <div style="height:2px; background-color: black; width: 10px;"></div>
    <div style='position: absolute; padding: 0.9px 0; height: 50%; width: 100%; border-left: 2px solid black; top: 50%; transform: translateY(-50%);'></div>
  {/if}

  <div style="padding: 1px; width: 100%; display: flex; height: 25px; min-width: 80px;">
    {#if displayText != "TBD"}
      <!-- Seed -->
      <p style="margin: 0 2px; width: 23px; text-align: start;">{getSeed()}</p>

      <!-- Name -->
      <p style="margin: 0 2px;">{displayText}</p>
    {/if}
  </div>

  <!-- Tick After -->
  {#if (roundNumber != numRounds)}
    <div style="height:2px; background-color: black; width: 5px;"></div>
  {/if}
</div>