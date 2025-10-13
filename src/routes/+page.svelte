<script lang="ts">
	import MatchCard from "./MatchCard.svelte";
  import { MediaType } from '$lib/typedef'
  import { Match, Entrant, Bracket, type MatchParticipant } from "$lib/bracket";
	import BracketUI from './Bracket.svelte';
	import VotingScreen from "./VotingScreen.svelte";
	import BracketSetup from "./BracketSetup.svelte";
	import Overlay from "./Overlay.svelte";

  // Basic test data
  let rawParticipants = [
    "david", "ahmad", "nathan", "luke", "asher", "olivia", "emily", "liam", "ava", "noah", "isabella", "mason", "sophia", "jackson", "oliver", "amelia", "ethan", "mia", "logan", "lucas", "harper", "abigail", "alexanderiania", "ella", "carter", "avery", "henry", "mila", "owen", "scarlett", "wyatt", "eva", "jayden", "leah", "nicholas", "zoey", "caleb", "penelope", "isaac", "lily", "gabriel", "chloe", "jaxon", "madison", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "wyatt", "zoey", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "elijah", "hazel", "jacob", "ella", "julian", "lillian", "adam", "aria", "ryan", "aubree", "nathan", "sophie", "levi", "amelia", "ethan", "mia", "logan", "lucas", "harper", "abigail", "alexander", "ella", "carter", "avery", "henry", "mila", "owen", "scarlett", "wyatt", "eva", "jayden", "leah", "nicholas", "zoey", "caleb", "penelope", "isaac", "lily", "gabriel", "chloe", "jaxon", "madison", "joseph", "aubrey", "dylan", "adeline", "jaden", "layla", "gavin", "riley", "michael", "grace", "elijah", "hazel", "jacob", "ella", "julian", "lillian", "adam", "aria", "ryan", "aubree"
  ].slice(0,16);
  let allEntrants: Entrant[] = rawParticipants.map((i: string, n) => new Entrant(i, n));

  // Media test data ONLY SPOTIFY
  // let rawParticipantsMediaSpotify = [{name: "I/Me/Myself", src: "1lqj3wgPj8gHCdq46hUjvr"}, {name: "2econd 2ight 2eer", src: "4jd13hFvWAZKZpomQleZ8L"}, {name: "The Main Character", src: "2NHntfUPC17b0nmilAWl87"}]
  // let allEntrants: Entrant[] = rawParticipantsMediaSpotify.map((i: any, n) => new Entrant(n+1, i.name, n, false, MediaType.SPOTIFY, i.src))

  // Media test data
  // let rawParticipantsMediaYoutube = [{name: "Turnip Turns up", src: "tx2LXzM-Q2A"}, {name: "10 hours", src: "f1A7SdVTlok"}, {name: "Ohhhh!", src: "e6FPWcyREgo"}]
  // let allEntrants: Entrant[] = rawParticipantsMediaYoutube.map((i: any, n) => new Entrant(i.name, n, false, MediaType.YOUTUBE, i.src))
  // allEntrants.push(new Entrant("Splendid Cats", -1, false, MediaType.IMAGE, "https://static.wikia.nocookie.net/8772c172-9f2a-4421-b6fa-ca4f7373fa1e/scale-to-width/755"))
  // allEntrants.push(new Entrant("Wide boy", -2, false, MediaType.IMAGE, "https://www.shutterstock.com/image-photo/very-wide-night-panorama-london-260nw-232927153.jpg"))
  // allEntrants.push(new Entrant("JS Jumpscare", -2, false, MediaType.IMAGE, "https://cdn.discordapp.com/attachments/564484316294545418/1389020465171009627/javascriptJumpscare.gif?ex=6863c25d&is=686270dd&hm=1bf6819697ce776cdc611f6014b0991e15affa80045b1c0541de24e9099f9cd2&"))
  // allEntrants.push(new Entrant("Texty lad", -3, false, MediaType.TEXT, `
  // # I'd like to say hello
  // *and welcome you*

  // good day that is __my__ name
  // `))

  let allMatches: Match[] = [];
 
  let votingScreen;

  let setupScreenVisible: boolean = true;
  let resultsVisible: boolean = true;

  // const pPerMatch = 2;

  // const GenerateMatches = () => {
  //   //Fill in with dummy people, ensure their seed is worse
  //   while (Math.log10(allEntrants.length) / Math.log10(pPerMatch) % 1 != 0)
  //     allEntrants.push(new Entrant("BYE", Infinity, true))

  //   //Sort participants by seed
  //   let sortedParticipants = [... allEntrants].sort((a,b) => a.seed - b.seed);
  //   sortedParticipants = sortedParticipants.map((i,j) => {
  //     i.seed = j+1;
  //     return i;
  //   })
    
  //   //find the order of participants in round 1 by seed
  //   let posRound1 = Array(sortedParticipants.length).fill(0);

  //   //This code will fill posRound1 with what position in the list of entrants the ith seed should be at
  //   for (var i = 0; i <= Math.log2(posRound1.length); i++) {
  //     for (var j = 1; j <= posRound1.length; j++) {
  //       let myRank = Math.floor((j - 1) / Math.pow(2, i)) + 1;
  //       posRound1[j - 1] += (Math.floor(myRank % 4 / 2) * Math.pow(2, Math.floor(Math.log2(posRound1.length) - i - 1)));
  //     }
  //   }

  //   //Set the first round to be the sorted participants in the correct order
  //   sortedParticipants.forEach((i, n) => allEntrants[posRound1[n]] = i)

  //   // create n rounds
  //   const bufferSize = Math.log10(allEntrants.length) / Math.log10(pPerMatch);
  //   let matchesToBeResolved = new Array(); //match buffer
  //   for (let i = 0; i < bufferSize; i++) matchesToBeResolved[i] = new Array(pPerMatch - 1).fill(false);
  //   let currMatchId = 0;

  //   //Utility to make a match
  //   const createMatch = (round: number, participants: MatchParticipant[]) => {
  //     let currMatch = new Match(
  //       currMatchId++,
  //       round,
  //       participants
  //     )
  //     currMatch.results[0].draw = true;
  //     allMatches.push(currMatch);
  //     return currMatch;
  //   }

  //   // GENERATE THE MATCHES
  //   // Works by looping through all the entrants n at a time, and generating a match for each pair
  //   // When a match is generated it is added to a buffer corresponding to what round its in
  //   // If a match is to be added to a full buffer, a new match is created between the match in the buffer, and the match set to be added
  //   for (var i = 0; i < allEntrants.length; i += pPerMatch) {
  //     let order = 0;

  //     //create the first round match
  //     let firstRoundParticipants = []
  //     for (let j = i; j < i + pPerMatch; j++) firstRoundParticipants.push({from: undefined, data: allEntrants[j]})
  //     let newMatch = createMatch(
  //       order + 1,
  //       firstRoundParticipants
  //     )

  //     while (true) {
  //       //attempt to add to buffer
  //       if (!matchesToBeResolved[order].some((i:any) => !i)) {
  //         let oldMatch = newMatch;
  //         //create new match if the buffer is full
  //         newMatch = createMatch(
  //           order + 2,
  //           [...matchesToBeResolved[order].map((i: Match) => {return {from: i, data: undefined}}),
  //           {from: oldMatch, data: undefined}]
  //         )

  //         //set the winners of the two previous matches to go to the new match
  //         oldMatch.results[0].to = newMatch;
  //         matchesToBeResolved[order].forEach((i: Match) => i.results[0].to = newMatch);

  //         //empty the buffer
  //         matchesToBeResolved[order] = new Array(pPerMatch - 1).fill(false);
  //         order++;
  //       }
  //       else {
  //         //add to buffer and break
  //         matchesToBeResolved[order][matchesToBeResolved[order].indexOf(false)] = newMatch;
  //         break;
  //       }
  //     }
  //   }

  //   allMatches.forEach(i => {
  //     if (i.participants.reduce((count, curr) => count + (curr.data?.isDummy ? 0 : 1), 0) == 1) 
  //       resolveMatch(i, i.participants.find(j => !j.data!.isDummy)!.data!)
  //   })
  // }
  // GenerateMatches()
  // let bracket = new Bracket(allEntrants, 1, 2)
  let bracket: Bracket;

  const roundNumberToTitle = (roundNum: number) => {
    let roundTitles: any = {
      8: "Quarter-Finals",
      4: "Semi-Finals",
      2: "Grand Final",
    }
    let roundOf = Math.pow(bracket.participantsPerMatch, allMatches.length - roundNum);
    return roundTitles[roundOf] ?? ("Round of " + roundOf)
  }

  function resolveMatch(match: Match, matchPlacement: Entrant[]) {
    match.resolve(matchPlacement)

    bracket.allMatchesUpper = [...bracket.allMatchesUpper]
      if (bracket.allMatchesLower) bracket.allMatchesLower = [...bracket.allMatchesLower] 
  }

  function endSetup(createdBracket: Bracket) {
    setupScreenVisible = false;
    bracket = createdBracket;
  }
