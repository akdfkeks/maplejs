import { Point } from "../lib/Point";
import { AnimatedMapleMapObject } from "../server/maps/AnimatedMapleMapObject";
import MapleClient from "./Client";

export class MapleCharacter extends AnimatedMapleMapObject {
	// private static serialVersionUID = 845748950829;
	private name: string;
	private chalktext: string;
	private teleportname: string;

	private lastCombo: number;
	private lastfametime: number;
	private keydown_skill: number;
	private nextConsume: number;
	private pqStartTime: number;
	private lastDragonBloodTime: number;
	private lastBeholderHealTime: number;
	private lastBeholderBuffTime: number;
	private lastBerserkTime: number;
	private lastRecoveryTime: number;
	private lastSummonTime: number;
	private mapChangeTime: number;
	private lastFairyTim: number;
	private lastHPTime: number;
	private lastMPTime: number;
	private lastDOTTime: number;
	private firstLoginTime: number;

	private gmLevel: number;
	private gender: number;
	private initialSpawnPoint: number;
	private skinColor: number;
	private guildrank: number = 5;
	private allianceRank: number = 5;
	private world: number;
	private fairyExp: number;
	private subcategory: number;

	private level: number;
	private mulung_energy: number;
	private combo: number;
	private availableCP: number;
	private totalCP: number;
	private hpApUsed: number;
	private job: number;
	private remainingAp: number;
	private scrolledPosition: number;

	private accountid: number;
	private id: number;
	private meso: number;
	private exp: number;
	private hair: number;
	private face: number;
	private mapid: number;
	private fame: number;
	private guildid: number = 0;
	private fallcounter: number;
	private maplepoints: number;
	private acash: number;
	private chair: number;
	private itemEffect: number;
	private points: number;
	private vpoints: number;

	private rank: number = 1;
	private rankMove: number = 0;
	private jobRank: number = 1;
	private jobRankMove: number = 0;
	private marriageId: number;
	private engageId: number;
	private marriageItemId: number;
	private dotHP: number;

	private battleshipHP: number;
	private coconutteam: number;
	private currentrep: number;
	private totalrep: number;
	private challenge: number;
	private donatecash: number;
	private bookCover: number;
	private weddingGiftGive: number;
	private old: Point;

	private wishlist: number[] = new Array<number>(10);
	private rocks: number[] = new Array<number>(10);
	private savedLocation: number[] = new Array<number>(10);
	private regrocks: number[] = new Array<number>(10);
	private hyperrocks: number[] = new Array<number>(10);
	private remainingSp: number[] = new Array<number>(10);

	public getType() {
		throw new Error("Method not implemented.");
	}
	public sendSpawnData(client: MapleClient): void {
		throw new Error("Method not implemented.");
	}
	public sendDestroyData(client: MapleClient): void {
		throw new Error("Method not implemented.");
	}
}
