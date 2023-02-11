import prisma from "../database/prisma";
import { Point } from "../lib/Point";
import { AnimatedMapleMapObject } from "../server/maps/AnimatedMapleMapObject";
import MapleClient from "./Client";
import MapleInventory from "./inventory/MapleInventory";
import momoent from "moment";
import CharacterStats from "./CharacterStats";
import { InvType } from "./inventory/InventoryType";

export class MapleCharacter extends AnimatedMapleMapObject {
	// private static serialVersionUID = 845748950829;

	// Character default information
	public world: number;
	public id: number;
	public level: number;
	public name: string;
	public gender: number;

	public mount: any;
	public meso: number;
	public exp: number;

	public map_id: number;

	// Character stats
	public stats: CharacterStats;

	public fame: number;

	public hide: boolean = false;
	public buddy_capacity: number = 20;
	// Character outlook
	public hair: number;
	public face: number;
	public skin: number;

	public client: MapleClient;

	public gmLevel: number;

	public initialSpawnPoint: number;
	public loginTime: number;

	public guildrank: number = 5;
	public allianceRank: number = 5;

	public fairyExp: number;
	public subcategory: number;

	public mulung_energy: number;
	public combo: number;
	public availableCP: number;
	public totalCP: number;
	public hpApUsed: number;
	public job: number;
	public remainingAp: number;
	public scrolledPosition: number;

	public accountId: number;

	public guildid: number = 0;
	public fallcounter: number;
	public maplepoints: number;
	public acash: number;
	public chair: number;
	public itemEffect: number;
	public points: number;
	public vpoints: number;

	public rank: number = 1;
	public rankMove: number = 0;
	public jobRank: number = 1;
	public jobRankMove: number = 0;
	public marriageId: number;
	public engageId: number;
	public marriageItemId: number;
	public dotHP: number;

	public battleshipHP: number;
	public coconutteam: number;
	public currentrep: number;
	public totalrep: number;
	public challenge: number;
	public donatecash: number;
	public bookCover: number;
	public weddingGiftGive: number;
	public old: Point;

	public wishlist: number[] = new Array<number>(10);
	public rocks: number[] = new Array<number>(10);
	public savedLocation: number[] = new Array<number>(10);
	public regrocks: number[] = new Array<number>(10);
	public hyperrocks: number[] = new Array<number>(10);
	public remainingSp: Array<number>;

	public inventory: Array<MapleInventory>;
	public quests: Map<any, any>;
	public skills: Map<any, any>;

	constructor(flag: boolean) {
		super();
		this.setStance(0);
		this.setPosition(new Point({ x: 0, y: 0 }));

		// 인벤토리 초기화
		this.inventory = [
			new MapleInventory(InvType.UNDEFINED),
			new MapleInventory(InvType.EQUIP),
			new MapleInventory(InvType.USE),
			new MapleInventory(InvType.SETUP),
			new MapleInventory(InvType.ETC),
			new MapleInventory(InvType.CASH),
			new MapleInventory(InvType.EQUIPPED),
		];

		// 퀘스트 초기화
		this.quests = new Map<any, any>();
		// 스킬 초기화
		this.skills = new Map<any, any>();
		// 스텟 로딩
		// this.stats = new PlayerStats();

		this.remainingSp = [0, 0, 0, 0, 0, 0, 0, 0];
		this.stats = new CharacterStats();
	}

	public static getDefault(client: MapleClient, jobType: number) {
		const skel = new MapleCharacter(false);
		skel.client = client;
		skel.map_id = null;
		skel.exp = 0;
		skel.gmLevel = 0;
		skel.job = jobType;
		skel.meso = 0;
		skel.level = 1;
		skel.remainingAp = 0;
		skel.fame = 0;
		skel.accountId = client.accId;
		// skel.buddyList = new BuddyList(20)
		skel.buddy_capacity = 20;
		skel.stats.str = 12;
		skel.stats.dex = 5;
		skel.stats.int = 4;
		skel.stats.luk = 4;
		skel.stats.max_hp = 50;
		skel.stats.hp = 50;
		skel.stats.max_mp = 5;
		skel.stats.mp = 5;

		return skel;
	}

	public getInventory(inventoryId: number) {
		return this.inventory[inventoryId];
	}

