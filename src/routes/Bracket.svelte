<script lang="ts">
  import { Match, Entrant, type MatchParticipant } from '$lib/typedef'

  export let matches: Match[];
  export let entrants: Entrant[];

  let maxMatchesPerRound = entrants.length / 2;
  let rounds = Math.log2(entrants.length)

  let matchWidth = 100;
  let matchHeight = 60;
  let gapX = 30;
  let gapY = 20;

  let mousedown = false;

  let bracketArea: HTMLElement;
  let allMatchElements = new Array(matches.length);

  let debounceHideGlow: NodeJS.Timeout;

  //Function to set the position of feeder matches relative to the current match
  const setChildPositions = (match: Match): void => {
    let totalY = 0;
    match.participants.forEach((child: MatchParticipant, i: number) => {
      if (child.from) {
        child.from.visualPos.x = match.visualPos.x - matchWidth - gapX;

        //using round we know how tall the total children of the match are
        let childrenTall = Math.pow(2, child.from.round - 1);
        child.from.visualPos.y = match.visualPos.y + (childrenTall * (matchHeight + gapY)) * (i == 0 ? -1 : 1) * 0.5;
        setChildPositions(child.from);

        // totalY += setChildPositions(child.from) + matchHeight;
        // child.from.visualPos.y = match.visualPos.y + (setChildPositions(child.from) + matchHeight) * (i == 0 ? -1 : 1);
      }
    })
  }

  //Set the finals to be the root, then calculate backwards from there
  let finalMatch = matches[0];
  matches.forEach(i => finalMatch = i.round > finalMatch.round ? i : finalMatch);

  finalMatch.visualPos = {x: 0, y: 0}

  // Runs on load with a ref to the 2nd from top div (pos relative)
  function onLoad(displayArea: HTMLElement) {
    document.addEventListener("mouseup", handleMouseup);

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
    // allMatchElements[0].style.border = "5px solid green"
  }

  const handleMousedown = (ev: any) => {
    if (ev.button == 0)
      mousedown = true;
  }

  const handleMouseup = (ev: any) => {
    if (ev.button == 0)
      mousedown = false;
  }

  const handleMousemove = (ev: any) => {
    if (mousedown) {
      let dx = ev.movementX;
      let dy = ev.movementY;

      bracketArea.scroll({
        top: bracketArea.scrollTop - dy,
        left: bracketArea.scrollLeft - dx,
        behavior: "smooth",
      });
    }

    // return // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    if (debounceHideGlow) clearTimeout(debounceHideGlow);

    debounceHideGlow = setTimeout(() => {
      allMatchElements.forEach(e => {
        const blob = e.querySelector(".blob");

        blob.style.opacity = 0;
      })
    }, 1000)

    allMatchElements.forEach(e => {
      const blob = e.querySelector(".blob");
      const fblob = e.querySelector(".fake-blob");
      const rec = fblob.getBoundingClientRect();

      let maxD = 200;
      let d = Math.sqrt(Math.pow(ev.clientX - rec.left, 2) + Math.pow(ev.clientY - rec.top, 2));
      
      if (d > maxD)
        return

      blob.style.opacity = Math.min((maxD - d + 30) / maxD, 1);
    
      blob.animate(
        [
          {
            transform: `translate(${
              (ev.clientX - rec.left) - (rec.width / 2)
            }px,${(ev.clientY - rec.top) - (rec.height / 2)}px)`
          },
        ],
        {
          duration: 100,
          fill: "forwards"
        }
      );
    })
  }

</script>

<div bind:this={bracketArea} style="overflow: auto; flex-grow: 1; height: 100%; scroll-behavior: smooth !important;">
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div role="mark" on:mousedown={handleMousedown} on:mousemove={handleMousemove} use:onLoad style={`position: relative; width: ${rounds * matchWidth + (rounds-1) * gapX + 1}px; height: ${maxMatchesPerRound * matchHeight + (maxMatchesPerRound-1) * gapY}px;`}>
    {#each matches as match, i}
      <div style={`position: absolute; width: ${matchWidth}px; height: ${matchHeight}px; left: ${match.visualPos.x}px; top: ${match.visualPos.y}px;`}>
        <div bind:this={allMatchElements[i]} class="card">
          <div class="blob"></div>
          <div class="fake-blob"></div>
          <div class="card-inner">
            <div>
              <p>{match.id + 1}</p>
            </div>
            <div style="text-overflow: ellipsis; text-wrap: nowrap;">
              {#each match.participants as participant, j}
                <p style={`order: ${j * 5}; margin-left: 3px;`}>{participant.data?.name ?? 'W.O. ' + participant.from?.id ?? 'Oops'}</p>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  :root {
    --blob-ht: 155%;
  }

  * {
    color: white;
  }

  p {
    margin: 0px;
  }

  .card {
    overflow: hidden;
    margin: 0;
    background: rgb(88, 88, 88);
    border-radius: 10px;
    position: relative;
    transition: all 300ms ease-in-out;
    display: flex;
    align-items: stretch;
    z-index: -2;
  }

  .card-inner {
    border-radius: 7px;
    padding: 5px;
    flex-shrink: 1;
    overflow: hidden;
    background: rgba(0,0,0, 0.6);
    backdrop-filter: blur(80px);
    transition: all 300ms ease-in-out;
    display: flex;
    margin: 3px;
    flex-grow: 1;
  }

  .fake-blob {
    display: hidden;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    height: var(--blob-ht);
    aspect-ratio: 1/1;
    border-radius: 50%;
  }

  .blob {
    filter: blur(10px) opacity(50%);
    position: absolute;
    z-index: -1;
    top: 0;
    opacity: 0;
    left: 0;
    height: var(--blob-ht);
    aspect-ratio: 1/1;
    border-radius: 50%;
    background-color: #bbf;
    background-image: linear-gradient( 89.7deg, rgba(223,0,0,1) 2.7%, rgba(214,91,0,1) 15.1%, rgba(233,245,0,1) 29.5%, rgba(23,255,17,1) 45.8%, rgba(29,255,255,1) 61.5%, rgba(5,17,255,1) 76.4%, rgba(202,0,253,1) 92.4% );
    transition: all 100ms ease-in-out;
  }
</style>