<script lang="ts">
  import { Match, Entrant, type MatchParticipant } from '$lib/typedef'

  export let match: Match;
  export let resolve: (winner: Entrant) => void;
</script>

{#if !match.resolved && match.participants.every(i => i.data)}
  <div style={`border-radius: 5px; border: 2px solid black; padding: 5px; margin: 5px 0; order: ${match.round * 1000 + match.id};`}>
    <h3>Match {match.id + 1}</h3>
    <p>Set winner</p>
    {#each match.participants.filter(i => i.data && !i.data.isDummy) as participant}
      <button on:click={() => {resolve(participant.data)}} style="margin: 3px;">{participant.data?.name ?? 'TBD'}</button>
    {/each}
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