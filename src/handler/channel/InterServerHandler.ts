import MapleClient from "@/src/client/Client";
import { MapleCharacter } from "@/src/client/MapleCharacter";
import Pair from "@/src/lib/Pair";
import PacketReader from "@/src/packet/tools/PacketReader";
import MaplePacketCreator from "@/src/tools/MaplePacketCreator";
import { cli } from "winston/lib/winston/config";
import LoginServer from "../login/LoginServer";
import ChannelServer from "./ChannelServer";

class InterServerHandler {
	// private static npcs = new Array<{ npcId: number; msg: string }>();
	public static async loggedIn(client: MapleClient, reader: PacketReader) {
		const playerId = reader.readInt();
		// const channelServer = client.getChannelServer()
		// if (channelServer.isShutdown()) {
		// 	client.getSession().destroy();
		// 	return;
		// }
		let player: MapleCharacter = null;
		// if(transger == null)
		player = await MapleCharacter.loadCharFromDB(client, playerId, true);

		const ip: Pair<string, string> = LoginServer.getLoginAuth(playerId);
		const s = "127.0.0.1"; // client.getSessionIpAddress()

		if (ip == null || !(s.substring(s.indexOf("/") + 1, s.length) == ip.left)) {
			if (ip != null) LoginServer.putLoginAuth(playerId, ip.left, ip.right);
			client.getSession().destroy();
			return;
		}
		// client.setTempIp(ip.right)

		client.setPlayer(player);
		client.setAccId(player.accountId);

		// if(!client.checkIpAddress()){ // Remote hack
		// 	client.getSession().destroy()
		// 	return
		// }
		// const codeHash = LoginServer.getCodeHash(playerId)
		// if(codeHash == null) {
		// 	client.getSession().destroy()
		// 	return
		// }
		// c.setCodeHash(codeHash)
		const state = 0; // [임시] client.loginState; 로그아웃 안만들어서 아직쓰면안됨
		let allowLogin = false;
		if (
			state == MapleClient.LOGIN_SERVER_TRANSITION ||
			state == MapleClient.CHANGE_CHANNEL ||
			state == MapleClient.LOGIN_NOTLOGGEDIN
		) {
			//[임시]
			// allowLogin = !World.isCharacterListConnected(client.loadCharacterNames(client.worldId));
			allowLogin = true;
		}

		if (!allowLogin) {
			client.setPlayer(null);
			client.getSession().destroy();
			return;
		}

		client.loadChatblockData();
		if (client.canChat()) player.canChat(true);

		// [임시]
		client.updateLoginState(MapleClient.LOGIN_LOGGEDIN, "127.0.0.1");

		// channelServer.addPlayer(player)
		// player.givCoolDowns(PlayerBuffStorage.getCooldownsFromStorage(player.id))
		// player.giveSilentBuffs(PlayerBuffStorage.getBuffsFromStorage(player.id))
		// player.giveSilentDebuffs(PlayerBuffStorage.getDiseaseFromStorage(player.id))

		client.sendPacket(MaplePacketCreator.getCharInfo(player));

		// player.removeAll(4031282, false) // 뭐냐 이놈?

		// player.getMap().addPlayer(player);

		// client.sendPacket(CSPacket.enableCSUse());
		// client.sendPacket(MaplePacketCreator.setNPCScriptable(npcs));

		// try {
		// 	// 친구 목록
		// 	const buddyIdList = player.getBuddylist().getBuddyIds();
		// 	World.Buddy.loggedOn(player.name, player.id, client.channel, buddyIdList);
		// 	if (player.getParty() != null) {
		// 		const party = player.getParty();
		// 		World.Party.updateParty(party.id, PartyOperation.LOG_ONFF, new MaplePartyCharacter(player));
		// 	}
		// 	const onlineBuddies = World.Find.multiBuddyFind(player.id, buddyIdList);
		// 	for (const buddy of onlineBuddies) {
		// 		player.getBuddylist().get(buddy.getCharacterId()).setChannel(buddy.getChannel());
		// 	}
		// 	client.sendPacket(MaplePacketCreator.updateBuddylist(player.getBuddylist().getBuddies()));

		// 	// 메신저
		// 	// const messenger = player.getMessenger();
		// 	// if (messenger != null) {
		// 	// 	World.Messenger.silentJoinMessenger(messenger.id, new MapleMessengerCharacter(client.getPlayer()));
		// 	// 	World.Messenger.updateMessenger(messenger.id, client.getPlayer().name, client.channel);
		// 	// }

		// 	// 길드 [임시]
		// 	if (player.guildid > 0) {
		// 	}
		// 	// 패밀리
		// 	// if (player.familyId > 0) {
		// 	// }
		// 	client.sendPacket(FamilyPacket.getFamilyData());
		// 	client.sendPacket(FamilyPacket.getFamilyInfo(player));
		// } catch (err) {}
		// player.client.sendPacket(MaplePacketCreator.serverMessage(channelServer.getServerMessage()));
		// player.sendMacros();
		// player.showNote();
		// // player.sendImp()
		// player.updatePartyMemberHP();
		// player.baseSkills();
		// client.sendPacket(MaplePacketCreator.getKeymap(player.getKeyLayout()));
		// player.updatePetAuto();
		// player.expirationTask(true, true); //transfer == null)

		// // 다크나이트
		// if (player.job == 132) {
		// 	player.checkBerserk();
		// }

		// player.spawnSavedPets();

		// // 소환수?
		// if (player.stats.equippedSummon > 0) {
		// 	SkillFactory.getSkill(player.stats.equippedSummon).getEffect(1).applyTo(player);
		// }

		// DueyHandler.checkReceivePackage(player);
		// // if (player.hide) client.sendPacket(MaplePacketCreator.GmHide(player.hide));

		// // client.
	}
}

export default InterServerHandler;
