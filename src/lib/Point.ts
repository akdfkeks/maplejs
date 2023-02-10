export class Point {
	x: number = 0;
	y: number = 0;
	constructor(position?: Point) {
		this.x = position ? position.x : 0;
		this.y = position ? position.y : 0;
	}
}