</script>

<Overlay bind:visible={setupScreenVisible} allowClose={false}>
  <BracketSetup onSetupCompleted={endSetup} />
</Overlay>

{#if bracket && bracket.allMatches.every(i => i.resolved)}
  <Overlay bind:visible={resultsVisible}>
    <div style="background-color: #444; border: 2px solid #ccc; border-radius: 5px; padding: 10px;">
      <h1>Results</h1>
      
      <div style="display: flex; flex-direction: column;">
        {#each bracket.allEntrants.sort((a,b) => (a.exitedAs??0) - (b.exitedAs??0)) as entrant, i}
          <p style="color: white;">{i+1}. {entrant.name}</p>
        {/each}
      </div>
    </div>
  </Overlay>
{/if}

{#if bracket}
  <div style="display: flex; justify-content: space-between; width: 100%; gap: 8px; height: 95vh;">
    <VotingScreen bind:this={votingScreen} resolveMatch={resolveMatch}/>
    <BracketUI startVoting={votingScreen?.startVoting} bracket={bracket}/>

    <div style="border-radius: 5px; display: flex; flex-direction: column; padding: 8px; overflow-y: auto; padding: 10px; min-width: 250px;">
      <h1 style="text-align: center; margin-bottom: 20px;">Matches</h1>
        {#each bracket.allMatches as match}
          <MatchCard bind:match={match} startVoting={votingScreen?.startVoting} />
        {/each}
    </div>
  </div>
{/if}

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