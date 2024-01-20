// --- Type Declarations ---

export type ParticipantInfo = {
	id: number;
	name: string;
};

export type MatchParticipant = {
	from: Match;
	data: Participant;
}

export type MatchResult = {
	//possibly a property indicating placement
	//likely a property indicating if the connection is to be drawn
	to?: Match;
	data?: Participant;
}

// --- ----------------- ---

// --- Class Declarations ---

export class Participant {
	id: number;
	name: string;
	isDummy: boolean;
	seed: number;

	constructor(id: number, name: string, seed?: number, isDummy?: boolean) {
		this.id = id;
		this.name = name;
		this.seed = seed ?? Math.random();
		this.isDummy = isDummy ? true : false;
	}

	setTo = (p: Participant) => {
		this.name = p.name;
		this.id = p.id;
    	this.seed = p.seed;
	};

	get winner() {
		return this;
	}

	get resolved() {
		return true;
	}
}

export class Match {
	id: number;
	participants: MatchParticipant[];
	round: number;
	winner?: Participant;
	resolved: boolean;
	results?: MatchResult[];

	constructor(id: number, round: number, participants: MatchParticipant[], sendTo?: Match[]) {
		this.id = id;
		this.participants = participants;
		this.round = round;
		this.winner = undefined;
		this.resolved = false;

		//create the results array
		let results: MatchResult[];
		if (!sendTo) results = [];
		else results = sendTo.map(i => ({to: i, data: undefined}))

		while (results.length < participants.length) {
			results.push()
		}
		this.results = results;
	}

  get copyOf() {
    let copy = new Match(this.id, this.round, this.participants);
	copy.winner = this.winner;
    copy.resolved = this.resolved;
    copy.results = this.results;
    return copy;
  }
}

// --- ------------------ ---
