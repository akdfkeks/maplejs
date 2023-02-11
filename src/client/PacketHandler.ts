import PongHandler from "@/src/handler/PongHandler";
import MapleClient from "./Client";
import Opcodes from "../packet/tools/Opcodes";
import PacketReader from "../packet/tools/PacketReader";
import LoginHandler from "../handler/login/LoginHandler";
import CharacterSelectHandler from "../handler/login/__deptrecated/CharacterSelectHandler";

type Handler = (client: MapleClient, reader?: PacketReader) => void;

// Packet의 OP CODE 별 실행될 메서드를 등록
class PacketHandlerManager {
	static handler: Map<string, Function>;
	static {
		this.handler = new Map<string, Handler>();

		this.handler.set("PONG", PongHandler);

		this.handler.set("CLIENT_HELLO", () => {}); // X
		this.handler.set("CLIENT_ERROR", () => {}); // X

		this.handler.set("LOGIN_PASSWORD", LoginHandler.login);
		this.handler.set("CHARLIST_REQUEST", LoginHandler.charListRequest);
		this.handler.set("CHECK_CHAR_NAME", LoginHandler.checkCharName);
		this.handler.set("CREATE_CHAR", LoginHandler.createChar);

		this.handler.set("CHAR_SELECT", LoginHandler.charSelect);
		this.handler.set("CHAR_SELECT_WITH_SPW", () => {});
		this.handler.set("CHANGE_CHANNEL", () => {});
		this.handler.set("PLAYER_LOGGEDIN", () => {});
		this.handler.set("ENTER_CASH_SHOP", () => {});
		this.handler.set("MOVE_PLAYER", () => {});
		this.handler.set("CHAR_INFO_REQUEST", () => {});
		this.handler.set("CLOSE_RANGE_ATTACK", () => {});
		this.handler.set("RANGED_ATTACK", () => {});
		this.handler.set("MAGIC_ATTACK", () => {});
		this.handler.set("PASSIVE_ENERGY", () => {});
		this.handler.set("SPECIAL_MOVE", () => {});
		this.handler.set("FACE_EXPRESSION", () => {});
		this.handler.set("TAKE_DAMAGE", () => {});
		this.handler.set("HEAL_OVER_TIME", () => {});
		this.handler.set("CANCEL_BUFF", () => {});
		this.handler.set("MECH_CANCEL", () => {});
		this.handler.set("CANCEL_ITEM_EFFECT", () => {});
		this.handler.set("USE_CHAIR", () => {});
		this.handler.set("CANCEL_CHAIR", () => {});
		this.handler.set("WHEEL_OF_FORTUNE", () => {});
		this.handler.set("USE_ITEMEFFECT", () => {});
		this.handler.set("SKILL_EFFECT", () => {});
		this.handler.set("QUICK_SLOT", () => {});
		this.handler.set("MESO_DROP", () => {});
		this.handler.set("CHANGE_KEYMAP", () => {});
		this.handler.set("CHANGE_MAP", () => {});
		this.handler.set("CHANGE_MAP_SPECIAL", () => {});
		this.handler.set("USE_INNER_PORTAL", () => {});
		this.handler.set("TROCK_ADD_MAP", () => {});
		this.handler.set("SKILL_MACRO", () => {});
		this.handler.set("GIVE_FAME", () => {});
		this.handler.set("TRANSFORM_PLAYER", () => {});
		this.handler.set("NOTE_ACTION", () => {});
		this.handler.set("NOTE_RECEIVE_GIFT", () => {});
		this.handler.set("USE_DOOR", () => {});
		this.handler.set("DAMAGE_REACTOR", () => {});
		this.handler.set("CLICK_REACTOR", () => {});
		this.handler.set("TOUCH_REACTOR", () => {});
		this.handler.set("CLOSE_CHALKBOARD", () => {});
		this.handler.set("ITEM_SORT", () => {});
		this.handler.set("ITEM_GATHER", () => {});
		this.handler.set("ITEM_MOVE", () => {});
		this.handler.set("MOVE_BAG", () => {});
		this.handler.set("SWITCH_BAG", () => {});
		this.handler.set("ITEM_PICKUP", () => {});
		this.handler.set("USE_CASH_ITEM", () => {});
		this.handler.set("USE_ITEM", () => {});
		this.handler.set("USE_COSMETIC", () => {});
		this.handler.set("USE_RETURN_SCROLL", () => {});
		this.handler.set("USE_UPGRADE_SCROLL", () => {});
		this.handler.set("USE_FLAG_SCROLL", () => {});
		this.handler.set("USE_POTENTIAL_SCROLL", () => {});
		this.handler.set("USE_EQUIP_SCROLL", () => {});
		this.handler.set("USE_SUMMON_BAG", () => {});
		this.handler.set("USE_TREASUER_CHEST", () => {});
		this.handler.set("USE_SKILL_BOOK", () => {});
		this.handler.set("USE_CATCH_ITEM", () => {});
		this.handler.set("USE_MOUNT_FOOD", () => {});
		this.handler.set("REWARD_ITEM", () => {});
		this.handler.set("HYPNOTIZE_DMG", () => {});
		this.handler.set("MOB_NODE", () => {});
		this.handler.set("DISPLAY_NODE", () => {});
		this.handler.set("MOVE_LIFE", () => {});
		this.handler.set("AUTO_ASSIGN_AP", () => {});
		this.handler.set("AUTO_AGGRO", () => {});
		this.handler.set("FRIENDLY_DAMAGE", () => {});
		this.handler.set("REISSUE_MEDAL", () => {});
		this.handler.set("MONSTER_BOMB", () => {});
		this.handler.set("MOB_BOMB", () => {});
		this.handler.set("NPC_SHOP", () => {});
		this.handler.set("NPC_TALK", () => {});
		this.handler.set("HIRED_REMOTE", () => {});
		this.handler.set("NPC_TALK_MORE", () => {});
		this.handler.set("NPC_ACTION", () => {});
		this.handler.set("QUEST_ACTION", () => {});
		this.handler.set("STORAGE", () => {});
		this.handler.set("GENERAL_CHAT", () => {});
		this.handler.set("PARTYCHAT", () => {});
		this.handler.set("WHISPER", () => {});
		this.handler.set("MESSENGER", () => {});
		this.handler.set("DISTRIBUTE_AP", () => {});
		this.handler.set("DISTRIBUTE_SP", () => {});
		this.handler.set("PLAYER_INTERACTION", () => {});
		this.handler.set("GUILD_OPERATION", () => {});
		this.handler.set("DENY_GUILD_REQUEST", () => {});
		this.handler.set("ALLIANCE_OPERATION", () => {});
		this.handler.set("DENY_ALLIANCE_REQUEST", () => {});
		this.handler.set("PUBLIC_NPC", () => {});
		this.handler.set("BBS_OPERATION", () => {});
		this.handler.set("PARTY_OPERATION", () => {});
		this.handler.set("DENY_PARTY_REQUEST", () => {});
		this.handler.set("ALLOW_PARTY_INVITE", () => {});
		this.handler.set("BUDDYLIST_MODIFY", () => {});
		this.handler.set("CYGNUS_SUMMON", () => {});
		this.handler.set("SHIP_OBJECT", () => {});
		this.handler.set("BUY_CS_ITEM", () => {});
		this.handler.set("COUPON_CODE", () => {});
		this.handler.set("CS_UPDATE", () => {});
		this.handler.set("DAMAGE_SUMMON", () => {});
		this.handler.set("MOVE_SUMMON", () => {});
		this.handler.set("SUMMON_ATTACK", () => {});
		this.handler.set("SUB_SUMMON", () => {});
		this.handler.set("REMOVE_SUMMON", () => {});
		this.handler.set("SPAWN_PET", () => {});
		this.handler.set("MOVE_PET", () => {});
		this.handler.set("PET_CHAT", () => {});
		this.handler.set("PET_COMMAND", () => {});
		this.handler.set("PET_FOOD", () => {});
		this.handler.set("PET_LOOT", () => {});
		this.handler.set("PET_AUTO_POT", () => {});
		this.handler.set("MONSTER_CARNIVAL", () => {});
		this.handler.set("DUEY_ACTION", () => {});
		this.handler.set("USE_HIRED_MERCHANT", () => {});
		this.handler.set("MERCH_ITEM_STORE", () => {});
		this.handler.set("CANCEL_DEBUFF", () => {});
		this.handler.set("MAPLETV", () => {});
		this.handler.set("LEFT_KNOCK_BACK", () => {});
		this.handler.set("SNOWBALL", () => {});
		this.handler.set("COCONUT", () => {});
		this.handler.set("REPAIR", () => {});
		this.handler.set("REPAIR_ALL", () => {});
		this.handler.set("GAME_POLL", () => {});
		this.handler.set("OWL", () => {});
		this.handler.set("OWL_WARP", () => {});
		this.handler.set("USE_OWL_MINERVA", () => {});
		this.handler.set("RPS_GAME", () => {});
		this.handler.set("UPDATE_QUEST", () => {});
		this.handler.set("USE_ITEM_QUEST", () => {});
		this.handler.set("RING_ACTION", () => {});
		this.handler.set("SOLOMON", () => {});
		this.handler.set("USE_TELE_ROCK", () => {});
		this.handler.set("PAM_SONG", () => {});
		this.handler.set("REPORT", () => {});
		this.handler.set("PARTY_SEARCH_START", () => {});
		this.handler.set("PARTY_SEARCH_STOP", () => {});
		this.handler.set("REQUEST_FAMILY", () => {});
		this.handler.set("OPEN_FAMILY", () => {});
		this.handler.set("FAMILY_OPERATION", () => {});
		this.handler.set("DELETE_JUNIOR", () => {});
		this.handler.set("DELETE_SENIOR", () => {});
		this.handler.set("USE_FAMILY", () => {});
		this.handler.set("FAMILY_PRECEPT", () => {});
		this.handler.set("FAMILY_SUMMON", () => {});
		this.handler.set("ACCEPT_FAMILY", () => {});
		this.handler.set("ITEM_MAKER", () => {});
		this.handler.set("WEDDING_PRESENT", () => {});
		this.handler.set("MONSTER_BOOK_COVER", () => {});
		this.handler.set("QUEST_POT_FEED", () => {});
		this.handler.set("QUEST_POT_OPEN", () => {});
		this.handler.set("QUEST_POT", () => {});
		this.handler.set("PET_EXCEPTION_LIST", () => {});
	}

