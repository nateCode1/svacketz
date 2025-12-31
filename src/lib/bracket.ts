import { assets } from "$app/paths";
import { MediaType, type MediaInfo, type Position } from "./typedef";

type MatchGroupings = number[][];
type RoundBlueprint = {
    numParticipants: number, 
    isHalfRound: boolean
}

export type MatchResult = {
	//possibly a property indicating placement
	draw: boolean; //indicates if this connection to another match should be drawn
	to?: Match;
    toParticipant?: MatchParticipant;
	data?: Entrant;
}

export type MatchParticipant = {
	from?: Match;
    fromResult?: MatchResult;
	data?: Entrant;
    theoreticalSeed: number;
}

export class Entrant {
	name: string;
	seed: number; // Seed is unique identifier
    exitedAs: number | undefined;
	isDummy: boolean;
	media: MediaInfo;

	constructor(name: string, seed?: number, isDummy?: boolean, mediaType?: MediaType, mediaSrc?: string) {
		this.name = name;
		this.seed = seed ?? Math.random();
		this.isDummy = isDummy ? true : false; // Converts from bool? to bool, undefined=false

        this.media = {
            mediaSrc: mediaSrc ?? "",
            mediaType: mediaType ?? MediaType.NONE
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

    public resolve(matchPlacment: Entrant[]) {
        this.resolved = true;
        this.results.forEach((i,j) => {
            i.data = matchPlacment[j];
            if (i.toParticipant) i.toParticipant.data = matchPlacment[j];
            else matchPlacment[j].exitedAs = this.participants[j].theoreticalSeed;
        })
    }

    get childrenTall() {
        if (this.childrenTallCache) return this.childrenTallCache;
        let drawnConnections = this.participants.filter(i => i.fromResult?.draw);
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
    roundNum?: number;
    matchGroups: MatchGroupings;
    matchObjects: Match[];
    winnerSeeds: number[];
    loserSeeds: number[];
}

export class Bracket {
    allMatchesUpper: Match[];
    allMatchesLower?: Match[]; // Only present for double elimination
    grandFinals: Match;
    winnersPerMatch: number;
    participantsPerMatch: number;
    allEntrants: Entrant[];

    constructor(allEntrants: Entrant[], winnersPerMatch: number, participantsPerMatch: number, generateLowerBracket = true) {
        this.allMatchesUpper = [];
        allEntrants.sort((a,b) => a.seed - b.seed);
        allEntrants.forEach((i,j) => i.seed = j)

        // Pad the length of allEntrants with BYEs
        let ratio = participantsPerMatch / winnersPerMatch;
        let log = Math.log(allEntrants.length / participantsPerMatch) / Math.log(ratio);
        let requiredBYEs = participantsPerMatch * Math.pow(ratio, Math.ceil(log)) - allEntrants.length;
        if (Math.log(allEntrants.length / participantsPerMatch) / Math.log(ratio) % 1 == 0) requiredBYEs = 0;

        this.allEntrants = allEntrants;
        this.winnersPerMatch = winnersPerMatch;
        this.participantsPerMatch = participantsPerMatch;

        // --- Create bracket template ---
        // - Upper Bracket -
        // Create 1st round
        let allEntrantSeeds = allEntrants.map(i => i.seed)

        console.log("allEntrantSeeds", allEntrantSeeds)
        console.log("requiredBYEs", requiredBYEs)

        
        let requiredBYEsParameter = participantsPerMatch % winnersPerMatch == 0 ? requiredBYEs : undefined // TODO: this is a temporary solution
        let allRoundsUpper = [this.getSingleRound(allEntrantSeeds, {setNumPlaceholders: requiredBYEsParameter})]

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
        let allRoundsLower: Round[] | undefined;
        if (generateLowerBracket) {
            let losersBlueprint = this.getLosersBlueprint(allEntrants.length * ((participantsPerMatch - winnersPerMatch) / participantsPerMatch));
            
            // Create 1st round
            let placeholders1stRound = losersBlueprint[0].numParticipants - allRoundsUpper[0].loserSeeds.length;
            let lower1stRound = this.getSingleRound(allRoundsUpper[0].loserSeeds, {setNumPlaceholders: placeholders1stRound});
            allRoundsLower = [lower1stRound]
            lower1stRound.fedFrom.push(allRoundsUpper[0]);
            console.log('lower1stRound', lower1stRound);

            // Create subsequent rounds
            let currLowerRound = 0;
            losersBlueprint.slice(1).forEach((roundBlueprint, j) => {
                if (roundBlueprint.isHalfRound) {
                    let currRound = this.getSingleRound(allRoundsLower![allRoundsLower!.length - 1].winnerSeeds)
                    currRound.fedFrom.push(allRoundsLower![allRoundsLower!.length - 1]);
                    allRoundsLower!.push(currRound);
                }
                else {
                    currLowerRound++;
                    let roundParticipants = [...allRoundsLower![allRoundsLower!.length - 1].winnerSeeds, ...(allRoundsUpper[currLowerRound]?.loserSeeds ?? [])];
                    let requiredPlaceholders = roundBlueprint.numParticipants - roundParticipants.length;
                    let currRound = this.getSingleRound(roundParticipants, {setNumPlaceholders: requiredPlaceholders})
                    currRound.fedFrom.push(allRoundsLower![allRoundsLower!.length - 1], allRoundsUpper[currLowerRound]);
                    allRoundsLower!.push(currRound);
                }
            })
            
            // Set the round numbers for lower brackets
            allRoundsLower.forEach((i,j) => i.roundNum = j)
            // Set the round numbers for upper brackets based on lower brackets (accounts for half rounds)
            allRoundsLower.forEach(i => {
                i.fedFrom.forEach(j => {
                    if (!allRoundsLower!.includes(j)) j.roundNum = i.roundNum;
                })
            })

            console.log("allRoundsLower match groups", allRoundsLower.map(i => i.matchGroups));
        }
        else {
            // Setting roundNum is normally handled by lower bracket generation, so if there is no lower bracket, handle it here
            allRoundsUpper.forEach((i,j) => i.roundNum = j)
        }
        
        // Create grand finals
        let grandFinalRound: Round;
        if (generateLowerBracket) {
            let grandFinalParticipantSeeds = [...allRoundsUpper[allRoundsUpper.length - 1].winnerSeeds, ...allRoundsLower![allRoundsLower!.length - 1].winnerSeeds];
            grandFinalRound = this.getSingleRound(grandFinalParticipantSeeds, {participantsPerMatch: grandFinalParticipantSeeds.length, winnersPerMatch: 1});
            grandFinalRound.fedFrom.push(allRoundsUpper[allRoundsUpper.length - 1], allRoundsLower![allRoundsLower!.length - 1]);
        }
        else {
            grandFinalRound = allRoundsUpper[allRoundsUpper.length - 1]
            allRoundsUpper = allRoundsUpper.slice(0, allRoundsUpper.length - 1)
        }

        // --- Convert bracket template into actual matches ---
        // First round
        let currMatchId = 0;

        allRoundsUpper[0].matchGroups.forEach(i => {
            let currMatch = new Match(
                currMatchId++, allRoundsUpper[0].roundNum ?? 0,
                i.map(j => {return {
                    from: undefined, // 1st round means from nowhere
                    data: this.allEntrants[j],
                    theoreticalSeed: j,
                }}
            ))
            this.allMatchesUpper.push(currMatch);
            allRoundsUpper[0].matchObjects.push(currMatch)
        });

        // All Subsequent rounds
        let generateMatchesFromRound = (round: Round) => {
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
                    currMatchId++, round.roundNum ?? 0,
                    i.map(j => {
                        let {fromMatch, indexWithinPreviousRoundMatch} = findFromRound(j);
                        return {from: fromMatch, fromResult: fromMatch.results[indexWithinPreviousRoundMatch], data: undefined, theoreticalSeed: j}
                    })
                )

                round.matchObjects.push(currMatch);

                // Point all relevant matches from previous round to this round
                i.forEach((j,k) => {
                    let {fromMatch, indexWithinPreviousRoundMatch} = findFromRound(j);

                    fromMatch.results[indexWithinPreviousRoundMatch].to = currMatch;
                    fromMatch.results[indexWithinPreviousRoundMatch].toParticipant = currMatch.participants[k]

                    // Todo: this is a temporary solution for drawing
                    fromMatch.results[0].draw = true;
                })

                matchList.push(currMatch);

            })            

            return matchList
        }

        let filterRedundant = (match: Match) => {
            if (match.participants.length <= this.winnersPerMatch && match.results.slice().every(i => i.to)) {
                // Point all participants to subsequent match
                match.participants.forEach((i, j) => {
                    let pointsToCurr = i.fromResult;
                    let currPointsTo = match.results[j].toParticipant!;
                    if (pointsToCurr) { // Not 1st round
                        pointsToCurr.to = match.results[j].to;
                        pointsToCurr.toParticipant = match.results[j].toParticipant;
                        currPointsTo.from! = i.from!;
                        currPointsTo.fromResult! = i.fromResult!;
                    }
                    else { // 1st Round
                        currPointsTo.data = i.data;
                        currPointsTo.from = undefined;
                        currPointsTo.fromResult = undefined;
                    }
                })
                return false
            }
            return true
        }

        allRoundsUpper.slice(1).forEach(r => this.allMatchesUpper.push(...generateMatchesFromRound(r)));
        this.allMatchesUpper = this.allMatchesUpper.filter(filterRedundant)

        if (generateLowerBracket) {
            this.allMatchesLower = [];
            allRoundsLower!.forEach(r => this.allMatchesLower!.push(...generateMatchesFromRound(r)));
            this.allMatchesLower = this.allMatchesLower.filter(filterRedundant)
        }

        this.grandFinals = generateMatchesFromRound(grandFinalRound)[0];
    }

