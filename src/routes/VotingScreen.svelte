<script lang="ts">
  import { type Match, type MatchParticipant, Entrant, type MatchResult } from "$lib/typedef"; // Adjust the path as needed
  import { onMount } from "svelte";
	import MediaPlayer from "./Media/MediaPlayer.svelte";
  
  export let match: Match | null = null;
  export let overlayVisible = false;
  export let resolveMatch: (match: Match, winner: Entrant) => void;
  export let repeatPreviews = false;

  export let close = () => {
    mediaManager.stop();
    overlayVisible = false;
  };

  export const startVoting = (voteOn: Match) => {
    // TODO: Add check that all prerequisite matches have been resolved (i.e. no participants are dummy)
    overlayVisible = true;
    match = voteOn;

    focusedParticipantIndex = 0;
    if (match!.participants[focusedParticipantIndex].data?.media)
      mediaManager.preview(match!.participants[focusedParticipantIndex].data?.media!)
  }

  let focusedParticipantIndex: number = 0;
  let mediaManager: MediaPlayer;

  onMount(() => mediaManager.init())

  const previewNext = () => {
    focusedParticipantIndex++
    if (repeatPreviews) focusedParticipantIndex %= match!.participants.length;
    if (focusedParticipantIndex < match!.participants.length && match!.participants[focusedParticipantIndex].data?.media)
      mediaManager.preview(match!.participants[focusedParticipantIndex].data?.media!)
    else
      mediaManager.stop()
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

  const selectWinner = (winner?: Entrant) => {
    // This if statement condition is theoretically always true
    if (winner && match)
      resolveMatch(match, winner);

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
          <div class={`participant-container ${i == focusedParticipantIndex ? 'participant-container-focused' : ''}`}>
            <h2>{participantDisplay(participant)}</h2>
            <button on:click={() => {selectWinner(participant.data)}}>Mark Winner</button>
          </div>
        {/each}
      </div>

    {/if}
    
    <MediaPlayer
      maxPreviewLength={10} 
      previewDoneCallback={previewNext} 
      bind:this={mediaManager} 
    />

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