const makeHead = (n: keyof typeof color) => "\x1b[" + n + "m";
const tail = "\x1b[0m";

const color = {
	red: 31,
	green: 32,
	yellow: 33,
	blue: 34,
} as const;

export const red = (s: string) => {
	return makeHead("red") + s + tail;
};
export const yellow = (s: string) => {
	return makeHead("yellow") + s + tail;
};
export const green = (s: string) => {
	return makeHead("green") + s + tail;
};
export const blue = (s: string) => {
	return makeHead("blue") + s + tail;
};