	public static getHandler(headerNum: number) {
		// console.log(headerNum);
		const opcodeTitle = Opcodes.getClientOpcodeByValue(headerNum);
		if (!opcodeTitle) {
			const opcodeValue = "0x" + ("00" + headerNum.toString(16).toUpperCase()).slice(-2);
			console.log(`[Error] Code : (${headerNum}) 에 대한 Handler를 찾을 수 없습니다.`);
			return (client: MapleClient, reader: PacketReader) => {};
		}
		console.log(`[LOG] Code: ${headerNum} ${opcodeTitle} `);
		return PacketHandlerManager.handler.get(opcodeTitle);
	}
}

export default PacketHandlerManager;

const NOT_YET_IMPLEMENTED = (client: MapleClient, reader: PacketReader) => void {};

// private static handler: IOpcodesWithHandler = {
// 	PONG: PongHandler, // 핑퐁
// 	CLIENT_HELLO: () => {},
// 	CLIENT_ERROR: ErrorHandler,

// 	LOGIN_PASSWORD: LoginHandler, // 로그인
// 	CHARLIST_REQUEST: CharacterListRequestHandler, // 캐릭터 선택창 진입

// 	CHECK_CHAR_NAME: CheckCharacterNameHandler, // 캐릭터 생성 - 닉네임 유효성 확인
// 	CREATE_CHAR: CreateCharacterHandler, // 캐릭터생성 완료
// 	// DELETE_CHAR: DeleteCharacterHandler, // 캐릭터 삭제
// 	CHAR_SELECT: SelectCharacterHandler, // 캐릭터 선택

