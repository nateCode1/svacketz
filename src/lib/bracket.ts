import type { MediaInfo, MediaType, Position } from "./typedef";

type MatchGroupings = number[][];

export type MatchResult = {
	//possibly a property indicating placement
	draw: boolean; //indicates if this connection to another match should be drawn
	to?: Match;
	data?: Entrant;
}

export type MatchParticipant = {
	from?: Match;
	data?: Entrant;
}

export class Entrant {
	name: string;
	seed: number;
	isDummy: boolean;
	media?: MediaInfo;

	constructor(name: string, seed?: number, isDummy?: boolean, mediaType?: MediaType, mediaSrc?: string) {
		this.name = name;
		this.seed = seed ?? Math.random();
		this.isDummy = isDummy ? true : false; // Converts from bool? to bool, undefined=false

		if (mediaType != undefined && mediaSrc != undefined) {
			this.media = {
				mediaSrc: mediaSrc,
				mediaType: mediaType
			}
		}
	}

    static getDummy(): Entrant {
        return new Entrant("BYE", Infinity, true)
    }
}

export class Match {
	id: number;
	participants: MatchParticipant[];
	resolved: boolean;
	round: number;
	results: MatchResult[];

    childrenTallCache?: number;

	constructor(id: number, round: number, participants: MatchParticipant[], sendTo?: Match[]) {
		this.id = id;
		this.participants = participants;
		this.resolved = false;
		this.round = round;

		//create the results array
		let results: MatchResult[];
		if (!sendTo) results = [];
		else results = sendTo.map(i => ({to: i, data: undefined, draw: false}))

		while (results.length < participants.length) {
			results.push({to: undefined, data: undefined, draw: false})
		}
		this.results = results;
	}

    get childrenTall() {
        if (this.childrenTallCache) return this.childrenTallCache;
        let drawnConnections = this.participants.filter(i => i.from?.results.find(j => j.to?.id == this.id)?.draw);
        let recursiveChildrenTall: number = drawnConnections.length > 0 ? drawnConnections.map(i => i.from!.childrenTall).reduce((a,b) => a+b) : 1;
        this.childrenTallCache = recursiveChildrenTall
        return recursiveChildrenTall;
    }

    get copyOf() {
        let copy = new Match(this.id, this.round, this.participants);
        copy.resolved = this.resolved;
        copy.results = this.results;
        return copy;
    }
}

type Round = {
    participantSeeds: number[];
    fedFrom: Round[];
    matchGroups: MatchGroupings;
    matchObjects: Match[];
    winnerSeeds: number[];
    loserSeeds: number[];
}

export class Bracket {
    allMatchesUpper: Match[];
    allMatchesLower?: Match[]; // Only present for double elimination
    winnersPerMatch: number;
    participantsPerMatch: number;
    allEntrants: Entrant[];

