import MapleClient from "../../client/Client";
import PacketReader from "../../packet/tools/PacketReader";
import prisma from "../../database/prisma";

import LoginPacket from "@/src/tools/packet/LoginPacket";
import LittleEndianPacketWriter from "../../packet/tools/NewPacketWriter";
import { cli } from "winston/lib/winston/config";
import MaplePacketCreator from "../../tools/MaplePacketCreator";
import { Channel } from "diagnostics_channel";
import LoginHelper from "./LoginHelper";
import { MapleCharacter } from "@/src/client/MapleCharacter";
import MapleInventory from "@/src/client/inventory/MapleInventory";
import Item from "@/src/client/inventory/Item";
import { InvType } from "@/src/client/inventory/InventoryType";
import ItemInformationProvider from "@/src/server/ItemInformationProvider";

class LoginHandler {
	private static loginFailCount(c: MapleClient) {}

	public static async createChar(client: MapleClient, reader: PacketReader) {
		// 로그인 여부 확인
		// if(!client.isLoggedIn()) client.getSession().destroy()

		const jobType = 1; // BigBang 이전 모험가 : 1
		// const dualblade = 0; // 모험가: 0, 듀블: 1
		const gender = client.gender; // 나중에 닉네임으로 남녀 만드는것도 가능할듯

		const name = reader.readMapleAsciiString();
		const face = reader.readInt();
		const hair = reader.readInt();
		const hairColor = 0;
		const skin = 0;
		const top = reader.readInt();
		const bottom = reader.readInt();
		const shoes = reader.readInt();
		const weapon = reader.readInt();

		const str = 12; // 뒤에 값 안읽고 그냥 상수로 사용하네..
		const dex = 5; // 넷 다 readByte() 로 받아올 수 있음
		const int = 4; // 근데 주사위가 없지 않나?
		const luk = 4;

		if (!LoginHelper.checkMakeCharInfo(gender > 0 ? true : false, face, hair, top, bottom, shoes, weapon)) {
			console.log("[Error] 데이터가 .wz 와 일치하지 않습니다.");
			client.getSession().destroy();
		}

		// 검증을 모두 마친 뒤, 인벤토리를 생성해야함
		const newChar = MapleCharacter.getDefault(client, jobType);
		newChar.world = client.worldId;
		newChar.face = face;
		newChar.hair = hair + hairColor;
		newChar.gender = gender;
		newChar.name = name;
		newChar.skin = skin;
		newChar.stats.str = str;
		newChar.stats.dex = dex;
		newChar.stats.int = int;
		newChar.stats.luk = luk;

		console.log("[LOG] Default character created");
		// console.log(newChar);

		const li = ItemInformationProvider.getInstance();

		// 인벤토리쪽이 제일 수상해
		const equip: MapleInventory = newChar.getInventory(6); // 장착중인 장비

		let item: Item = li.getEquipById(top);
		item.position = -5;
		equip.addFromDB(item);

		if (bottom > 0) {
			item = li.getEquipById(bottom);
			item.position = -6;
			equip.addFromDB(item);
		}

		item = li.getEquipById(shoes);
		item.position = -7;
		equip.addFromDB(item);

		item = li.getEquipById(weapon);
		item.position = -11;
		equip.addFromDB(item);

		// 4161001: 초보자 안내서
		if (jobType == 1) newChar.getInventory(InvType.ETC).addItem(new Item(4161001, 0, 1, 0));

		// 어쩌구 주저리주저리
		if (true) {
			MapleCharacter.saveNewCharToDB(newChar, jobType);
			client.sendPacket(LoginPacket.addNewCharEntry(newChar, true));
			// client.createdChar(char.id); 접속 허용 목록 기능? 같아보이는데 일단은 패쓰
		} else {
			client.sendPacket(LoginPacket.addNewCharEntry(newChar, false));
		}
	}

	public static async login(client: MapleClient, reader: PacketReader) {
		const name = reader.readMapleAsciiString();
		const password = reader.readMapleAsciiString();
		// console.log(name, password);
		// 아이디로 계정 조회

		const loginOk = await client.login(name, password);
		if (loginOk != 0) return client.sendPacket(LoginPacket.getLoginFailed(loginOk));

		// 로그인 성공

		// 로그인 성공 패킷 전송
		client.sendPacket(LoginPacket.getAuthSuccessRequest(client));

		// 서버 목록 패킷 전송
		client.sendPacket(LoginPacket.getServerList());
		client.sendPacket(LoginPacket.getEndOfServerList());

		//
	}

	public static serverListRequest(client: MapleClient) {
		client.sendPacket(LoginPacket.getServerList());
		client.sendPacket(LoginPacket.getEndOfServerList());
	}

	public static async charListRequest(client: MapleClient, reader: PacketReader) {
		// if client is not logged-in, need to disconnect
		reader.skip(1);
		const worldId = reader.readByte();
		const channelId = reader.readByte() + 1;

		// World ID 를 기준으로 캐릭터 목록을 조회합니다.
		const chars = await client.loadCharacters(worldId);

		// true 자리에 채널 인스턴스 존재를 확인하는 코드 대체
		// if (chars !== null && true) {
		if (chars !== null && true) {
			client.worldId = worldId;
			client.channelId = channelId;
			client.sendPacket(LoginPacket.getCharList(null, chars, client.charslots));
		} else {
			client.getSession().destroy();
		}
	}

	public static charSelect(client: MapleClient, reader: PacketReader) {
		const charId = reader.readInt();
		// if(로그인중이 아니거나, 5트 넘었거나, 채널이 없거나, 어쩌구) -> 연결끊기
		// const ip = client.ipv4
		client.sendPacket(MaplePacketCreator.getServerIP(client, 8585, charId));
	}

	public static checkCharName(client: MapleClient, reader: PacketReader) {
		const name = reader.readMapleAsciiString();
		client.sendPacket(LoginPacket.charNameResponse(name, true)); //ㅋㅋ일단 true 줘버려~
	}
}

export default LoginHandler;
