<script lang="ts">
	import MatchCard from "./MatchCard.svelte";
  import { Match, Entrant } from '$lib/typedef'
  import type { EntrantInfo, MatchParticipant, MatchResult } from '../lib/typedef'
	import Bracket from './Bracket.svelte';

  let rawParticipants = [
    "david", "ahmad", "nathan", "luke", "asher", "olivia", "emily", "liam", "ava", "noah", "isabella", "mason", "sophia", "jackson", "oliver", "amelia", "ethan", "mia", "logan", "lucas", "harper", "abigail", "alexanderiania", "ella", "carter", "avery", "henry", "mila", "owen", "scarlett", "wyatt", "eva", "jayden", "leah", "nicholas", "zoey", "caleb", "penelope", "isaac", "lily", "gabriel", "chloe", "jaxon", "madison", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "wyatt", "zoey", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "elijah", "hazel", "jacob", "ella", "julian", "lillian", "adam", "aria", "ryan", "aubree", "nathan", "sophie", "levi", "amelia", "ethan", "mia", "logan", "lucas", "harper", "abigail", "alexander", "ella", "carter", "avery", "henry", "mila", "owen", "scarlett", "wyatt", "eva", "jayden", "leah", "nicholas", "zoey", "caleb", "penelope", "isaac", "lily", "gabriel", "chloe", "jaxon", "madison", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "elijah", "hazel", "jacob", "ella", "julian", "lillian", "adam", "aria", "ryan", "aubree"
  ].slice(0,30);

  let allEntrants: Entrant[] = rawParticipants.map((i: string, n) => new Entrant(n+1, i));
  let allMatches: Match[] = [];

  const pPerMatch = 4;

  const GenerateMatches = () => {
    //Fill in with dummy people, ensure their seed is worse
    while (Math.log10(allEntrants.length) / Math.log10(pPerMatch) % 1 != 0)
      allEntrants.push(new Entrant(allEntrants[allEntrants.length - 1].id + 1, "BYE", Infinity, true))

    //Sort participants by seed
    let sortedParticipants = [... allEntrants].sort((a,b) => a.seed - b.seed);
    sortedParticipants = sortedParticipants.map((i,j) => {
      i.seed = j+1;
      return i;
    })
    
    //find the order of participants in round 1 by seed
    let posRound1 = Array(sortedParticipants.length).fill(0);

    //This code will fill posRound1 with what position in the list of entrants the ith seed should be at
    for (var i = 0; i <= Math.log2(posRound1.length); i++) {
      for (var j = 1; j <= posRound1.length; j++) {
        let myRank = Math.floor((j - 1) / Math.pow(2, i)) + 1;
        posRound1[j - 1] += (Math.floor(myRank % 4 / 2) * Math.pow(2, Math.floor(Math.log2(posRound1.length) - i - 1)));
      }
    }

    //Set the first round to be the sorted participants in the correct order
    sortedParticipants.forEach((i, n) => allEntrants[posRound1[n]] = i)

    // create n rounds
    const bufferSize = Math.log10(allEntrants.length) / Math.log10(pPerMatch);
    let matchesToBeResolved = new Array(); //match buffer
    for (let i = 0; i < bufferSize; i++) matchesToBeResolved[i] = new Array(pPerMatch - 1).fill(false);
    let currMatchId = 0;

    console.log(matchesToBeResolved)

    //Utility to make a match
    const createMatch = (round: number, participants: MatchParticipant[]) => {
      let currMatch = new Match(
        currMatchId++,
        round,
        participants
      )
      currMatch.results[0].draw = true;
      allMatches.push(currMatch);
      return currMatch;
    }

    // GENERATE THE MATCHES
    // Works by looping through all the entrants n at a time, and generating a match for each pair
    // When a match is generated it is added to a buffer corresponding to what round its in
    // If a match is to be added to a full buffer, a new match is created between the match in the buffer, and the match set to be added
    for (var i = 0; i < allEntrants.length; i += pPerMatch) {
      let order = 0;
      console.log("i", i)

      //create the first round match
      let firstRoundParticipants = []
      for (let j = i; j < i + pPerMatch; j++) firstRoundParticipants.push({from: undefined, data: allEntrants[j]})
      let newMatch = createMatch(
        order + 1,
        firstRoundParticipants
      )

      while (true) {
        //attempt to add to buffer
        if (!matchesToBeResolved[order].some((i:any) => !i)) {
          let oldMatch = newMatch;
          //create new match if the buffer is full
          newMatch = createMatch(
            order + 2,
            [...matchesToBeResolved[order].map((i: Match) => {return {from: i, data: undefined}}),
            {from: oldMatch, data: undefined}]
          )

          //set the winners of the two previous matches to go to the new match
          oldMatch.results[0].to = newMatch;
          matchesToBeResolved[order].forEach((i: Match) => i.results[0].to = newMatch);

          //empty the buffer
          matchesToBeResolved[order] = new Array(pPerMatch - 1).fill(false);
          order++;
        }
        else {
          //add to buffer and break
          matchesToBeResolved[order][matchesToBeResolved[order].indexOf(false)] = newMatch;
          break;
        }
      }
    }

    allMatches.forEach(i => {
      if (i.participants.reduce((count, curr) => count + (curr.data?.isDummy ? 0 : 1), 0) == 1) 
        resolveMatch(i, i.participants.find(j => !j.data!.isDummy)!.data!)
    })
  }
  GenerateMatches()
  console.log("All ", allMatches)

  const roundNumberToTitle = (rn: number) => {
    let roundTitles: any = {
      8: "Quarter-Finals",
      4: "Semi-Finals",
      2: "Grand Final",
    }
    let rOf = Math.pow(2, allMatches.length - rn);
    return roundTitles[rOf] ?? ("Round of " + rOf)
  }

  function resolveMatch(match: Match, winner: Entrant) {
    match.resolved = true;
    match.results[0].data = winner;
    match.results[0].to!.participants.find(i => i.from == match)!.data = winner;

    allMatches[match.id] = match.copyOf;
  }