    constructor(allEntrants: Entrant[], winnersPerMatch: number, participantsPerMatch: number) {
        this.allMatchesUpper = [];
        allEntrants.sort((a,b) => a.seed - b.seed);

        // Pad the length of allEntrants with BYEs
        let ratio = participantsPerMatch / winnersPerMatch;
        let log = Math.log(allEntrants.length) / Math.log(ratio);
        let requiredBYEs = Math.round(Math.pow(ratio, log + 1 - (log % 1)) - allEntrants.length);

        let placeholderEntrants = Array(requiredBYEs).fill(0).map(i => Entrant.getDummy())

        allEntrants = [...allEntrants, ...placeholderEntrants]

        this.allEntrants = allEntrants;
        this.winnersPerMatch = winnersPerMatch;
        this.participantsPerMatch = participantsPerMatch;

        // --- Create bracket template ---
        // - Upper Bracket -
        // Create 1st round
        let allEntrantSeeds = allEntrants.map((i,j) => j)

        console.log("allEntrantSeeds", allEntrantSeeds)

        let allRoundsUpper = [this.getSingleRound(allEntrantSeeds)]

        console.log("allRounds[allRounds.length - 1].matches", allRoundsUpper[allRoundsUpper.length - 1].matchGroups)

        // Create subsequent rounds until we reach finals
        let currUpperRound = 0;
        do {
            currUpperRound = allRoundsUpper.length;
            let currRound = this.getSingleRound(allRoundsUpper[currUpperRound - 1].winnerSeeds)
            currRound.fedFrom.push(allRoundsUpper[currUpperRound - 1])
            allRoundsUpper.push(currRound)
            console.log("allRoundsUpper[winnersRound].matches", allRoundsUpper[currUpperRound].matchGroups)
        } while (allRoundsUpper[currUpperRound].winnerSeeds.length < allRoundsUpper[currUpperRound - 1].winnerSeeds.length && allRoundsUpper[currUpperRound].winnerSeeds.length >= participantsPerMatch); // While number of participants is decreasing round over round, and we have sufficient participants to create a round

        // - Lower Bracket -
        // Create 1st round
        let lower1stRound = this.getSingleRound(allRoundsUpper[0].loserSeeds);
        let allRoundsLower = [lower1stRound]
        lower1stRound.fedFrom.push(allRoundsUpper[0]);
        
        // Create subsequent rounds
        let currLowerRound = 0;
        let roundsUntilHalfRound = 2;
        do {
            currLowerRound++;
            let currRound = this.getSingleRound([...allRoundsLower[allRoundsLower.length - 1].winnerSeeds, ...(allRoundsUpper[currLowerRound]?.loserSeeds ?? [])])
            currRound.fedFrom.push(allRoundsLower[allRoundsLower.length - 1], allRoundsUpper[currLowerRound]);
            allRoundsLower.push(currRound);

            // Half rounds are a round consisting of only loser's bracket participants, and no new winner's bracket participants 
            roundsUntilHalfRound--;
            if (roundsUntilHalfRound == 0) {
                roundsUntilHalfRound = 1;
                currRound = this.getSingleRound(allRoundsLower[allRoundsLower.length - 1].winnerSeeds)
                currRound.fedFrom.push(allRoundsLower[allRoundsLower.length - 1]);
                allRoundsLower.push(currRound);
            }
        } while (allRoundsLower[allRoundsLower.length - 1].winnerSeeds.length >= participantsPerMatch && allRoundsUpper[currLowerRound+1]);

        console.log("allRoundsLower match groups", allRoundsLower.map(i => i.matchGroups))

        // --- Convert bracket template into actual matches ---
        // First round
        let currMatchId = 0;

        allRoundsUpper[0].matchGroups.forEach(i => {
            let currMatch = new Match(
                currMatchId++, 1,
                i.map(j => {return {
                    from: undefined, // 1st round means from nowhere
                    data: this.allEntrants[j]
                }}
            ))
            this.allMatchesUpper.push(currMatch);
            allRoundsUpper[0].matchObjects.push(currMatch)
        });

        // All Subsequent rounds
        let generateMatchesFromRound = (round: Round, idx: number) => {
            let roundNum = idx + 1;
            let matchList: Match[] = [];
            
            round.matchGroups.forEach(i => {
                const findFromRound = (seed: number) => {
                    let previousRoundMatchIndex = -1;
                    let fromRound: Round | undefined = undefined;
                    round.fedFrom.forEach(prevRound => {
                        let indexInPrevRound = prevRound.matchGroups.findIndex(m => m.includes(seed))
                        if (indexInPrevRound != -1){
                            previousRoundMatchIndex = indexInPrevRound;
                            fromRound = prevRound;
                        }
                    })
                    let indexWithinPreviousRoundMatch = fromRound!.matchGroups[previousRoundMatchIndex].indexOf(seed);
                    let fromMatch = fromRound!.matchObjects[previousRoundMatchIndex];
                    return {fromMatch, indexWithinPreviousRoundMatch};
                }

                // Create new match
                let currMatch = new Match(
                    currMatchId++, roundNum+1,
                    i.map(j => {
                        let {fromMatch, indexWithinPreviousRoundMatch} = findFromRound(j);
                        return {from: fromMatch, data: undefined}
                    })
                )

                round.matchObjects.push(currMatch);

                // Point all relevant matches from previous round to this round
                i.forEach(j => {
                    let {fromMatch, indexWithinPreviousRoundMatch} = findFromRound(j);

                    fromMatch.results[indexWithinPreviousRoundMatch].to = currMatch;

                    // Todo: this is a temporary solution for drawing
                    fromMatch.results[0].draw = true;

                    if (currMatch.id == 13) {
                        console.log("fm 13", fromMatch)
                    }
                })

                matchList.push(currMatch);

            })            

            return matchList
        }

        let filterRedundant = (match: Match) => {
            if (match.participants.length <= this.winnersPerMatch) console.log("BOOSOO", match.results)
            if (match.participants.length <= this.winnersPerMatch && match.results.slice(0, match.participants.length).every(i => i.to)) {
                // Point all participants to subsequent match
                match.participants.forEach((i, j) => {
                    console.log("mID", match.id)
                    console.log("mp", match.participants)
                    console.log("mr", match.results)
                    console.log("i", i)
                    let pointsToCurr = i.from?.results.find(k => k.to?.id == match.id)!;
                    pointsToCurr.to = match.results[j].to;
                    match.results[j].to!.participants.find(k => k.from!.id == match.id)!.from! = i.from!;
                })
                return false
            }
            return true
        }

        allRoundsUpper.slice(1).forEach((r, i) => this.allMatchesUpper.push(...generateMatchesFromRound(r,i)));
        this.allMatchesUpper = this.allMatchesUpper.filter(filterRedundant)

        this.allMatchesLower = [];
        allRoundsLower.forEach((r, i) => this.allMatchesLower!.push(...generateMatchesFromRound(r,i)));
        this.allMatchesLower = this.allMatchesLower.filter(filterRedundant)


        console.log("allMatchesLower children tall", this.allMatchesLower?.map(i => i.childrenTall))
        console.log("allMatchesLower round", this.allMatchesLower?.map(i => i.round))
    }

