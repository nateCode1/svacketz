<script lang="ts">
  import { Match, Entrant, type MatchParticipant } from '$lib/typedef'

  export let matches: Match[];
  export let entrants: Entrant[];

  let maxMatchesPerRound = entrants.length / 2;
  let rounds = Math.log2(entrants.length) 

  let matchWidth = 100;
  let matchHeight = 60;
  let gapX = 30;
  let gapY = 10;

  //Function to set the position of feeder matches relative to the current match
  const setChildPositions = (match: Match): number => {
    let totalY = 0;
    match.participants.forEach((child: MatchParticipant, i: number) => {
      if (child.from) {
        child.from.visualPos.x = match.visualPos.x - matchWidth - gapX;

        totalY += setChildPositions(child.from) + matchHeight;
        child.from.visualPos.y = match.visualPos.y + (setChildPositions(child.from) + matchHeight) * (i == 0 ? -1 : 1);
      }
      else
        return matchHeight;
    })
    return totalY;
  }

  //Set the finals to be the root, then calculate backwards from there
  let finalMatch = matches[0];
  matches.forEach(i => finalMatch = i.round > finalMatch.round ? i : finalMatch);

  finalMatch.visualPos = {x: 0, y: 0}
  setChildPositions(finalMatch);
  setChildPositions(finalMatch);

  let minX = 0;
  let minY = 0;

  matches.forEach(i => {
    minX = i.visualPos.x < minX ? i.visualPos.x : minX;
    minY = i.visualPos.y < minY ? i.visualPos.y : minY;
  })

  matches.forEach(i => {
    i.visualPos.x -= minX;
    i.visualPos.y -= minY;
  })

</script>

<div style="overflow: auto; flex-grow: 1; height: 100%;">
  <div style={`position: relative; width: ${rounds * matchWidth + (rounds-1) * gapX + 1}px; height: ${maxMatchesPerRound * matchHeight + (maxMatchesPerRound-1) * gapY}px;`}>
    {#each matches as match, mn}
      <div style={`border: 1px solid green; position: absolute; width: ${matchWidth}px; height: ${matchHeight}px; left: ${match.visualPos.x}px; top: ${match.visualPos.y}px;`}>
        <div style="margin: 5px; display: flex; gap: 5px;">
          <div style="display: flex; align-items:center;">
            <p>{match.id + 1}</p>
          </div>
          <div>
            {#each match.participants as participant}
              <p>{participant.data?.name ?? 'W.O. ' + participant.from?.id ?? 'Oops'}</p>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  p {
    margin: 0px;
  }
</style>