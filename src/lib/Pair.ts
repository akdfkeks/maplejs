class Pair<T, U> {
	public left: T = null;
	public right: U = null;
	constructor(left: T, right: U) {
		this.left = left;
		this.right = right;
	}
	public get(loc: "left" | "right") {
		return this[loc];
	}
}
export default Pair;
