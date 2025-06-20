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
	draw: boolean; //indicates if this connection to another match should be drawn
	to?: Match;
	data?: Entrant;
}

export type Connector = {
	thickness: number;
	top: number;
	bottom: number;
	x: number;
	tickSize: number;
	leftTicks?: number[];
	rightTicks?: number[];
};

// --- ----------------- ---

// --- Class Declarations ---

export enum MediaType {
	YOUTUBE,
	SPOTIFY,
	IMAGE, // currently unsupported
}

export type MediaInfo = {
	mediaType: MediaType;
	mediaSrc: string;
}

export class Entrant {
	id: number;
	name: string;
	isDummy: boolean;
	seed: number;
	media?: MediaInfo;

	constructor(id: number, name: string, seed?: number, isDummy?: boolean, mediaType?: MediaType, mediaSrc?: string) {
		this.id = id;
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

// --- ------------------ ---
