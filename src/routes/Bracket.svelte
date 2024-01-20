<script lang="ts">
  import { Match, Participant } from '$lib/typedef'

  export let matches: Match[][];

  let matchWidth = 100;
  let matchHeight = 60;
  let gapX = 30;
  let gapY = 10;
</script>

<div style="overflow: auto;">
  <div style={`position: relative; width: ${matches.length * matchWidth + (matches.length-1) * gapX}px; height: ${matches[0].length * matchHeight + (matches[0].length-1) * gapY}px; border: 1px solid blue;`}>
    {#each matches as round, rn}
      {#each round as match, mn}
        <div style={`border: 1px solid green; position: absolute; width: ${matchWidth}px; height: ${matchHeight}px; left: ${rn * matchWidth + rn * gapX}px; top: ${mn * matchHeight + mn * gapY}px;`}>
          <div style="margin: 5px;">
            {#each match.participants as participant}
              <p>{participant.name}</p>
            {/each}
          </div>
        </div>
      {/each}
    {/each}
  </div>
</div>

<style>
  p {
    margin: 0px;
  }
</style>