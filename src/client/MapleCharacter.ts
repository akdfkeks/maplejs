import prisma from "../database/prisma";
import { Point } from "../lib/Point";
import { AnimatedMapleMapObject } from "../server/maps/AnimatedMapleMapObject";
import MapleClient from "./Client";
import MapleInventory from "./inventory/MapleInventory";
import CharacterStats from "./CharacterStats";
import CharacterHelper from "./CharacterHelper";
import { InventoryType, ItemLocation } from "../constant/Const";
import ItemLoader from "./inventory/ItemLoader";
import PlayerRandomStream from "./PlayerRandomStream";
import { LineAndCharacter } from "typescript";
import LittleEndianPacketWriter from "../packet/tools/NewPacketWriter";
import { MapleMapObject } from "../server/maps/MapleMapObject";
import Queue from "queue";
import MapleQuest from "../server/quest/MapleQuest";
import MapleQuestStatus from "./quest/MapleQuestStatus";
import { GameConstants } from "../constant/GameConstant";

export class MapleCharacter extends AnimatedMapleMapObject {
	// private static serialVersionUID = 845748950829;

	// 캐릭터 정보
	public id: number = null;
	public name: string = null;
	public job: number = 0;
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

	// 퀘스트
	public quests: Map<any, any>;
	public questInfo: Map<number, string>;
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
	public chatBlock = false;

	public inventory: Array<MapleInventory>;

	public skills: Map<any, any>;

	private random1: PlayerRandomStream;
	//////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////
	// String
	private _name: string;
	private _chalkText: string;
	private _teleportName: string;

	// Byte
	private _gmLevel: number;
	private _gender: number;
	private _initialSpawnPoint: number;
	private _skin: number;
	private _guildRank: number = 5;
	private _allianceRank: number = 5;
	private _world: number;
	private _fairyExp: number;
	private _subcategory: number;

	// Short
	private _level: number;
	private _mulung_energy: number;
	private _combo: number;
	private _availableCP: number;
	private _totalCP: number;
	private _hpApUsed: number;
	private _job: number;
	private _remainingAp: number;
	private _scrolledPosition: number;

	// Int
	private _accId: number;
	private _id: number;
	private _meso: number;
	private _exp: number;
	private _hair: number;
	private _face: number;
	private _mapid: number;
	private _fame: number;
	private _guildid: number = 0;
	private _fallcounter: number;
	private _maplepoint: number;
	private _acash: number;
	private _chair: number;
	private _itemEffect: number;
	private _points: number;
	private _vpoints: number;
	private _rank: number = 1;
	private _rankMove: number = 0;
	private _jobRank: number = 1;
	private _jobRankMove: number = 0;
	private _marriageId: number;
	private _engageId: number;
	private _marriageItemId: number;
	private _dotHP: number;
	private _battleshipHP: number;
	private _coconutteam: number;
	private _currentrep: number;
	private _totalrep: number;
	private _challenge: number;
	private _donatecash: number;
	private _bookCover: number;
	private _weddingGiftGive: number;

	// Long
	private _lastCombo: bigint;
	private _lastfametime: bigint;
	private _keydown_skill: bigint;
	private _nextConsume: bigint;
	private _pqStartTime: bigint;
	private _lastDragonBloodTime: bigint;
	private _lastBeholderHealTime: bigint;
	private _lastBeholderBuffTime: bigint;
	private _lastBerserkTime: bigint;
	private _lastRecoveryTime: bigint;
	private _lastSummonTime: bigint;
	private _mapChangeTime: bigint;
	private _lastFairyTime: bigint;
	private _lastHPTime: bigint;
	private _lastMPTime: bigint;
	private _lastDOTTime: bigint;
	private _firstLoginTime: bigint;

	private _old: Point;

	// Array of Int
	private _wishlist = new Array<number>(10);
	private _rocks = new Array<number>(10);
	private _savedLocations = new Array<number>(10);
	private _regrocks = new Array<number>(10);
	private _hyperrocks = new Array<number>(10);
	private _remainingSp = new Array<number>(10);

