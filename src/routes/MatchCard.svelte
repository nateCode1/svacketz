<script lang="ts">
  import { Match, Participant } from '../lib/typedef'

  export let match: Match;
  export let resolve: (winner: Participant) => void;
</script>

{#if !match.resolved}
  <div style="border-radius: 5px; border: 2px solid black; padding: 5px; margin: 5px 0;">
    <h3>Match {match.id + 1}</h3>
    <p>Set winner</p>
    {#each match.participants as participant}
      <button on:click={() => {resolve(participant)}} style="margin: 3px;">{participant.winner?.name ?? 'TBD'}</button>
    {/each}
    <p></p>
  </div>
{/if}

<style>
  h1, h2, h3 {
    margin-top: 4px;
    margin-bottom: 5px;
  }

  p {
    margin: 2px 0;
  }
</style>