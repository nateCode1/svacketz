<script lang="ts">
  import { writable } from 'svelte/store';
	import MatchCard from "./MatchCard.svelte";
  import TournamentSlot from "./TournamentSlot.svelte";
  import { Match, Participant } from '$lib/typedef'
  import type { ParticipantInfo } from '../lib/typedef'
	import Bracket from './Bracket.svelte';

  let rawParticipants = [
    "david", "ahmad", "nathan", "luke", "asher", "olivia", "emily", "liam", "ava", "noah", "isabella", "mason", "sophia", "jackson", "oliver", "amelia", "ethan", "mia", "logan", "lucas", "harper", "abigail", "alexander", "ella", "carter", "avery", "henry", "mila", "owen", "scarlett", "wyatt", "eva", "jayden", "leah", "nicholas", "zoey", "caleb", "penelope", "isaac", "lily", "gabriel", "chloe", "jaxon", "madison", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "wyatt", "zoey", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "elijah", "hazel", "jacob", "ella", "julian", "lillian", "adam", "aria", "ryan", "aubree", "nathan", "sophie", "levi", "amelia", "ethan", "mia", "logan", "lucas", "harper", "abigail", "alexander", "ella", "carter", "avery", "henry", "mila", "owen", "scarlett", "wyatt", "eva", "jayden", "leah", "nicholas", "zoey", "caleb", "penelope", "isaac", "lily", "gabriel", "chloe", "jaxon", "madison", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "elijah", "hazel", "jacob", "ella", "julian", "lillian", "adam", "aria", "ryan", "aubree"
  ].slice(0,35);

  let allParticipants: Participant[] = rawParticipants.map((i: string, n) => new Participant(n+1, i));

  let allMatches: Match[][] = [];

  // --- Parameters ---
  var participantsPerMatch = 2;
  // --- ---------- ---

  const GenerateMatches = () => {
    //Fill in with dummy people
    while (Math.log10(allParticipants.length) / Math.log10(participantsPerMatch) % 1 != 0)
      allParticipants.push(new Participant(allParticipants[allParticipants.length - 1].id + 1, "BYE", 1, true))

    //Sort participants by seed
    let sortedParticipants = [... allParticipants].sort((a,b) => a.seed - b.seed);
    sortedParticipants = sortedParticipants.map((i,j) => {
      i.seed = j+1;
      return i;
    })
    
    //find the order of participants in round 1 by seed
    let posRound1 = Array(sortedParticipants.length).fill(0);

    for (var i = 0; i <= Math.log2(posRound1.length); i++) {
      for (var j = 1; j <= posRound1.length; j++) {
        let myRank = Math.floor((j - 1) / Math.pow(2, i)) + 1;
        posRound1[j - 1] += (Math.floor(myRank % 4 / 2) * Math.pow(2, Math.floor(Math.log2(posRound1.length) - i - 1)));
      }
    }

    //Set the first round to be the sorted participants in the correct order
    sortedParticipants.forEach((i, n) => allParticipants[posRound1[n]] = i)

    let roundNumber = 1;
    let prevRound: Match[] = [];
    let prevRoundLength = allParticipants.length;
    do {
      let matchId = 0;
      let currRound = allMatches[allMatches.push([]) - 1]
      for (var i = 0; i < prevRoundLength; i+=participantsPerMatch) {
        var currMatchParticipants: (Match | Participant)[] = []
        for (var j = i; j < i + participantsPerMatch; j++) {
          if (roundNumber == 1 && allParticipants[j]) currMatchParticipants.push(allParticipants[j]);
          else if (prevRound[j]) {
            currMatchParticipants.push(prevRound[j]);
          }
        }
        
        var thisMatch = new Match(matchId++, currMatchParticipants.map(i => i.winner), roundNumber)
        currRound.push(thisMatch);
        currMatchParticipants.forEach(p => {if (p instanceof Match) p.feeds = thisMatch});

      }

      prevRound = currRound;
      prevRoundLength = prevRound.length;
      roundNumber++;
    } while (prevRound.length > 1);

    allMatches[0].forEach(i => {
      if (i.participants.reduce((count, curr) => count + (curr.isDummy ? 0 : 1), 0) == 1) 
        resolveMatch(i, i.participants.find(j => !j.isDummy)!)
    })
  }
  GenerateMatches()

  const roundNumberToTitle = (rn: number) => {
    let roundTitles: any = {
      8: "Quarter-Finals",
      4: "Semi-Finals",
      2: "Grand Final",
    }
    let rOf = Math.pow(participantsPerMatch, allMatches.length - rn);
    return roundTitles[rOf] ?? ("Round of " + rOf)
  }

  function resolveMatch(match: Match, winner: Participant) {
    match.resolved = true;
    match.winner = winner;

    let indInNext = match.feeds?.participants.findIndex(i => i.from!.id == match.id && i.from!.round == match.round) 
    if (indInNext != -1 && match.feeds) {
      match.feeds!.participants[indInNext!].setTo(winner);
    }

    if (match.feeds) allMatches[match.feeds.round - 1][match.feeds.id] = match.feeds.copyOf;
    else allMatches[match.round - 1][match.id] = match.copyOf;
  }

</script>

<h1>Welcome to Svaketz</h1>

<div style="display: flex; justify-content: space-between; width: 100%; gap: 8px;">
  <!-- <Bracket matches={allMatches}/> -->
  <div style="display: flex; flex-direction: row; align-items: stretch; height: fit-content;">
    <div style="display: flex; flex-direction: column; justify-content: space-around;">
       {#each allParticipants as p, i (p.id)}
          <TournamentSlot seed={p.seed} displayText={p.name} index={i} roundNumber={0} numRounds={allMatches.length} />
        {/each}
     </div>
    {#each allMatches as r, rn}
      <div style="display: flex; flex-direction: column; justify-content: space-around;">
        {#each r as match, i (match.winner)}
          <TournamentSlot seed={match.resolved ? match.winner.seed : -1} displayText={match.winner?.name ?? "TBD"} index={i} roundNumber={rn + 1} numRounds={allMatches.length} /> 
        {/each}
      </div>
    {/each}
  </div>

  <div style="border-radius: 5px; padding: 8px; border: 4px double black; overflow-y: auto; padding: 10px; min-width: 450px;">
    <h1 on:click={() => console.log("All matches", allMatches)} style="text-align: center;">Matches</h1>
      {#each allMatches as round, rn}
        {#if allMatches[rn].some(i => i.resolved == false)}
          <h2 style="margin-top: 15px;">{roundNumberToTitle(rn)}</h2>
        {/if}
        {#each round as match}
          <MatchCard resolve={(winner) => {resolveMatch(match, winner)}} bind:match={match} />
        {/each}
      {/each}
  </div>
</div>

<style>
  .hover {
    transition: 0.2s transform;
  }

  .hover:hover {
    transform: translateY(-3px);
  }

  h1, h2, h3 {
    margin-top: 4px;
    margin-bottom: 5px;
  }

  p {
    margin-top: 3px;
    margin-bottom: 3px;
  }

  * {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
</style>