	// Atomic Integer
	private _inst: number;
	private _insd: number;

	// List
	// private _lastRes: Array<LifeMovementFragment>;
	private _lastmonthFameIds: Array<number>;
	private _lastmonthBattleIds: Array<number>;
	// private _doors: Array<MapleDoor>;
	// private _pets: Array<Pet>;

	// Set
	// private _controlled: Set<MapleMonster>;
	private _visibleMapObjects: Set<MapleMapObject>;

	// Reentrant ReadWrite Lock ??
	// private _visibleMapObjectsLock: ReentrantReadWriteLock;
	// private _summonsLock: ReentrantReadWriteLock;
	// private _controlledLock: ReentrantReadWriteLock;

	// Map
	private _linkMobs: Map<number, number>;
	private _quests: Map<Quest, MapleQuestStatus>;
	private _questInfo: Map<number, string>;

	private _skills: Map<Skill, SkillEntry>;
	// private _effects: Map<BuffStat, BuffStatValueHoler>;
	// private _summons: Array<Summon>;

	// private _coolDowns: Map<number, MapleCoolDownValueHoler>;
	// private _diseases: Map<MapleDisease, MapleDiseaseValueHolder>;

	// private _reports: Map<ReportType, number>;

	// private _cs: CashShop;

	// private _pendingCarnivalRequests: Array<MapleCarnivalParty>;

	// private _buddyList: BuddyList;

	// private antiCheat:CheatTracker

	private _client: MapleClient;

	// private _party: MapleParty;

	private _stats: CharacterStats;

	// private _map: MapleMap;
	// private _shop: MapleShop;
	// private _rps: MapleRockPaperScissors;

	// private _monsterBook: MonsterBook;

	// private _storage: MapleStorage;

	// private _trade: MapleTrade;

	// private _mount: MapleMount;

	private _finishedAchievements: Array<number>;

	// private _messenger: MapleMessenger;

	private _petStore: Array<number>;

	// private _playerShop: IMaplePlayerShop;

	private _invinible: boolean;
	private _canTalk: boolean;
	private _smega: boolean;
	private _hasSummon: boolean;

	// private _mgc: MapleGuildCharacter;
	// private _mfc: MapleFamilyCharater;

	// private eventInstance: EventInstanceManager;

	private _inventory: Array<MapleInventory>;
	// private _skillMacros = new SkillMacro(5);
	// private _keyLayout: MapleKeyLayout;

	// private mapTimeLimitTask: ScheduledFuture<?>;

	private _pendingExpiration: Array<number> = null;
	private _pendingSkills: Array<number> = null;

	private _goDonateCashShop: boolean = false;
	private _searchingParty: boolean = false;

	// 파티찾기? 이런게 65 에도 있나
	private _psearch_jobs: Array<number>;
	private _psearch_maxLevel: number;
	private _psearch_minLevel: number;
	private _psearch_membersNeeded: number;

	private _canGainNoteFame = 0;

	private _random1: PlayerRandomStream;

	constructor(isChannelServer: boolean) {
		super();
		this.setStance(0);
		this.setPosition(new Point({ x: 0, y: 0 }));
		this.inventory = [
			new MapleInventory(InventoryType.UNDEFINED),
			new MapleInventory(InventoryType.EQUIP),
			new MapleInventory(InventoryType.USE),
			new MapleInventory(InventoryType.SETUP),
			new MapleInventory(InventoryType.ETC),
			new MapleInventory(InventoryType.CASH),
			new MapleInventory(InventoryType.EQUIPPED),
		];

		// 퀘스트 초기화
		this.quests = new Map<any, any>();
		this.questInfo = new Map<number, string>();
		// 스킬 초기화
		this.skills = new Map<any, any>();

		this.random1 = new PlayerRandomStream();
	}