</script>

<h1>Welcome to Svaketz</h1>

<div style="display: flex; justify-content: space-between; width: 100%; gap: 8px; height: 80vh;">
  <Bracket participantsPerMatch={pPerMatch} entrants={allEntrants} matches={allMatches}/>
  <!-- <div style="display: flex; flex-direction: row; align-items: stretch; height: fit-content;">
    <div style="display: flex; flex-direction: column; justify-content: space-around;">
       {#each allParticipants as p, i (p.id)}
          <TournamentSlot seed={p.seed} displayText={p.name} index={i} roundNumber={0} numRounds={allMatches.length} />
        {/each}
     </div>
    {#each allMatches as r, rn}
      <div style="display: flex; flex-direction: column; justify-content: space-around;">
        {#each r as match, i}
          <TournamentSlot seed={match.resolved ? match.winner.seed : -1} displayText={match.winner?.name ?? "TBD"} index={i} roundNumber={rn + 1} numRounds={allMatches.length} /> 
        {/each}
      </div>
    {/each}
  </div> -->

  <div style="border-radius: 5px; display: flex; flex-direction: column; padding: 8px; overflow-y: auto; padding: 10px; min-width: 450px;">
    <h1 style="text-align: center; margin-bottom: 20px;">Matches</h1>
      {#each allMatches as match}
        <!-- {#if allMatches[rn].some(i => i.resolved == false)}
          <h2 style="margin-top: 15px;">{roundNumberToTitle(rn)}</h2>
        {/if} -->
        <MatchCard resolve={(winner) => {resolveMatch(match, winner)}} bind:match={match} />
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
    color: white;
  }

  p {
    margin-top: 3px;
    margin-bottom: 3px;
  }
</style>