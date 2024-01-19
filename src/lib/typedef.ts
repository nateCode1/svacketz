// --- Type Declarations ---

export type ParticipantInfo = {
	id: number;
	name: string;
};

// --- ----------------- ---

// --- Class Declarations ---

export class Participant {
	id: number;
	name: string;
	from?: Match;
  isDummy: boolean;
  seed: number;

	constructor(id: number, name: string, from?: Match, isDummy?: boolean, seed?: number) {
		this.id = id;
		this.name = name;
		this.from = from;
    this.isDummy = isDummy ? true : false;
    this.seed = seed ?? Math.random();
	}

	setTo = (p: Participant) => {
		this.name = p.name;
		this.id = p.id;
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
	participants: Participant[];
	round: number;
	winner: Participant;
	resolved: boolean;
	feeds?: Match;

	constructor(id: number, participants: Participant[], round: number) {
		this.id = id;
		this.participants = participants;
		this.round = round;
		this.winner = new Participant(-1, 'TBD', this);
		this.resolved = false;
		this.feeds = undefined;
	}

  get copyOf() {
    let copy = new Match(this.id, this.participants, this.round);
    copy.winner = this.winner;
    copy.resolved = this.resolved;
    copy.feeds = this.feeds;
    return copy;
  }
}

// --- ------------------ ---