	/**
	 * 캐릭터 생성을 위한 Skeletion 을 반환합니다
	 * @param client MapleClient Object
	 * @param jobCode 캐릭터 직업 Code
	 */
	public static async getSkeletonForNewChar(client: MapleClient, jobCode: number = 0) {
		const skel = new MapleCharacter(false);
		skel.client = client;
		skel.accountId = client.getAccId();
		skel.job = jobCode; // 0 초보자
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
			skel.client.setAccName(account.name);
			skel.aCash = account.ACash;
			skel.maplePoint = account.mPoints;
		}
		return skel;
	}

	/**
	 * 캐릭터의 인벤토리를 반환합니다
	 * @param invType Inventory Type
	 */
	public getInventory(invType: InventoryType) {
		return this.inventory[invType == -1 ? 6 : invType];
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
			c.id = charId;
			c.client = client;

			const pchar = await prisma.character.findUnique({
				where: { id: charId },
				// include: { inventoryItem: true },
			});

			if (!pchar) return null;

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
			c.face = pchar.face;
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

			client.setAccId(c.accountId); // 얘 갑자기 왜 튀어나옴?

			// DB 로부터 조회한 아이템들을 인벤토리에 넣어줘야함
			const items = await ItemLoader.loadItems(c.id, ItemLocation.INVENTORY, false);
			for (const item of [...items.values()]) {
				c.getInventory(item.invType).addFromDB(item.item);
				// console.log("[Check] 아이템 : " + item.item.itemCode);
				// if(item.item.pet !=null) c.pet.add()
			}
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
	public static async saveNewCharToDB(char: MapleCharacter, jobCode: number = 1) {
		try {
			// 저장할 캐릭터 정보 만들어주는 함수
			const { character: characterWithRest, equip: equips } = CharacterHelper.refineDataFromChar(char, jobCode);
			const createdCharTxResult = await prisma.$transaction(async (tx) => {
				// const createdChar = await tx.character.create({
				// 	data: {
				// 		name: char.name,
				// 		account: { connect: { id: char.accountId } },
				// 		level: char.level,
				// 		str: char.stats.str,
				// 		dex: char.stats.dex,
				// 		int: char.stats.int,
				// 		luk: char.stats.luk,
				// 		maxhp: char.stats.max_hp,
				// 		hp: char.stats.hp,
				// 		maxmp: char.stats.max_mp,
				// 		mp: char.stats.mp,
				// 		sp: char.remainingSp.toString().replace(/ /g, ""),
				// 		ap: char.remainingAp,
				// 		skin: char.skin,
				// 		gender: char.gender,
				// 		job: char.job,
				// 		hair: char.hair,
				// 		face: char.face,
				// 		map: 0, // [임시] 모험가 0
				// 		meso: char.meso,
				// 		party: -1,
				// 		buddyCapacity: char.buddy_capacity,
				// 		pets: "-1,-1,-1",
				// 		world: char.world,
				// 		inventorySlot: {
				// 			create: {
				// 				equip: 32,
				// 				use: 32,
				// 				setup: 32,
				// 				etc: 32,
				// 				cash: 60,
				// 			},
				// 		},
				// 	},
				// });
				const createdChar = await tx.character.create({ data: characterWithRest });

				const charId = createdChar.id;
				///////////// 퀘스트 /////////////////////////////////////
				char._quests.forEach(async (q: MapleQuestStatus, k) => {
					const qr = await tx.queststatus.create({
						data: {
							character: { connect: { id: charId } },
							quest: q.getQuest().getId(),
							status: q.getStatus(),
							time: q.getCompletionTime() / 1000,
							forfeited: q.getForfeited(),
							customData: q.getCustomData(),
						},
					});
					////// 퀘스트 몹
					if (qr && q.hasMobKills()) {
						for (const mob of q.getMobKills().key()) {
							await tx.queststatusmobs.create({
								data: {
									queststatus: { connect: { queststatusid: qr.queststatusid } },
									mob: mob,
									count: q.getMobKills(mob),
								},
							});
						}
					}
				});
				////////////////////////////////////////////////////////

				// Do not save additional skill <- 추가스킬이 뭐지?
				// [임시] 여기 bulk insert 로 수정하기
				for (const skill of char._skills.entries()) {
					if (GameConstants.isApplicableSkill(skill[0].getId())) {
						await tx.skills.create({
							data: {
								character: { connect: { id: charId } },
								skillid: skill[1].skillevel,
								masterlevel: skill[1].masterlevel,
								expiration: skill[1].expiration,
							},
						});
					}
				}
				/////////////////////////////////////////////////////////
				await tx.mountdata.create({
					data: {
						character_id: charId,
						Level: 1,
						Exp: 0,
						Fatigue: 0,
					},
				});
				/////////////////////////////////////////////////////////

				for (const item of equips) {
					await tx.inventoryItem.create({
						data: {
							character: { connect: { id: createdChar.id } },
							itemCode: item.itemCode,
							inventory_type: -1, // -1 착용중
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
			});
		} catch (err) {
			console.log(err);
		}

		// 인벤토리 슬롯
		// const pInven = await
	}

	/**
	 * 채팅금지 여부 설정
	 * @param isBlocked true: 채팅가능 false: 채팅금지
	 */
	public canChat(isBlocked: boolean) {
		this.chatBlock = !isBlocked;
	}

	public getRandomStream1() {
		return this.random1;
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
	//////////////////// 쓰레기같은 메서드 ////////////////////////////
	public writeQuestInfoPacket(pm: LittleEndianPacketWriter) {
		pm.writeShort(this.questInfo.size);
		for (const quest of this.questInfo.entries()) {
			pm.writeShort(quest[0]);
			pm.writeMapleAsciiString(quest[1] == null ? "" : quest[1]);
		}
	}

	public getRegTeleportRockMaps() {
		return [999999999, 999999999, 999999999, 999999999, 999999999];
	}

	public getTeleportRockMaps() {
		return [
			999999999, 999999999, 999999999, 999999999, 999999999, 999999999, 999999999, 999999999, 999999999,
			999999999,
		];
	}

	public getMonsterBookCover() {
		return 0;
	}

	public getMonsterBook() {}

	//////////////////////////////////////////
	///////////////// Getter /////////////////

	public getSkillLevel(skill: Skill) {
		if (skill == null) {
			return 0;
		}
		const ret = this._skills.get(skill);
		if (ret == null || ret.skillevel <= 0) {
			return 0;
		}
		return ret.skillevel;
	}

	public getMasterLevel(skill: Skill) {
		const ret = this._skills.get(skill);
		if (ret) return 0;
		return ret.masterlevel;
	}

	public getJob() {
		return this._job;
	}

	public getMap() {
		return this._map;
	}
	public getMapId() {
		if (this._map != null) {
			return this.map_id.getId();
		}
		return this._mapid;
	}
	public getClient() {
		return this._client;
	}

	public isGM() {
		return this._gmLevel > 0;
	}

	public getQuest(q: MapleQuest) {
		const qq = MapleQuest.getInstance(q);
		if (this.getQuestNoAdd(qq) == null) {
			return 0;
		}
		return this.getQuestNoAdd(qq).getStatus();
	}

	public getQuestStatus(quest: MapleQuest) {
		if (!this._quests.has(quest)) {
			return new MapleQuestStatus(quest, 0);
		}
	}

	public getQuestNAdd(quest: MapleQuest) {
		if (!this._quests.has(quest)) {
			const status = new MapleQuestStatus(quest, 0);
			this._quests.set(quest, status);
			return status;
		}
		return this.quests.get(quest);
	}

	public getQuestNoAdd(quest: MapleQuest) {
		return this._quests.get(quest);
	}

	//////////////////////////////////////////
	///////////////// Setter /////////////////
}
