<script lang="ts">
  import { Match, Entrant, type MatchParticipant } from '$lib/typedef'
	import AudioPlayer from './AudioPlayer.svelte';

  export let match: Match;
  export let startVoting: (voteOn: Match) => void | null;
</script>

{#if !match.resolved && match.participants.every(i => i.data)}
  <div class="card" style={`order: ${match.round * 1000 + match.id};`}>
    <h2>Match {match.id + 1}</h2>
    <p>Set winner</p>
    <div style="display: flex; width: 100%;">
      <button on:click={() => {startVoting(match)}} style="margin: 3px;">Resolve Match</button>
    </div>
  </div>
{/if}

<style>
  * {
    color: #ccc;
  }
  
  button {
    color: #ccc;
    border: 2px solid #585858;
    border-radius: 3px;
    background-color: #333;
    padding: 3px;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 2px;
    font-size: 1.1rem;
    transition: all 0.2s;
  }

  button:hover {
    background-color: #444;
    transform: translateY(-3px);
  }

  h1, h2, h3 {
    margin-top: 4px;
    margin-bottom: 5px;
  }

  p {
    margin: 2px 0;
    font-size: 1.1rem;
  }
  
  .card {
    border-radius: 5px;
    border: 2px solid #585858;
    padding: 5px;
    margin: 5px 0;
  }
</style>