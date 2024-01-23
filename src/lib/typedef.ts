// --- Type Declarations ---

export type EntrantInfo = {
	id: number;
	name: string;
};

export type MatchParticipant = {
	from?: Match;
	data?: Entrant;
}

export type Position = {
	x: number;
	y: number;
}

export type MatchResult = {
	//possibly a property indicating placement
	//likely a property indicating if the connection is to be drawn
	to?: Match;
	data?: Entrant;
}

// --- ----------------- ---

// --- Class Declarations ---

export class Entrant {
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

	setTo = (p: Entrant) => {
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
		else results = sendTo.map(i => ({to: i, data: undefined}))

		while (results.length < participants.length) {
			results.push({to: undefined, data: undefined})
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

// --- ------------------ ---
