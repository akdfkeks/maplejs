import PongHandler from "@/src/handler/PongHandler";
import MapleClient from "./Client";
import Opcodes from "../packet/tools/Opcodes";
import PacketReader from "../packet/tools/PacketReader";
import LoginHandler from "../handler/login/LoginHandler";
import CharacterSelectHandler from "../handler/login/__deptrecated/CharacterSelectHandler";
import { read } from "fs";

type Handler = (client: MapleClient, reader?: PacketReader) => void;

// Packet의 OP CODE 별 실행될 메서드를 등록
class PacketHandler {
	static handler: Map<string, Handler>;
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

	public static handlePacket(client: MapleClient, reader: PacketReader) {
		const headerNum = reader.readShort();
		const opcodeName = Opcodes.getClientOpcodeByValue(headerNum);

		if (!opcodeName) console.log(`[Error] Code : (${headerNum}) 에 대한 Handler를 찾을 수 없습니다.`);

		PacketHandler.handler.get(opcodeName)(client, reader);
		console.log(`[LOG] Code: ${headerNum} ${opcodeName} `);

		// console.log("[RECV]");
		// console.log(reader.getBuffer());
		return;
	}
}

export default PacketHandler;

// const NOT_YET_IMPLEMENTED = (client: MapleClient, reader: PacketReader) => void {};
