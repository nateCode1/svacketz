<script lang="ts">
  import { Match, Entrant, Bracket, type MatchParticipant } from '$lib/bracket'
  import { type Connector, type Position } from '$lib/typedef';

  // export let participantsPerMatch: number;
  // export let matches: Match[];
  // export let entrants: Entrant[];
  export let bracket: Bracket;
  export let startVoting: (voteOn: Match) => void | null;
  
  let matchIdsToPos: matchIdToPos = {};

  [...bracket.allMatchesUpper, ...(bracket.allMatchesLower ?? []), bracket.grandFinals].forEach(i => matchIdsToPos[i.id] = {x: 0, y: 0})

  type matchIdToPos = {[key: number]: Position;}

  let connectorsUpper: Connector[] = [];
  let allConnectorsLower: Connector[] = [];
  let grandFinalsConnector: Connector;
  let maxMatchesPerRound = bracket.allEntrants.length / bracket.participantsPerMatch; // Todo: useless variable
  let rounds = Math.log2(bracket.allEntrants.length)

  const getMatchHeight = (nParticipants: number): number => 9 + 21 * nParticipants
  let matchWidth = 140;
  let matchHeight = getMatchHeight(bracket.participantsPerMatch);
  let gapX = 20;
  let gapY = 10;
  let connectorThickness = 3; // Todo: make even or odd based on gap

  let highlighted: MatchParticipant[] = [];

  let mousedown = false;

  let bracketArea: HTMLElement;
  let allMatchElements = new Array(bracket.allMatchesUpper.length + (bracket.allMatchesLower?.length ?? 0)); 

  let debounceHideGlow: NodeJS.Timeout;

  //Function to recursively get list of all feeder matches (drawn connections only)
  const getAllChildren = (match: Match): Match[] => {
    let allMatches = [match];
    match.participants.forEach((child: MatchParticipant) => {
      if (child.from && child.fromResult!.draw) allMatches.push(...getAllChildren(child.from))
    })
    return allMatches;
  }

  //Function to set the position of feeder matches relative to the current match
  const setChildPositions = (match: Match): Connector[] => {
    let allConnectors: Connector[] = [];
    let pos = matchIdsToPos[match.id];
    pos.x = match.round * (matchWidth + gapX);
    
    let i = 0;
    match.participants.forEach((child: MatchParticipant) => {
      if (child.from && child.fromResult!.draw) {

        let childPos = matchIdsToPos[child.from.id]

        childPos.x = child.from.round * (matchWidth + gapX);

        let numDrawnIncomingConnections = match.participants.filter(i => i.fromResult?.draw).length;

        let childrenTall = match.childrenTall;
        let numSourceMatches = match.participants.filter(i => i.fromResult && i.fromResult.draw && i.fromResult.to == match).length; 
        console.log("match.participants", match.participants)
        console.log("numSourceMatches", numSourceMatches)
        console.log("set", new Set(match.participants.filter(i => i.from && i.from.results[0].draw && i.from.results[0].to == match)))
        const yOffFromIndex = (i: number) => (numDrawnIncomingConnections == 1) ? gapY : (childrenTall/numSourceMatches) * (matchHeight + gapY) * (i - 0.5 * (numSourceMatches - 1))

        childPos.y = pos.y + yOffFromIndex(i);
        allConnectors.push(...setChildPositions(child.from));

        let yOff = matchHeight/2 - connectorThickness / 2;

        let matchConnector: Connector = {
          thickness: connectorThickness, 
          tickSize: (pos.x - (childPos.x + matchWidth))/2,
          x: (pos.x + (childPos.x + matchWidth))/2,
          top: ((numDrawnIncomingConnections == 1) ? pos.y : pos.y + yOffFromIndex(0)) + yOff,
          bottom: pos.y + yOffFromIndex(numSourceMatches - 1) + yOff,
          leftTicks: Array(numDrawnIncomingConnections).fill(0).map((_, i) => pos.y + yOffFromIndex(i) + yOff),
          rightTicks: [pos.y + yOff]
        };
        
        allConnectors.push(matchConnector);
        
        i++;
      }
    })
    
    return allConnectors;
  }

  function handleHover(match: Match, participant: MatchParticipant) {
    // TODO: search backwards
    highlighted = [participant]
    if (participant.data) {
      const addSourceToHighlighted = (p: MatchParticipant) => {
        let participantFrom = p.from?.participants.find(i => i.data == p.data);
        if (participantFrom) { 
          highlighted.push(participantFrom)
          addSourceToHighlighted(participantFrom)
        }
      }
      
      addSourceToHighlighted(participant)
    }
    else {
      const addDestinationToHighlighted = (m: Match, seed: number) => {
        let participantToIndex = m.results.findIndex(i => i.toParticipant?.theoreticalSeed == seed);
        if (participantToIndex != -1) {
          highlighted.push(m.results[participantToIndex].toParticipant!);
          addDestinationToHighlighted(m.results[participantToIndex].to!, seed);
        }
      }

      addDestinationToHighlighted(match, participant.theoreticalSeed);
    }
  }

  // Runs on load with a ref to the 2nd from top div (pos relative)
  function onLoad(displayArea: HTMLElement) {
    const getMatchesMinMaxPos = (matches: Match[]) => {
      let min: Position = {x: 0, y: 0}
      let max: Position = {x: 0, y: 0}

      matches.forEach(i => {
        min.x = Math.min(matchIdsToPos[i.id].x, min.x);
        min.y = Math.min(matchIdsToPos[i.id].y, min.y);
        max.x = Math.max(matchIdsToPos[i.id].x, max.x);
        max.y = Math.max(matchIdsToPos[i.id].y, max.y);
      })

      return {min, max}
    }

    const offsetConnectors = (connectors: Connector[], offset: Position) => {
      connectors.forEach(i => {
        i.x -= offset.x;
        i.top -= offset.y;
        i.bottom -= offset.y;
        i.leftTicks = i.leftTicks?.map(i => i - offset.y)
        i.rightTicks = i.rightTicks?.map(i => i - offset.y)
      })
    }

    const offsetMatches = (matches: Match[], offset: Position) => {
      matches.forEach(i => {
        matchIdsToPos[i.id].x -= offset.x;
        matchIdsToPos[i.id].y -= offset.y;
      })
    }

    //Set the finals to be the root, then calculate backwards from there
    let upperFinals = bracket.allMatchesLower ? bracket.allMatchesUpper[0] : bracket.grandFinals;
    bracket.allMatchesUpper.forEach(i => upperFinals = i.round > upperFinals.round ? i : upperFinals);
    matchIdsToPos[upperFinals.id] = {x: 0, y: 0}

    let lowerFinalRoundMatches: Match[] = [];
    if (bracket.allMatchesLower) {
      lowerFinalRoundMatches = [bracket.allMatchesLower[0]];
      // lowerFinals = i.round > lowerFinals!.round ? i : lowerFinals
      bracket.allMatchesLower.forEach(i => {
        if (i.round > lowerFinalRoundMatches[0].round) lowerFinalRoundMatches = [i]
        else if (i.round == lowerFinalRoundMatches[0].round) lowerFinalRoundMatches.push(i)
      });
      lowerFinalRoundMatches.forEach(i => matchIdsToPos[i.id] = {x: 0, y: 0})
    }

    document.addEventListener("mouseup", handleMouseup);

    connectorsUpper = setChildPositions(upperFinals);
    let {min: minUpper, max: maxUpper} = getMatchesMinMaxPos(bracket.allMatchesUpper);
    offsetMatches(bracket.allMatchesUpper, minUpper)
    offsetConnectors(connectorsUpper, minUpper);
    connectorsUpper = [...connectorsUpper] // trigger a rerender now that connectors is populated

    if (bracket.allMatchesLower) {
      lowerFinalRoundMatches.forEach((finalRoundMatch, i) => {
        let currentConnectorsLower = setChildPositions(finalRoundMatch!);
        let {min: minLower, max: maxLower} = getMatchesMinMaxPos(getAllChildren(finalRoundMatch));
        let {min: minUpperNew, max: maxUpperNew} = getMatchesMinMaxPos(i == 0 ? bracket.allMatchesUpper : getAllChildren(lowerFinalRoundMatches[i-1]));
        let manualExtraGap = i == 0 ? 40 : 0; // Only for gap between upper and lower
        let lowerBracketOffset = {x: minLower.x, y: minLower.y - maxUpperNew.y - matchHeight - manualExtraGap};
        offsetMatches(getAllChildren(finalRoundMatch), lowerBracketOffset);
        offsetConnectors(currentConnectorsLower, lowerBracketOffset);
        allConnectorsLower = [...allConnectorsLower, ...currentConnectorsLower]
      })

      let meanYPosLowerFinalRoundMatches = lowerFinalRoundMatches.map(i => matchIdsToPos[i.id].y).reduce((a,b) => a+b) / lowerFinalRoundMatches.length;
      let maxXPosLowerFinalRoundMatches = Math.max(...lowerFinalRoundMatches.map(i => matchIdsToPos[i.id].x));

      let grandFinalPos = matchIdsToPos[bracket.grandFinals.id];
      grandFinalPos.y = (matchIdsToPos[upperFinals.id].y + meanYPosLowerFinalRoundMatches) / 2;
      grandFinalPos.x = Math.max(matchIdsToPos[upperFinals.id].x, maxXPosLowerFinalRoundMatches) + matchWidth + gapX;

      let maxYPosLowerFinalRoundMatches = Math.max(...lowerFinalRoundMatches.map(i => matchIdsToPos[i.id].y));

      grandFinalsConnector = {
        thickness: connectorThickness, 
        tickSize: gapX/2,
        x: grandFinalPos.x - gapX/2,
        top: matchIdsToPos[upperFinals.id].y + matchHeight/2,
        bottom: maxYPosLowerFinalRoundMatches + matchHeight/2,
        leftTicks: [
          matchIdsToPos[upperFinals.id].y + matchHeight/2,
          ...lowerFinalRoundMatches.map(i => matchIdsToPos[i.id].y + matchHeight/2)
        ],
        rightTicks: [grandFinalPos.y + matchHeight/2]
      }
    }
    else {
      offsetMatches([bracket.grandFinals], minUpper)
    }

    // console.log("Upper bracket connectors", connectorsUpper)
    // console.log("Lower bracket connectors", connectorsLower)
    // console.log("All pos", Object.values(matchIdsToPos))
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

    return // !!!!!!!!!!!!!!!!!!!!!!!!!!!!! comment this to enable blob animations
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

  const logMatch = (m: Match) => {
    console.log(`Match ${m.id+1}\nRound ${m.round}\nParticipants: ${m.participants.map(i => i.theoreticalSeed+1)}\nTo: ${m.results.map(i => (i.to?.id ?? -1000)+1)}\nCT: ${m.childrenTall}`)
    console.log("Pos", matchIdsToPos[m.id])
  }

</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div role="mark" bind:this={bracketArea} on:mousedown={handleMousedown} on:mousemove={handleMousemove} style="overflow: auto; flex-grow: 1; height: 100%; scroll-behavior: smooth !important;">
  <div use:onLoad style={`position: relative; width: ${rounds * matchWidth + (rounds-1) * gapX + 1}px; height: ${maxMatchesPerRound * matchHeight + (maxMatchesPerRound-1) * Math.abs(gapY)}px;`}>
    {#each [...bracket.allMatchesUpper, ...(bracket.allMatchesLower ?? []), bracket.grandFinals] as match, i}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- TODO: Make match-containter into ready-match, and give it only if the match has no dummy participants -->
      <div on:click={() => {logMatch(match); startVoting(match)}} class="match-containter" style={`position: absolute; width: ${matchWidth}px; height: ${matchHeight}px; left: ${matchIdsToPos[match.id].x}px; top: ${matchIdsToPos[match.id].y}px;`}>
        <div bind:this={allMatchElements[i]} class="card">
          <!-- <div class="blob"></div> -->
          <!-- <div class="fake-blob"></div> -->
          <div class="card-inner">
            <div style="display: flex; align-items: center; padding: 3px; border-right: 1px solid #aaa; font-size: 1.2em;">
              <p>{match.id + 1}</p>
            </div>
            <div style="text-overflow: ellipsis; text-wrap: nowrap; display: flex; flex-direction: column; align-items: stretch; justify-content: space-between; width: 100%;">
              {#each match.participants as participant, j}
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                <div class={`participant ${highlighted.includes(participant) ? "highlighted-participant" : ""}`} style="display: flex; flex-grow: 1; padding: 2px; padding-left: 3px;" on:mouseover={() => handleHover(match, participant)} on:mouseleave={() => highlighted = []}>
                  <p style={`order: ${j * 5}; font-weight: bold; color: #aaa;`}>{participant.theoreticalSeed+1}</p>
                  <p style={`order: ${j * 5}; margin-left: 3px;`}>{participant.data?.name ?? ""}</p>
                </div>
                {#if j != match.participants.length - 1}
                  <div style="height: 1px; width: 100%; background-color: #aaa;"></div>
                {/if}
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/each}
    {#each [...connectorsUpper, ...allConnectorsLower, ...(grandFinalsConnector ? [grandFinalsConnector] : [])] as connector}
        <div style={`position: absolute; color: black; background-color: #abbaba; left: ${connector.x}px; top: ${connector.top}px; width: ${connector.thickness}px; border-radius: 100px; height: ${connector.bottom - connector.top + connector.thickness}px;`}>
        </div>
        {#if connector.leftTicks}
          {#each connector.leftTicks as tick}
            <div style={`position: absolute; color: black; background-color: #abbaba; left: ${connector.x - connector.tickSize}px; top: ${tick}px; width: ${connector.tickSize + connector.thickness/2}px; border-radius: 100px; height: ${connector.thickness}px;`}>
            </div>
          {/each}
        {/if}
        {#if connector.rightTicks}
          {#each connector.rightTicks as tick}
            <div style={`position: absolute; color: black; background-color: #abbaba; left: ${connector.x}px; top: ${tick}px; width: ${connector.tickSize + connector.thickness/2}px; border-radius: 100px; height: ${connector.thickness}px;`}>
            </div>
          {/each}
        {/if}
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
    font-size: 0.8em;
  }

  .card {
    overflow: hidden;
    margin: 0;
    background: rgb(88, 88, 88);
    border-radius: 10px;
    /* position: relative; */
    transition: all 300ms ease-in-out;
    display: flex;
    height: 100%;
    align-items: stretch;
    z-index: -2;
  }

  .card-inner {
    border-radius: 7px;
    padding: 0;
    flex-shrink: 1;
    overflow: hidden;
    background-color: rgba(0,0,0,0.6);
    backdrop-filter: blur(80px);
    transition: all 300ms ease-in-out;
    display: flex;
    margin: 3px;
    flex-grow: 1;
  }
  
  .match-containter:hover .card-inner {
    background-color: rgba(60, 60, 60, 0.3)
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
    filter: blur(10px) opacity(80%);
    position: absolute;
    z-index: -1;
    top: 0;
    opacity: 0;
    left: 0;
    height: var(--blob-ht);
    aspect-ratio: 1/1;
    border-radius: 50%;
    background-color: #bbf;
    /* background-image: linear-gradient( 89.7deg, rgba(223,0,0,1) 2.7%, rgba(214,91,0,1) 15.1%, rgba(233,245,0,1) 29.5%, rgba(23,255,17,1) 45.8%, rgba(29,255,255,1) 61.5%, rgba(5,17,255,1) 76.4%, rgba(202,0,253,1) 92.4% ); */
    transition: all 100ms ease-in-out;
  }

  .participant {
    transition: 0.3s all;
  }

  .highlighted-participant {
    background-color: rgb(43, 77, 83);
  }
</style>