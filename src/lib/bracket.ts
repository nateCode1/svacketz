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
	visualPos: Position;

	constructor(id: number, round: number, participants: MatchParticipant[], sendTo?: Match[]) {
		this.id = id;
		this.participants = participants;
		this.resolved = false;
		this.round = round;
		this.visualPos = {x: 0, y: 0};

		//create the results array
		let results: MatchResult[];
		if (!sendTo) results = [];
		else results = sendTo.map(i => ({to: i, data: undefined, draw: false}))

		while (results.length < participants.length) {
			results.push({to: undefined, data: undefined, draw: false})
		}
		this.results = results;
	}

  get copyOf() {
    let copy = new Match(this.id, this.round, this.participants);
    copy.resolved = this.resolved;
    copy.results = this.results;
	copy.visualPos = this.visualPos;
    return copy;
  }
}

type Round = {
    participantSeeds: number[];
    matches: MatchGroupings;
    winnerSeeds: number[];
    loserSeeds: number[];
}

export class Bracket {
    allMatches: Match[];
    matchesByRound: Match[][];
    winnersPerMatch: number;
    participantsPerMatch: number;
    allEntrants: Entrant[];

    constructor(allEntrants: Entrant[], winnersPerMatch: number, participantsPerMatch: number) {
        this.allMatches = [];
        this.matchesByRound = [];
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
        // Create 1st round
        let allEntrantSeeds = allEntrants.map((i,j) => j)

        console.log("allEntrantSeeds", allEntrantSeeds)

        let allRounds = [this.getSingleRound(allEntrantSeeds)]

        console.log("allRounds[allRounds.length - 1].matches", allRounds[allRounds.length - 1].matches)
        console.log("allRounds[allRounds.length - 1].winnerSeeds", allRounds[allRounds.length - 1].winnerSeeds)

        // Create subsequent rounds until we reach finals
        while (allRounds[allRounds.length - 1].winnerSeeds.length >= this.participantsPerMatch) {
            allRounds.push(this.getSingleRound(allRounds[allRounds.length - 1].winnerSeeds))
            console.log(allRounds[allRounds.length - 1].winnerSeeds)
        }

        // --- Convert bracket template into actual matches ---
        // First round
        let currMatchId = 0;

        this.matchesByRound.push([]);
        allRounds[0].matches.forEach(i => {
            this.matchesByRound[0].push(new Match(
                currMatchId++, 1,
                i.map(j => {return {
                    from: undefined, // 1st round means from nowhere
                    data: this.allEntrants[j]
                }})
            ))
        })

        allRounds.slice(1).forEach((round, idx) => {
            this.matchesByRound.push([]);
            let roundNum = idx + 1;
            
            round.matches.forEach(i => {
                // Create new match
                let currMatch = new Match(
                    currMatchId++, roundNum+1,
                    i.map(j => {
                        let previousRoundFromIndex = allRounds[roundNum - 1].matches.findIndex(m => m.includes(j));
                        return {from: this.matchesByRound[roundNum - 1][previousRoundFromIndex], data: undefined}
                    })
                )

                // Point all relevant matches from previous round to this round
                i.forEach(j => {
                    let previousRoundFromIndex = allRounds[roundNum - 1].matches.findIndex(m => m.includes(j));
                    let indexWithinPreviousRoundMatch = allRounds[roundNum - 1].matches[previousRoundFromIndex].indexOf(j);

                    this.matchesByRound[roundNum - 1][previousRoundFromIndex].results[indexWithinPreviousRoundMatch].to = currMatch;

                    // Todo: this is a temporary solution for drawing
                    this.matchesByRound[roundNum - 1][previousRoundFromIndex].results[0].draw = true;
                })

                this.matchesByRound[roundNum].push(currMatch);
            })
        })

        this.allMatches = this.matchesByRound.flat();
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
            matches: matchAssignments,
            winnerSeeds: winners,
            loserSeeds: losers,
        };
    }
}