    private getSingleRound(
        participantSeeds: number[],
        settings?: {
            allowPadding?: boolean,
            setNumPlaceholders?: number,
            participantsPerMatch?: number,
            winnersPerMatch?: number
        }
    ): Round {
        // Default parameters
        let allowPadding = settings?.allowPadding ?? true;
        let setNumPlaceholders = settings?.setNumPlaceholders;
        let participantsPerMatch = settings?.participantsPerMatch ?? this.participantsPerMatch;
        let winnersPerMatch = settings?.winnersPerMatch ?? this.winnersPerMatch;

        console.log("allowPadding", allowPadding)

        // Assertions
        if (!allowPadding && (participantSeeds.length % participantsPerMatch != 0)) throw new Error('Invalid number of participants passed to getSingleRound when allowPadding=false');
        
        participantSeeds.sort((a, b) => a - b);

        let numRealParticipants = participantSeeds.length;

        // Add placeholders as needed
        if (numRealParticipants % participantsPerMatch != 0 || setNumPlaceholders) {
            let numPlaceholders = 0;
            if (setNumPlaceholders) numPlaceholders = setNumPlaceholders;
            else numPlaceholders = participantsPerMatch - (numRealParticipants % participantsPerMatch);
            let placeholders = Array(numPlaceholders).fill(-1);

            console.log(setNumPlaceholders)
            console.log(participantsPerMatch)
            console.log(numRealParticipants)
            console.log(numRealParticipants % participantsPerMatch)
            console.log(numPlaceholders)

            participantSeeds = [...participantSeeds, ...placeholders];
        }

        let numMatches = participantSeeds.length / participantsPerMatch

        let matchAssignments: MatchGroupings = Array(numMatches).fill(0).map(i => [])

        for (let i = 0; i < numMatches; i++) {
            for (let j = 0; j < participantsPerMatch; j++) {
                if (participantSeeds[i + j * numMatches] == -1) continue
                if (j < winnersPerMatch)
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
                if (j < winnersPerMatch) winners.push(i);
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

    getLosersBlueprint(minFirstRoundParticipants: number): RoundBlueprint[] {
        // shorthand for readability
        let ppm = this.participantsPerMatch;
        let wpm = this.winnersPerMatch;

        // console.log(`Min 1st round: ${minFirstRoundParticipants}\nPPM: ${ppm}\nWPM: ${wpm}`)

        let bp: RoundBlueprint[] = [];

        let i = 0;

        let nextRoundLosers = ppm - wpm;
        let inWinners = ppm;
        let fromWinners = inWinners * ((ppm - wpm) / ppm);
        let totalLosers = nextRoundLosers * (ppm / wpm);
        let fromLosers = totalLosers - fromWinners;
        bp.push({ numParticipants: totalLosers, isHalfRound: false });
        while (i < 50 && fromLosers < minFirstRoundParticipants) {
            i++;
            inWinners *= (ppm / wpm)
            nextRoundLosers = fromLosers;
            fromWinners = inWinners * ((ppm - wpm) / ppm);
            totalLosers = nextRoundLosers * (ppm / wpm);
            fromLosers = totalLosers - fromWinners;
            
            // console.log(`FW: ${fromWinners} \n TL: ${totalLosers}`)
            if (fromWinners >= totalLosers) {
                inWinners /= (ppm / wpm)
                fromLosers = totalLosers;
                bp.push({ numParticipants: totalLosers, isHalfRound: true });
            }
            else {
                bp.push({ numParticipants: totalLosers, isHalfRound: false });
            }
        }
        bp[bp.length - 1].isHalfRound = false; // This is technically irrelevant, but is more correct for notation

        console.log("Loser's Blueprint", bp)
        return bp.reverse();
    }

    get allMatches() {
        if (this.allMatchesLower) return [...this.allMatchesUpper, ...this.allMatchesLower, this.grandFinals]
        return [...this.allMatchesUpper, this.grandFinals]
    }
}