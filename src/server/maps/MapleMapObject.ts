import MapleClient from "@/src/client/Client";
import { GameConstants } from "@/src/constant/GameConstant";
import { Point } from "@/src/lib/Point";

export abstract class MapleMapObject {
	private position = new Point();
	private objectId: number;

	public getPosition() {
		return new Point(this.position);
	}

	public getTruePosition(): Point {
		return this.position;
	}

	public setPosition(position: Point): void {
		this.position.x = position.x;
		this.position.y = position.y;
	}

	public getObjectId(): number {
		return this.objectId;
	}

	public setObjectId(id: number): void {
		this.objectId = id;
	}

	public getRange(): number {
		return GameConstants.maxViewRangeSq();
	}

	public abstract getType(): any; // return MapleMapObjectType ??

	public abstract sendSpawnData(client: MapleClient): void;

	public abstract sendDestroyData(client: MapleClient): void;
}
