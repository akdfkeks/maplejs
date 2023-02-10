import { MapleMapObject } from "./MapleMapObject";

export abstract class AnimatedMapleMapObject extends MapleMapObject {
	private stance: number;

	public getStance() {
		return this.stance;
	}

	public setStance(stance: number) {
		this.stance = stance;
	}

	public isFacingLeft(): boolean {
		return this.getStance() % 2 != 0;
	}
}
