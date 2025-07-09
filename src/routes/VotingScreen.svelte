<script lang="ts">
  import { onMount } from "svelte";
	import MediaPlayer from "./Media/MediaPlayer.svelte";
	import { Match, Entrant, type MatchParticipant, type MatchResult } from "$lib/bracket";
	import { MediaType } from "$lib/typedef";
  
  export let match: Match | null = null;
  export let overlayVisible = false;
  export let resolveMatch: (match: Match, placements: Entrant[]) => void;
  export let repeatPreviews = false;

  export let close = () => {
    mediaManager.stop();
    overlayVisible = false;
  };

  export const startVoting = (voteOn: Match) => {
    // TODO: Add check that all prerequisite matches have been resolved (i.e. no participants are dummy)
    overlayVisible = true;
    match = voteOn;

    // re-initalize placements
    match?.participants.forEach(i => placements[i.data!.seed] = 999);

    focusedParticipantIndex = 0;
    if (match!.participants[focusedParticipantIndex].data?.media.mediaType != MediaType.NONE)
      mediaManager.preview(match!.participants[focusedParticipantIndex].data?.media!)
    else 
      if (previewNextNoMediaTimeout) clearTimeout(previewNextNoMediaTimeout)
      previewNextNoMediaTimeout = setTimeout(previewNext, 2000)
  }

  let previewNextNoMediaTimeout: NodeJS.Timeout | undefined;

  let focusedParticipantIndex: number = 0;
  let mediaManager: MediaPlayer;

  let placements: entrantSeedToPlacement = {};

  type entrantSeedToPlacement = {[key: number]: number;}

  onMount(() => mediaManager.init())

  const previewNext = () => {
    focusedParticipantIndex++
    if (repeatPreviews) focusedParticipantIndex %= match!.participants.length;
    if (focusedParticipantIndex < match!.participants.length && match!.participants[focusedParticipantIndex].data?.media.mediaType != MediaType.NONE)
      mediaManager.preview(match!.participants[focusedParticipantIndex].data?.media!)
    else {
      mediaManager.stop()
      if (previewNextNoMediaTimeout) clearTimeout(previewNextNoMediaTimeout)
      previewNextNoMediaTimeout = setTimeout(previewNext, 2000)
    }
  }

  const participantDisplay = (participant: MatchParticipant): string => {
    if (participant.data) {
      return participant.data.name;
    }
    return participant.from ? `From Match ${participant.from.id}` : "Unknown";
  };

  const resultDisplay = (result: MatchResult): string => {
    if (result.data) {
      return result.data.name;
    }
    return result.to ? `Advances to Match ${result.to.id}` : "TBD";
  };

  const setPlacement = (winner: Entrant, placement: number) => {
    let alreadyHasPlacement = match!.participants.filter(i => placements[i.data?.seed ?? -1] == placement);
    alreadyHasPlacement.forEach(i => setPlacement(i.data!, placements[i.data!.seed]+1))
    
    placements[winner.seed] = placement;
  }

  const endVoting = () => {
    let placementArray: Entrant[] = match?.participants.filter(i => i.data).map(i => i.data!).sort((a,b) => placements[a!.seed] - placements[b!.seed]);
    resolveMatch(match!, placementArray);
    if (previewNextNoMediaTimeout) clearTimeout(previewNextNoMediaTimeout)
    close();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="overlay {overlayVisible ? 'visible' : ''}" on:click="{close}">

  <div class="content" on:click|stopPropagation>
    {#if match}
      <div style="display: flex; justify-content: space-between;">
        <h2 style="margin: 0;">Match {match.id}</h2>
        <p style="margin: 0;">Round: {match.round}</p>
      </div>

      <h3>Participants</h3>
      <div class="all-participant-containter">
        {#each match.participants as participant, i}
          {#if participant.data}
            <div class={`participant-container ${i == focusedParticipantIndex ? 'participant-container-focused' : ''}`}>
              <h2>{participantDisplay(participant)}</h2>
              {#each Array(match.participants.length).fill(0).map((_,j) => j+1) as i}
                <button class={`${(placements[participant.data.seed] == i) ? "selected-placement" : ""}`} on:click={() => {if (participant.data) setPlacement(participant.data, i)}}>{i}</button>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    {/if}
    
    <MediaPlayer
      maxPreviewLength={10} 
      previewDoneCallback={previewNext} 
      bind:this={mediaManager} 
    />

    <button on:click={() => endVoting()}>End voting</button>

    {#if !match}
      <p>No match data available.</p>
    {/if}
    <button on:click={close}>Cancel</button>
  </div>
</div>


<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    display: none;
    transition: opacity 0.3s ease-in-out;
  }

  .overlay.visible {
    display: flex;
    opacity: 1;
  }

  .content {
    background-color: #1d1d1f;
    border: 4px solid #4c4c4c;
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 800px;
    text-align: left;
    color: #ddd;
  }

  .all-participant-containter {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .participant-container {
    padding: 15px;
    border: 2px solid gray;
    color: gray;
    border-radius: 5px;
    transition: 0.2s all;
    margin-bottom: 20px;
  }

  .participant-container-focused {
    border: 2px solid white;
    color: white;
    transform: scale(1.15);
  }

  .selected-placement {
    background-color: rgb(200,200,255);
  }

  h2 {
    margin-top: 0;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin: 5px 0;
  }
</style>