    private getSingleRound(participantSeeds: number[], allowPadding: boolean = true): Round {
        if (!allowPadding && (participantSeeds.length % this.participantsPerMatch != 0)) throw new Error('Invalid number of participants passed for seeding when allowPadding=false');

        participantSeeds.sort((a, b) => a - b);

        let numRealParticipants = participantSeeds.length;

        // Add placeholders as needed
        if (numRealParticipants % this.participantsPerMatch != 0) {
            let numPlaceholders = this.participantsPerMatch - (numRealParticipants % this.participantsPerMatch);
            let placeholders = Array(numPlaceholders).fill(-1);

            participantSeeds = [...participantSeeds, ...placeholders];
        }

        let numMatches = participantSeeds.length / this.participantsPerMatch

        let matchAssignments: MatchGroupings = Array(numMatches).fill(0).map(i => [])

        for (let i = 0; i < numMatches; i++) {
            for (let j = 0; j < this.participantsPerMatch; j++) {
                if (participantSeeds[i + j * numMatches] == -1) continue
                if (j < this.winnersPerMatch)
                    matchAssignments[i].push(participantSeeds[i + j * numMatches])
                else
                    matchAssignments[numMatches - 1 - i].push(participantSeeds[i + j * numMatches])
            }
        }

        matchAssignments.forEach(i => i.sort((a, b) => a - b));

        let winners: number[] = [];
        let losers: number[] = [];
        matchAssignments.forEach((match) => {
            match.forEach((i,j) => {                
                if (j < this.winnersPerMatch) winners.push(i);
                else losers.push(i);
            })
        })

        return {
            participantSeeds: participantSeeds,
            fedFrom: [],
            matchObjects: [],
            matchGroups: matchAssignments,
            winnerSeeds: winners,
            loserSeeds: losers,
        };
    }
}