// 	CHAR_SELECT_WITH_SPW: SelectCharacterWithSPWHandler, // 캐릭터 선택 (2차 비밀번호와 함께)
// 	// AUTH_SECOND_PASSWORD: AuthSecondPasswordHandler, // 2차비밀번호 생성

// 	// RELOG_REQUEST: TempEmptyHandler, // 인게임 -> 로그인창시
// 	// Login Server 관련 OP CODE 끝

// 	// 여기서부터 인게임
// 	CHANGE_CHANNEL: () => {}, // 캐릭터 채널 변경
// 	PLAYER_LOGGEDIN: LoggedInHandler, // 로그인 이후
// 	ENTER_CASH_SHOP: () => {}, // 캐시샵 진입
// 	MOVE_PLAYER: () => {}, // 캐릭터 이동
// 	CHAR_INFO_REQUEST: () => {}, // 캐릭터 정보 보기
// 	CLOSE_RANGE_ATTACK: () => {},
// 	RANGED_ATTACK: () => {},
// 	MAGIC_ATTACK: () => {},
// 	PASSIVE_ENERGY: () => {},
// 	SPECIAL_MOVE: () => {},
// 	FACE_EXPRESSION: () => {},
// 	TAKE_DAMAGE: () => {},
// 	HEAL_OVER_TIME: () => {},
// 	CANCEL_BUFF: () => {},
// 	MECH_CANCEL: () => {},
// 	CANCEL_ITEM_EFFECT: () => {},
// 	USE_CHAIR: () => {},
// 	CANCEL_CHAIR: () => {},
// 	WHEEL_OF_FORTUNE: () => {},
// 	USE_ITEMEFFECT: () => {},
// 	SKILL_EFFECT: () => {},
// 	QUICK_SLOT: () => {},
// 	MESO_DROP: () => {},
// 	CHANGE_KEYMAP: () => {},
// 	CHANGE_MAP: () => {},
// 	CHANGE_MAP_SPECIAL: () => {},
// 	USE_INNER_PORTAL: () => {},
// 	TROCK_ADD_MAP: () => {},
// 	SKILL_MACRO: () => {},
// 	GIVE_FAME: () => {},
// 	TRANSFORM_PLAYER: () => {},
// 	NOTE_ACTION: () => {},
// 	NOTE_RECEIVE_GIFT: () => {},
// 	USE_DOOR: () => {},
// 	DAMAGE_REACTOR: () => {},
// 	CLICK_REACTOR: () => {},
// 	TOUCH_REACTOR: () => {},
// 	CLOSE_CHALKBOARD: () => {},
// 	ITEM_SORT: () => {},
// 	ITEM_GATHER: () => {},
// 	ITEM_MOVE: () => {},
// 	MOVE_BAG: () => {},
// 	SWITCH_BAG: () => {},
// 	ITEM_PICKUP: () => {},
// 	USE_CASH_ITEM: () => {},
// 	USE_ITEM: () => {},
// 	USE_COSMETIC: () => {},
// 	USE_RETURN_SCROLL: () => {},
// 	USE_UPGRADE_SCROLL: () => {},
// 	USE_FLAG_SCROLL: () => {},
// 	USE_POTENTIAL_SCROLL: () => {},
// 	USE_EQUIP_SCROLL: () => {},
// 	USE_SUMMON_BAG: () => {},
// 	USE_TREASUER_CHEST: () => {},
// 	USE_SKILL_BOOK: () => {},
// 	USE_CATCH_ITEM: () => {},
// 	USE_MOUNT_FOOD: () => {},
// 	REWARD_ITEM: () => {},
// 	HYPNOTIZE_DMG: () => {},
// 	MOB_NODE: () => {},
// 	DISPLAY_NODE: () => {},
// 	MOVE_LIFE: () => {},
// 	AUTO_ASSIGN_AP: () => {},
// 	AUTO_AGGRO: () => {},
// 	FRIENDLY_DAMAGE: () => {},
// 	REISSUE_MEDAL: () => {},
// 	MONSTER_BOMB: () => {},
// 	MOB_BOMB: () => {},
// 	NPC_SHOP: () => {},
// 	NPC_TALK: () => {},
// 	HIRED_REMOTE: () => {},
// 	NPC_TALK_MORE: () => {},
// 	NPC_ACTION: () => {},
// 	QUEST_ACTION: () => {},
// 	STORAGE: () => {},
// 	GENERAL_CHAT: () => {},
// 	PARTYCHAT: () => {},
// 	WHISPER: () => {},
// 	MESSENGER: () => {},
// 	DISTRIBUTE_AP: () => {},
// 	DISTRIBUTE_SP: () => {},
// 	PLAYER_INTERACTION: () => {},
// 	GUILD_OPERATION: () => {},
// 	DENY_GUILD_REQUEST: () => {},
// 	ALLIANCE_OPERATION: () => {},
// 	DENY_ALLIANCE_REQUEST: () => {},
// 	PUBLIC_NPC: () => {},
// 	BBS_OPERATION: () => {},
// 	PARTY_OPERATION: () => {},
// 	DENY_PARTY_REQUEST: () => {},
// 	ALLOW_PARTY_INVITE: () => {},
// 	BUDDYLIST_MODIFY: () => {},
// 	CYGNUS_SUMMON: () => {},
// 	SHIP_OBJECT: () => {},
// 	BUY_CS_ITEM: () => {},
// 	COUPON_CODE: () => {},
// 	CS_UPDATE: () => {},
// 	DAMAGE_SUMMON: () => {},
// 	MOVE_SUMMON: () => {},
// 	SUMMON_ATTACK: () => {},
// 	SUB_SUMMON: () => {},
// 	REMOVE_SUMMON: () => {},
// 	SPAWN_PET: () => {},
// 	MOVE_PET: () => {},
// 	PET_CHAT: () => {},
// 	PET_COMMAND: () => {},
// 	PET_FOOD: () => {},
// 	PET_LOOT: () => {},
// 	PET_AUTO_POT: () => {},
// 	MONSTER_CARNIVAL: () => {},
// 	DUEY_ACTION: () => {},
// 	USE_HIRED_MERCHANT: () => {},
// 	MERCH_ITEM_STORE: () => {},
// 	CANCEL_DEBUFF: () => {},
// 	MAPLETV: () => {},
// 	LEFT_KNOCK_BACK: () => {},
// 	SNOWBALL: () => {},
// 	COCONUT: () => {},
// 	REPAIR: () => {},
// 	REPAIR_ALL: () => {},
// 	GAME_POLL: () => {},
// 	OWL: () => {},
// 	OWL_WARP: () => {},
// 	USE_OWL_MINERVA: () => {},
// 	RPS_GAME: () => {},
// 	UPDATE_QUEST: () => {},
// 	USE_ITEM_QUEST: () => {},
// 	RING_ACTION: () => {},
// 	SOLOMON: () => {},
// 	USE_TELE_ROCK: () => {},
// 	PAM_SONG: () => {},
// 	REPORT: () => {},
// 	PARTY_SEARCH_START: () => {},
// 	PARTY_SEARCH_STOP: () => {},
// 	REQUEST_FAMILY: () => {},
// 	OPEN_FAMILY: () => {},
// 	FAMILY_OPERATION: () => {},
// 	DELETE_JUNIOR: () => {},
// 	DELETE_SENIOR: () => {},
// 	USE_FAMILY: () => {},
// 	FAMILY_PRECEPT: () => {},
// 	FAMILY_SUMMON: () => {},
// 	ACCEPT_FAMILY: () => {},
// 	ITEM_MAKER: () => {},
// 	WEDDING_PRESENT: () => {},
// 	MONSTER_BOOK_COVER: () => {},
// 	QUEST_POT_FEED: () => {},
// 	QUEST_POT_OPEN: () => {},
// 	QUEST_POT: () => {},
// 	PET_EXCEPTION_LIST: () => {},
// } as const;
