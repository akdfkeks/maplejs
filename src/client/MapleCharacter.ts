import prisma from "../database/prisma";
import { Point } from "../lib/Point";
import { AnimatedMapleMapObject } from "../server/maps/AnimatedMapleMapObject";
import MapleClient from "./Client";
import MapleInventory from "./inventory/MapleInventory";
import CharacterStats from "./CharacterStats";
import { InvType } from "./inventory/InventoryType";
import CharacterHelper from "./CharacterHelper";
import { Prisma } from "@prisma/client";

export class MapleCharacter extends AnimatedMapleMapObject {
	// private static serialVersionUID = 845748950829;

	// 캐릭터 정보
	public id: number = null;
	public name: string = null;
	public job: number = 1;
	public world: number = 0;
	public gender: number = 0;
	public mount: any = null;
	public meso: number = 0;
	public exp: number = 0;
	public map_id: number = 0;
	public initialSpawnPoint: number = 3;

	// 능력치
	public level: number = 1;
	public stats = new CharacterStats();
	public fame: number = 0;
	public remainingSp = [0, 0, 0, 0, 0, 0, 0, 0];
	public remainingAp: number = 0;

	// 기타 능력치
	public hpApUsed: number = 0; // 피작 횟수

	public buddy_capacity: number = 20; // 친구목록 제한

	// 외형
	public hair: number = 0;
	public face: number = 0;
	public skin: number = 0;

	// 접속 관련 정보
	public client: MapleClient = null;
	public loginTime: number = 0;
	public accountId: number = null;

	// GM 관련
	public gmLevel: number = 0;
	public hide: boolean = false;

	// 길드
	public guildid: number = 0;
	public guildrank: number = 5;

	public allianceRank: number = 5;

	public maplePoint: number;
	public aCash: number;

	// 랭킹
	public rank: number = 1;
	public rankMove: number = 0;
	public jobRank: number = 1;
	public jobRankMove: number = 0;

	public old: Point;

	public inventory: Array<MapleInventory>;
	public quests: Map<any, any>;
	public skills: Map<any, any>;

	constructor(flag: boolean) {
		super();
		this.setStance(0);
		this.setPosition(new Point({ x: 0, y: 0 }));

		// 인벤토리를 생성합니다. 아직 데이터가 적재되지 않았습니다
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
	}

	/**
	 * 캐릭터 생성을 위한 Skeletion 을 반환합니다
	 * @param client MapleClient Object
	 * @param jobCode 캐릭터 직업 Code
	 */
	public static async getSkeletonForNewChar(client: MapleClient, jobCode: number) {
		const skel = new MapleCharacter(false);
		skel.client = client;
		skel.accountId = client.accId;
		skel.job = jobCode;
		skel.stats.str = 12;
		skel.stats.dex = 5;
		skel.stats.int = 4;
		skel.stats.luk = 4;
		skel.stats.max_hp = 50;
		skel.stats.hp = 50;
		skel.stats.max_mp = 5;
		skel.stats.mp = 5;

		// 현재 로그인한 계정의 정보를 조회하여 추가 정보 적재
		const account = await prisma.account.findUnique({ where: { id: skel.accountId } });
		if (account) {
			skel.client.accName = account.name;
			skel.aCash = account.ACash;
			skel.maplePoint = account.mPoints;
		}
		return skel;
	}

	/**
	 * 캐릭터의 인벤토리를 반환합니다
	 * @param invType Inventory Type
	 */
	public getInventory(invType: number) {
		if (invType == -1) invType = 6;
		return this.inventory[invType];
	}

