import MapleClient from "../../client/Client";
import PacketReader from "../../packet/tools/PacketReader";
import LoginPacket from "@/src/tools/packet/LoginPacket";
import MaplePacketCreator from "../../tools/MaplePacketCreator";
import LoginHelper from "./LoginHelper";
import { MapleCharacter } from "@/src/client/MapleCharacter";
import MapleInventory from "@/src/client/inventory/MapleInventory";
import Item from "@/src/client/inventory/Item";
import ItemInformationProvider from "@/src/server/ItemInformationProvider";
import { InventoryType } from "@/src/constant/Const";

class LoginHandler {
	private static loginFailCount(c: MapleClient) {}

	public static async createChar(client: MapleClient, reader: PacketReader) {
		// 로그인 여부 확인
		// if(!client.isLoggedIn()) client.getSession().destroy()

		const jobCode = 0;
		// const dualblade = 0; // 모험가: 0, 듀블: 1
		const gender = client.getGender(); // 나중에 닉네임으로 남녀 만드는것도 가능할듯

		// 패킷에서 캐릭터 정보 추출
		const name = reader.readMapleAsciiString();
		const face = reader.readInt();
		const hair = reader.readInt();
		const hairColor = 0;
		const skin = 0;
		const top = reader.readInt();
		const bottom = reader.readInt();
		const shoes = reader.readInt();
		const weapon = reader.readInt();
		// console.log(top, bottom, shoes, weapon);

		const str = 12; // 넷 다 readByte() 로 받아올 수 있음
		const dex = 5; // 값 안읽고 그냥 상수로 사용하네
		const int = 4; // 주사위가 없어서 이렇게 짜놓은듯
		const luk = 4;

		if (!LoginHelper.checkMakeCharInfo(gender > 0 ? true : false, face, hair, top, bottom, shoes, weapon)) {
			console.log("[Error] 데이터가 WZ 와 일치하지 않습니다.");
			client.getSession().destroy();
		}

		// character skeleton 을 생성합니다
		const newChar = await MapleCharacter.getSkeletonForNewChar(client, jobCode);
		newChar.world = client.getWorld();
		newChar.face = face;
		newChar.hair = hair + hairColor;
		newChar.gender = gender;
		newChar.name = name;
		newChar.skin = skin;
		newChar.stats.str = str;
		newChar.stats.dex = dex;
		newChar.stats.int = int;
		newChar.stats.luk = luk;

		// console.log("[LOG] Default character created");
		// console.log(newChar);

		// 아이템 관련 메서드를 가진 인스턴스
		const li = ItemInformationProvider.getInstance();

		// 캐릭터의 인벤토리(장비) 객체를 불러옵니다. (당연히 비어있음)
		// 이 equip 는 newChar 의 인벤토리를 참조하고 있습니다!!!
		// 존나게 객체지향적인 방식입니다 사용에 주의가 필요해요
		const equip: MapleInventory = newChar.getInventory(InventoryType.EQUIPPED);

		// Item Code 를 통해 item 객체를 만들어서 인벤토리에 추가합니다
		// addFromDB() 는 item 객체를 받아 인벤토리에 추가하는 역할을 수행합니다
		// 현재 DB 에 캐릭터가 존재하지 않고, 아이템이 메모리에 존재하므로
		// DB 로 부터 불러온 척 하기 위해 해당 메서드를 사용합니다.
		let item: Item = li.getEquipByCode(top);
		item.position = -5;
		equip.addFromDB(item);

		if (bottom > 0) {
			item = li.getEquipByCode(bottom);
			item.position = -6;
			equip.addFromDB(item);
		}

		item = li.getEquipByCode(shoes);
		item.position = -7;
		equip.addFromDB(item);

		item = li.getEquipByCode(weapon);
		item.position = -11;
		equip.addFromDB(item);

		// 4161001: 초보자 안내서
		// if (jobType == 1)
		// 이거 왜 동작을 안하지?
		newChar.getInventory(InventoryType.ETC).addItem(new Item(4161001, 0, 1, 0));

		// 무슨무슨 조건
		if (true) {
			// equip 을 포함한 인벤토리들은 newChar 내부의 객체를 참조하고 있으므로
			// newChar 를 전달해주면 됩니다~
			// console.log(newChar.getInventory(InvType.EQUIPPED));
			// console.log(newChar.getInventory(InvType.ETC));

			// 생성한 캐릭터 저장
			// 화스에서는 저장 결과를 기다리지 않는데
			// 노드에서는 일단 대기하게 해봄
			MapleCharacter.saveNewCharToDB(newChar, jobCode).then(
				() =>
					// addNewCharEntry 에는 DB 조회를 하지 않는다
					// 따라서 newChar 를 그냥 패킷에 담아서 보내면 됨
					// (생성한것처럼 보이게 작동한다는 의미)
					// 근데 생성하고 개빠르게 접속하면 데이터 생성중에 서버 죽을거같은디?
					// save 결과를 대기해야할지도?
					// 이새기가 제대로된 값을 안보내주고 있는거같어~
					client.sendPacket(LoginPacket.addNewCharEntry(newChar, true))
				// client.createdChar(char.id); 접속 허용 목록 기능? 같아보이는데 일단은 패쓰
			);
		} else {
			client.sendPacket(LoginPacket.addNewCharEntry(newChar, false));
		}
	}

	public static async login(client: MapleClient, reader: PacketReader) {
		const name = reader.readMapleAsciiString();
		const password = reader.readMapleAsciiString();

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
		if (!client.isLoggedIn()) client.getSession().destroy();

		reader.skip(1);
		const worldId = reader.readByte();
		const channel = reader.readByte() + 1;
		const chars: Array<MapleCharacter> = await client.loadCharacters(worldId);
		// console.log("[Check] 조회된 캐릭터 수 : " + chars.length); OK 정상

		// [임시] true에 월드 상태체크, ..등등
		if (chars !== null && true) {
			client.setWord(worldId);
			client.setChannel(channel);
			client.setCharslots(6);
			client.sendPacket(LoginPacket.getCharList(null, chars, client.getCharslots()));
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