	/**
	 * 캐릭터의 기본 정보(cid : character id) 를 통해
	 * 단일 캐릭터의 모든 정보를 조회합니다.
	 * 이후 MapleCharacter 에 정보를 담아 반환합니다.
	 * 일단 임시로 대충 구현완료
	 */
	public static async loadCharFromDB(client: MapleClient, cid: number, channelServer: boolean) {
		// skeleton 생성하고 데이터 채운다 실시 악
		const char: MapleCharacter = new MapleCharacter(channelServer);
		try {
			// Prisma character
			const pchar = await prisma.character.findUnique({ where: { id: cid } });
			char.name = pchar.name;
			char.level = pchar.level;
			char.fame = pchar.fame;

			char.stats.str = pchar.str;
			char.stats.dex = pchar.dex;
			char.stats.int = pchar.int;
			char.stats.luk = pchar.luk;
			char.stats.max_hp = pchar.max_hp;
			char.stats.max_mp = pchar.max_mp;
			char.stats.hp = pchar.hp;
			char.stats.mp = pchar.mp;

			char.job = pchar.job;
			char.gmLevel = pchar.gm;
			char.hide = false; // isGM

			char.exp = pchar.exp; // 화스 코드 식이 수상한데?
			char.hpApUsed = pchar.hp_apUsed; // 피작 횟수?

			const spArr: string[] = pchar.sp.split(",");
			for (let i = 0; i < spArr.length; i++) {
				char.remainingSp[i] = ~~spArr;
			}

			char.remainingAp = pchar.ap;
			char.meso = pchar.meso;
			char.skin = pchar.skin;
			char.gender = pchar.gender;
			char.hair = pchar.hair;
			char.face = pchar.hair;
			char.accountId = pchar.account_id;

			client.accId = char.accountId; // 얘 갑자기 왜 튀어나옴?

			char.map_id;
			char.initialSpawnPoint;
			char.world;
			char.guildid;
			char.guildrank;
			char.allianceRank;
			char.currentrep;
			char.totalrep;
			char.loginTime = new Date().getUTCMilliseconds();
			// char.makeMFC 머고 이거
			// char.buddyList = new BuddyList(char.buddyCapacity)
			char.buddy_capacity = pchar.buddy_capacity; //친창 맥스
			char.subcategory = 0; //pchar.subcategory
			char.mount = {
				owner: char,
				skillId: 10001004,
				fatigue: 0,
				level: 1,
				exp: 0,
			}; // new MapleMount(char, char.stats.getSkillByJob(1004, char.job), 0, 1, 0)
			char.rank = 1; // 임시
			char.rankMove = 0; // 랭킹 변화수치
			char.jobRank = 1;
			char.jobRankMove = 0;
			char.marriageId = 0;
			char.engageId = 0; // ??
			char.bookCover = 0;
			// char.antiCheat = // Anti-cheat tracker

			const questStatus: any[] = null; // await prisma.queststatus.findMany({where:{character_id : char.id}})
			const questStatusMobs: any[] = null; // await prisma.queststatus.findMany({where:{character_id : char.id}})

			// for (const qs of questStatus){ 으쌰으쌰}
			console.log(char);
			return char;
		} catch (err) {
			console.log(err);
		}

		return char;
	}

	//보류
	public static async saveNewCharToDB(char: MapleCharacter, job: number) {
		// 캐릭터 + 인벤토리 한방 생성
		try {
			const pChar = await prisma.character.create({
				data: {
					name: char.name,
					acccount: { connect: { id: char.accountId } },
					level: 1,
					str: char.stats.str,
					dex: char.stats.dex,
					int: char.stats.int,
					luk: char.stats.luk,
					max_hp: char.stats.max_hp,
					hp: char.stats.hp,
					max_mp: char.stats.max_mp,
					mp: char.stats.mp,
					sp: char.remainingSp.toString().replace(/ /g, ""),
					ap: char.remainingAp,
					skin: char.skin,
					gender: char.gender,
					job: char.job,
					hair: char.hair,
					face: char.face,
					map: 0,
					meso: char.meso,
					party: -1,
					buddy_capacity: char.buddy_capacity,
					// pets : "-1,-1,-1"
					world: char.world,
					inventory_slot: {
						create: {
							equip: 32,
							use: 32,
							setup: 32,
							etc: 32,
							cash: 32,
						},
					},
				},
			});
		} catch (err) {
			console.log(err);
		}

		// 인벤토리 슬롯
		// const pInven = await
	}

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