	/**
	 * DB로부터 조회한 데이터를 담은 캐릭터를 반환합니다.
	 * @param client MapleClient 객체
	 * @param charId 캐릭터 고유 ID
	 * @param channelServer ?? default false
	 */
	public static async loadCharFromDB(client: MapleClient, charId: number, channelServer: boolean = false) {
		const c: MapleCharacter = new MapleCharacter(channelServer);
		try {
			const pchar = await prisma.character.findUnique({
				where: { id: charId },
				//include: { inventoryItem: true, inventorySlot: true }, // 보유 아이템, 아이템 슬롯
			});

			c.name = pchar.name;
			c.level = pchar.level;
			c.fame = pchar.fame;

			c.stats.str = pchar.str;
			c.stats.dex = pchar.dex;
			c.stats.int = pchar.int;
			c.stats.luk = pchar.luk;
			c.stats.max_hp = pchar.maxhp;
			c.stats.max_mp = pchar.maxmp;
			c.stats.hp = pchar.hp;
			c.stats.mp = pchar.mp;

			c.job = pchar.job;
			c.gmLevel = pchar.gm;
			c.hide = false; // isGM

			c.exp = pchar.exp; // [임시] 화스 코드 식이 수상한데? 확인해보자
			c.hpApUsed = pchar.hpApUsed;

			const spArr: string[] = pchar.sp.split(",");
			for (let i = 0; i < spArr.length; i++) {
				c.remainingSp[i] = ~~spArr;
			}

			c.remainingAp = pchar.ap;
			c.meso = pchar.meso;
			c.skin = pchar.skin;
			c.gender = pchar.gender;
			c.hair = pchar.hair;
			c.face = pchar.hair;
			c.accountId = pchar.account_id;

			c.map_id = pchar.map;
			c.initialSpawnPoint = pchar.spawnpoint;
			c.world = pchar.world;
			c.guildid = pchar.guildid;
			c.guildrank = pchar.guildrank;
			c.allianceRank = pchar.allianceRank;

			c.loginTime = new Date().getUTCMilliseconds();
			c.buddy_capacity = pchar.buddyCapacity; // 최대 친구 수
			c.mount = {
				owner: c,
				skillId: 10001004,
				fatigue: 0,
				level: 1,
				exp: 0,
			}; // // [임시] 뭔지 알아보기 new MapleMount(char, char.stats.getSkillByJob(1004, char.job), 0, 1, 0)
			c.rank = 1; // [임시]
			c.rankMove = 0; // [랭킹 변화수치]
			c.jobRank = 1; // [임시]
			c.jobRankMove = 0; //[임시]

			client.accId = c.accountId; // 얘 갑자기 왜 튀어나옴?

			// 여기서 인벤토리를 한번에 주면 깔끔하지 않나?
			// char.inventory;

			return c;
		} catch (err) {
			console.log(err);
		}

		return c;
	}

	/**
	 * [임시] 생성한 캐릭터를 데이터베이스에 저장합니다.
	 * 나중에 반드시 개선합시다
	 * @param char MapleCharacter Object
	 * @param jobCode 캐릭터 직업 Code
	 */
	public static async saveNewCharToDB(char: MapleCharacter, jobCode: number) {
		try {
			// 저장할 캐릭터 정보 만들어주는 함수
			const { character: characterWithRest, equip: equips } = CharacterHelper.refineDataFromChar(char, jobCode);
			// console.log(equip); OK refineDataFromChar 정상
			const s = new Date().getMilliseconds();

			// 속도? ㅈ까 일단 돌아가긴 해야할거아냐
			// 생각보다 안느리네?ㅋㅋ
			const bulkResult = await prisma.$transaction(async (tx) => {
				// 1. 캐릭터, 인벤토리, 아이템(장비 제외) 생성
				const createdChar = await tx.character.create({ data: characterWithRest });
				for (const item of equips) {
					await tx.inventoryItem.create({
						data: {
							character: { connect: { id: createdChar.id } },
							itemCode: item.itemCode,
							inventory_type: 0,
							position: item.position,
							quantity: item.quantity,
							owner: "", // [임시]
							GM_Log: "", // [임시]
							uniqueid: item.uniqueId, // [임시] ItemLoader.java line 260, expensive if
							expiredate: item.expiration,
							flag: item.flag,
							type: 0, // 인벤토리 0, 창고 1, 캐시샵 2, ..ItemLoader.java 확인
							// gift
							marriageId: item.marriageId,
							inventory_equipment: {
								create: {
									upgradeslots: item.upgradeSlot,
									level: item.level,
									str: item.str,
									dex: item.dex,
									int: item.int,
									luk: item.luk,
									hp: item.hp,
									mp: item.mp,
									watk: item.watk,
									matk: item.matk,
									wdef: item.wdef,
									mdef: item.mdef,
									acc: item.acc,
									avoid: item.avoid,
									hands: item.hands,
									speed: item.speed,
									jump: item.jump,
									// viciousHammer: equip.ViciousHammer,
									itemEXP: 0, //equip.itemExp, [임시]
									durability: item.durability,
									enhance: item.enhance,
									hpR: item.hpR,
									mpR: item.mpR,
									incSkill: item.incSkill,
									charmEXP: item.charmExp,
									pvpDamage: item.pvpDamage,
								},
							},
						},
					});
				}
				char.id = createdChar.id;
				return true;
			});
			// if (bulkResult) console.log(new Date().getMilliseconds() - s);
		} catch (err) {
			console.log(err);
		}

		// 인벤토리 슬롯
		// const pInven = await
	}

	public getType() {
		throw new Error("Method not implemented.");
	}
	public sendSpawnData(client: MapleClient) {
		throw new Error("Method not implemented.");
	}
	public sendDestroyData(client: MapleClient) {
		throw new Error("Method not implemented.");
	}
}
