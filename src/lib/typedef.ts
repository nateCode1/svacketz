export type Position = {
	x: number;
	y: number;
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


export enum MediaType {
	YOUTUBE,
	SPOTIFY, // currently unsupported
	IMAGE,
	TEXT,
}

export type MediaInfo = {
	mediaType: MediaType;
	mediaSrc: string;
}
