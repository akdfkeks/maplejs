import Client from "../../client/client";
import PacketReader from "./PacketReader";
import ErrorHandler from "../../handler/ErrorHandler";
import LoginHandler from "../../handler/LoginHandler";
import PongHandler from "../../handler/PongHandler";
import TempEmptyHandler from "../../handler/TempEmptyHandler";
import CharacterListRequestHandler from "../../handler/CharacterListRequestHandler";
import CharacterSelectHandler from "../../handler/CharacterSelectHandler";
import CheckCharacterNameHandler from "../../handler/CheckCharacterNameHandler";
import CreateCharacterHandler from "../../handler/CreateCharacterHandler";
import AuthSecondPasswordHandler from "../../handler/AuthSecondPasswordHandler";
import CharacterSelectWithSPWHandler from "../../handler/CharacterSelectWithSPWHandler";
import Opcodes from "./Opcodes";
import DeleteCharacterHandler from "../../handler/DeleteCharacterHandler";
import LoggedInHandler from "../../handler/channel/LoggedInHandler";

interface IOpcodesWithHandler {
	[opcode: string]: (client: Client, reader: PacketReader) => void;
}

// Packet의 OP CODE 별 실행될 메서드를 등록
class PacketHandler {
	private static handler: IOpcodesWithHandler = {
		PONG: PongHandler, // 핑퐁
		CLIENT_HELLO: () => {},
		CLIENT_ERROR: ErrorHandler,

		LOGIN_PASSWORD: LoginHandler, // 로그인
		CHARLIST_REQUEST: CharacterListRequestHandler, // 캐릭터 선택창 진입

		// CHECK_CHAR_NAME: CheckCharacterNameHandler, // 캐릭터 생성 - 닉네임 유효성 확인
		// CREATE_CHAR: CreateCharacterHandler, // 캐릭터생성 완료
		// DELETE_CHAR: DeleteCharacterHandler, // 캐릭터 삭제
		// CHAR_SELECT: CharacterSelectHandler, // 캐릭터 선택

		// CHAR_SELECT_WITH_SPW: CharacterSelectWithSPWHandler, // 캐릭터 선택 (2차 비밀번호와 함께)
		// AUTH_SECOND_PASSWORD: AuthSecondPasswordHandler, // 2차비밀번호 생성

		// RELOG_REQUEST: TempEmptyHandler, // 인게임 -> 로그인창시
		// Login Server 관련 OP CODE 끝

		// 여기서부터 인게임
		CHANGE_CHANNEL: () => {}, // 캐릭터 채널 변경
		// PLAYER_LOGGEDIN: LoggedInHandler, // 로그인 이후
		ENTER_CASH_SHOP: () => {}, // 캐시샵 진입
		MOVE_PLAYER: () => {}, // 캐릭터 이동
		CHAR_INFO_REQUEST: () => {}, // 캐릭터 정보 보기
		CLOSE_RANGE_ATTACK: () => {},
		RANGED_ATTACK: () => {},
		MAGIC_ATTACK: () => {},
		PASSIVE_ENERGY: () => {},
		SPECIAL_MOVE: () => {},
		FACE_EXPRESSION: () => {},
		TAKE_DAMAGE: () => {},
		HEAL_OVER_TIME: () => {},
		CANCEL_BUFF: () => {},
		MECH_CANCEL: () => {},
		CANCEL_ITEM_EFFECT: () => {},
		USE_CHAIR: () => {},
		CANCEL_CHAIR: () => {},
		WHEEL_OF_FORTUNE: () => {},
		USE_ITEMEFFECT: () => {},
		SKILL_EFFECT: () => {},
		QUICK_SLOT: () => {},
		MESO_DROP: () => {},
		CHANGE_KEYMAP: () => {},
		CHANGE_MAP: () => {},
		CHANGE_MAP_SPECIAL: () => {},
		USE_INNER_PORTAL: () => {},
		TROCK_ADD_MAP: () => {},
		SKILL_MACRO: () => {},
		GIVE_FAME: () => {},
		TRANSFORM_PLAYER: () => {},
		NOTE_ACTION: () => {},
		NOTE_RECEIVE_GIFT: () => {},
		USE_DOOR: () => {},
		DAMAGE_REACTOR: () => {},
		CLICK_REACTOR: () => {},
		TOUCH_REACTOR: () => {},
		CLOSE_CHALKBOARD: () => {},
		ITEM_SORT: () => {},
		ITEM_GATHER: () => {},
		ITEM_MOVE: () => {},
		MOVE_BAG: () => {},
		SWITCH_BAG: () => {},
		ITEM_PICKUP: () => {},
		USE_CASH_ITEM: () => {},
		USE_ITEM: () => {},
		USE_COSMETIC: () => {},
		USE_RETURN_SCROLL: () => {},
		USE_UPGRADE_SCROLL: () => {},
		USE_FLAG_SCROLL: () => {},
		USE_POTENTIAL_SCROLL: () => {},
		USE_EQUIP_SCROLL: () => {},
		USE_SUMMON_BAG: () => {},
		USE_TREASUER_CHEST: () => {},
		USE_SKILL_BOOK: () => {},
		USE_CATCH_ITEM: () => {},
		USE_MOUNT_FOOD: () => {},
		REWARD_ITEM: () => {},
		HYPNOTIZE_DMG: () => {},
		MOB_NODE: () => {},
		DISPLAY_NODE: () => {},
		MOVE_LIFE: () => {},
		AUTO_ASSIGN_AP: () => {},
		AUTO_AGGRO: () => {},
		FRIENDLY_DAMAGE: () => {},
		REISSUE_MEDAL: () => {},
		MONSTER_BOMB: () => {},
		MOB_BOMB: () => {},
		NPC_SHOP: () => {},
		NPC_TALK: () => {},
		HIRED_REMOTE: () => {},
		NPC_TALK_MORE: () => {},
		NPC_ACTION: () => {},
		QUEST_ACTION: () => {},
		STORAGE: () => {},
		GENERAL_CHAT: () => {},
		PARTYCHAT: () => {},
		WHISPER: () => {},
		MESSENGER: () => {},
		DISTRIBUTE_AP: () => {},
		DISTRIBUTE_SP: () => {},
		PLAYER_INTERACTION: () => {},
		GUILD_OPERATION: () => {},
		DENY_GUILD_REQUEST: () => {},
		ALLIANCE_OPERATION: () => {},
		DENY_ALLIANCE_REQUEST: () => {},
		PUBLIC_NPC: () => {},
		BBS_OPERATION: () => {},
		PARTY_OPERATION: () => {},
		DENY_PARTY_REQUEST: () => {},
		ALLOW_PARTY_INVITE: () => {},
		BUDDYLIST_MODIFY: () => {},
		CYGNUS_SUMMON: () => {},
		SHIP_OBJECT: () => {},
		BUY_CS_ITEM: () => {},
		COUPON_CODE: () => {},
		CS_UPDATE: () => {},
		DAMAGE_SUMMON: () => {},
		MOVE_SUMMON: () => {},
		SUMMON_ATTACK: () => {},
		SUB_SUMMON: () => {},
		REMOVE_SUMMON: () => {},
		SPAWN_PET: () => {},
		MOVE_PET: () => {},
		PET_CHAT: () => {},
		PET_COMMAND: () => {},
		PET_FOOD: () => {},
		PET_LOOT: () => {},
		PET_AUTO_POT: () => {},
		MONSTER_CARNIVAL: () => {},
		DUEY_ACTION: () => {},
		USE_HIRED_MERCHANT: () => {},
		MERCH_ITEM_STORE: () => {},
		CANCEL_DEBUFF: () => {},
		MAPLETV: () => {},
		LEFT_KNOCK_BACK: () => {},
		SNOWBALL: () => {},
		COCONUT: () => {},
		REPAIR: () => {},
		REPAIR_ALL: () => {},
		GAME_POLL: () => {},
		OWL: () => {},
		OWL_WARP: () => {},
		USE_OWL_MINERVA: () => {},
		RPS_GAME: () => {},
		UPDATE_QUEST: () => {},
		USE_ITEM_QUEST: () => {},
		RING_ACTION: () => {},
		SOLOMON: () => {},
		USE_TELE_ROCK: () => {},
		PAM_SONG: () => {},
		REPORT: () => {},
		PARTY_SEARCH_START: () => {},
		PARTY_SEARCH_STOP: () => {},
		REQUEST_FAMILY: () => {},
		OPEN_FAMILY: () => {},
		FAMILY_OPERATION: () => {},
		DELETE_JUNIOR: () => {},
		DELETE_SENIOR: () => {},
		USE_FAMILY: () => {},
		FAMILY_PRECEPT: () => {},
		FAMILY_SUMMON: () => {},
		ACCEPT_FAMILY: () => {},
		ITEM_MAKER: () => {},
		WEDDING_PRESENT: () => {},
		MONSTER_BOOK_COVER: () => {},
		QUEST_POT_FEED: () => {},
		QUEST_POT_OPEN: () => {},
		QUEST_POT: () => {},
		PET_EXCEPTION_LIST: () => {},
	};

	public static getHandler(opcode: number) {
		const opcodeTitle = Opcodes.getClientOpcodeByValue(opcode);
		if (!opcodeTitle) return null;

		return PacketHandler.handler[opcodeTitle];
	}
}

export default PacketHandler;
