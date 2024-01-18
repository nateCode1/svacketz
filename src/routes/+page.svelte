<script lang="ts">
  import { writable } from 'svelte/store';
	import MatchCard from "./MatchCard.svelte";
  import TournamentSlot from "./TournamentSlot.svelte";
  import { Match, Participant } from '../lib/typedef'
  import type { ParticipantInfo } from '../lib/typedef'

  let rawParticipants: ParticipantInfo[] = [
    {id: 1, name: "david"},
    {id: 2, name: "ahmad"},
    {id: 3, name: "nathan"},
    {id: 4, name: "luke"},
    {id: 5, name: "asher"},
    {id: 6, name: "olivia"},
    {id: 7, name: "emily"},
    {id: 8, name: "liam"},
    {id: 9, name: "ava"},
    {id: 10, name: "noah"},
    {id: 11, name: "isabella"},
    {id: 12, name: "mason"},
    {id: 13, name: "sophia"},
    {id: 14, name: "jackson"},
    {id: 15, name: "oliver"},
    {id: 16, name: "amelia"},
    {id: 17, name: "ethan"},
    {id: 18, name: "mia"},
    {id: 19, name: "logan"},
    {id: 20, name: "lucas"},
    {id: 21, name: "harper"},
    {id: 22, name: "abigail"},
    {id: 23, name: "alexander"},
    {id: 24, name: "ella"},
    {id: 25, name: "carter"},
    {id: 26, name: "avery"},
    {id: 27, name: "henry"},
    {id: 28, name: "mila"},
    {id: 29, name: "owen"},
    {id: 30, name: "scarlett"},
    {id: 31, name: "wyatt"},
    {id: 32, name: "eva"},
    // {id: 33, name: "jayden"},
    // {id: 34, name: "leah"},
    // {id: 35, name: "nicholas"},
    // {id: 36, name: "zoey"},
    // {id: 37, name: "caleb"},
    // {id: 38, name: "penelope"},
    // {id: 39, name: "isaac"},
    // {id: 40, name: "lily"},
    // {id: 41, name: "gabriel"},
    // {id: 42, name: "chloe"},
    // {id: 43, name: "jaxon"},
    // {id: 44, name: "madison"},
    // {id: 45, name: "joseph"},
    // {id: 46, name: "aubrey"},
    // {id: 47, name: "dylan"},
    // {id: 48, name: "adeline"},
    // {id: 49, name: "jaden"},
    // {id: 50, name: "layla"},
    // {id: 51, name: "gavin"},
    // {id: 52, name: "riley"},
    // {id: 53, name: "michael"},
    // {id: 54, name: "grace"},
    // {id: 55, name: "wyatt"},
    // {id: 56, name: "zoey"},
    // {id: 57, name: "joseph"},
    // {id: 58, name: "aubrey"},
    // {id: 59, name: "dylan"},
    // {id: 60, name: "adeline"},
    // {id: 61, name: "jaden"},
    // {id: 62, name: "layla"},
    // {id: 63, name: "gavin"},
    // {id: 64, name: "riley"},
    // {id: 65, name: "michael"},
    // {id: 66, name: "grace"},
    // {id: 67, name: "elijah"},
    // {id: 68, name: "hazel"},
    // {id: 69, name: "jacob"},
    // {id: 70, name: "ella"},
    // {id: 71, name: "julian"},
    // {id: 72, name: "lillian"},
    // {id: 73, name: "adam"},
    // {id: 74, name: "aria"},
    // {id: 75, name: "ryan"},
    // {id: 76, name: "aubree"},
    // {id: 77, name: "nathan"},
    // {id: 78, name: "sophie"},
    // {id: 79, name: "levi"},
    // {id: 80, name: "amelia"},
    // {id: 81, name: "ethan"},
    // {id: 82, name: "mia"},
    // {id: 83, name: "logan"},
    // {id: 84, name: "lucas"},
    // {id: 85, name: "harper"},
    // {id: 86, name: "abigail"},
    // {id: 87, name: "alexander"},
    // {id: 88, name: "ella"},
    // {id: 89, name: "carter"},
    // {id: 90, name: "avery"},
    // {id: 91, name: "henry"},
    // {id: 92, name: "mila"},
    // {id: 93, name: "owen"},
    // {id: 94, name: "scarlett"},
    // {id: 95, name: "wyatt"},
    // {id: 96, name: "eva"},
    // {id: 97, name: "jayden"},
    // {id: 98, name: "leah"},
    // {id: 99, name: "nicholas"},
    // {id: 100, name: "zoey"},
    // {id: 101, name: "caleb"},
    // {id: 102, name: "penelope"},
    // {id: 103, name: "isaac"},
    // {id: 104, name: "lily"},
    // {id: 105, name: "gabriel"},
    // {id: 106, name: "chloe"},
    // {id: 107, name: "jaxon"},
    // {id: 108, name: "madison"},
    // {id: 109, name: "joseph"},
    // {id: 110, name: "aubrey"},
    // {id: 111, name: "dylan"},
    // {id: 112, name: "adeline"},
    // {id: 113, name: "jaden"},
    // {id: 114, name: "layla"},
    // {id: 115, name: "gavin"},
    // {id: 116, name: "riley"},
    // {id: 117, name: "michael"},
    // {id: 118, name: "grace"},
    // {id: 119, name: "elijah"},
    // {id: 120, name: "hazel"},
    // {id: 121, name: "jacob"},
    // {id: 122, name: "ella"},
    // {id: 123, name: "julian"},
    // {id: 124, name: "lillian"},
    // {id: 125, name: "adam"},
    // {id: 126, name: "aria"},
    // {id: 127, name: "ryan"},
    // {id: 128, name: "aubree"},
  ]

  let allParticipants: Participant[] = rawParticipants.map((i: ParticipantInfo) => new Participant(i.id, i.name));

  let allMatches: Match[][] = [];

  // --- Parameters ---
  var participantsPerMatch = 2;
  // --- ---------- ---

  const GenerateMatches = () => {
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
        
        var thisMatch = new Match(matchId++, currMatchParticipants.map(i => i.winner), roundNumber )
        currRound.push(thisMatch);
        currMatchParticipants.forEach(p => {if (p instanceof Match) p.feeds = thisMatch});

      }

      prevRound = currRound;
      prevRoundLength = prevRound.length;
      roundNumber++;
    } while (prevRound.length > 1);

    var matchMutations: number[] = Array(allMatches.reduce((count, round) => count + round.length, 0)).fill(0)
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
  }

</script>

<h1>Welcome to Svaketz</h1>

  <div style="display: flex; justify-content: space-between; width: 100%; gap: 8px;">
    <div style="display: flex; flex-direction: row; align-items: stretch;">
      <div style="display: flex; flex-direction: column; justify-content: space-around;">
       {#each allParticipants as p, i (p.id)}
          <TournamentSlot displayText={p.name} index={i} roundNumber={0} numRounds={allMatches.length} />
        {/each}
     </div>
    {#each allMatches as r, rn}
      <div style="display: flex; flex-direction: column; justify-content: space-around;">
        {#each r as match, i (match.winner)}
          <TournamentSlot displayText={match.winner?.name ?? "TBD"} index={i} roundNumber={rn + 1} numRounds={allMatches.length} /> 
        {/each}
      </div>
    {/each}
  </div>

  <div style="border-radius: 5px; padding: 8px; border: 4px double black; padding: 10px; min-width: 400px;">
    <h1 style="text-align: center;">Matches</h1>
      {#each allMatches as round, rn}
        <h2 style="margin-top: 15px;" on:click={() => console.log("allm ", allMatches)}>{roundNumberToTitle(rn)}</h2>
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