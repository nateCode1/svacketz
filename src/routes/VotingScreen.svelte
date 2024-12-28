<script lang="ts">
  import { type Match, type MatchParticipant, Entrant, type MatchResult } from "$lib/typedef"; // Adjust the path as needed
  import { onMount } from "svelte";
	import AudioPlayer from "./AudioPlayer.svelte";

  export let match: Match | null = null;
  export let overlayVisible = false;
  export let maxParticipantsPerMatch = 2;
  export let resolveMatch: (match: Match, winner: Entrant) => void;

  export let close = () => {
    stopAudio();
    overlayVisible = false;
  };

  export const startVoting = (voteOn: Match) => {
    // TODO: Add check that all prerequisite matches have been resolved (i.e. no participants are dummy)
    overlayVisible = true;
    match = voteOn;

    setFocusedParticipant(0);
    debouncedCycleFocusedParticipant();
  }


  let focusedParticipant: number = 0;
  let audioManager: AudioPlayer;
  let cycleFocusedParticipantInterval: NodeJS.Timeout | null;

  const debouncedCycleFocusedParticipant = () => {
    if (cycleFocusedParticipantInterval != null)
      clearInterval(cycleFocusedParticipantInterval)
    if (overlayVisible)
      cycleFocusedParticipantInterval = setInterval(cycleFocusedParticipant, 2000)
  }

  const setFocusedParticipant = (index: number) => {
    focusedParticipant = index;
    updateAudioToFocused();
  }

  const cycleFocusedParticipant = () => {
    if (match) {
      focusedParticipant++;
      focusedParticipant %= match!.participants.length;
      updateAudioToFocused();
    }
  }

  const updateAudioToFocused = () => {
    audioManager.pauseMedia();
    let focused = match?.participants[focusedParticipant].data;
    if (focused?.mediaSrc && focused?.mediaType)
      audioManager.loadMedia(focused.mediaType, focused.mediaSrc)
  }

  const stopAudio = () => {
    audioManager.pauseMedia();
    if (cycleFocusedParticipantInterval)
      clearInterval(cycleFocusedParticipantInterval)
  }

  // --------- End of Audio -----------

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

{#each Array(maxParticipantsPerMatch) as _, i}
  <AudioPlayer bind:this={audioManager} onPlaybackUpdate={debouncedCycleFocusedParticipant} />
{/each}

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
        {#each match.participants as participant}
          <div class="participant-container">
            <h2>{participantDisplay(participant)}</h2>
            <button on:click={() => {selectWinner(participant.data)}}>Mark Winner</button>
          </div>
        {/each}
      </div>
    {/if}

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
    border: 2px solid white;
    border-radius: 5px;
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