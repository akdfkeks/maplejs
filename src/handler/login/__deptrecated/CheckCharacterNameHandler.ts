import MapleClient from "../client/Client";
import PacketReader from "../packet/tools/PacketReader";
import PacketWriter from "../packet/tools/PacketWriter";
import Opcodes from "../packet/tools/Opcodes";
import StringFactory from "../packet/tools/StringFactory";
import prisma from "../database/prisma";
import AccountPacketFactory from "packet/factory/AccountPacket";

const CheckCharacterNameHandler = async (client: MapleClient, reader: PacketReader) => {
	const nickname = reader.readMapleAsciiString();
	const isAvailable = await checkNickAvailable(nickname);

	client.sendPacket(AccountPacketFactory.getNameAvailability(nickname, isAvailable));
};

// 캐릭터 이름 검사
async function checkNickAvailable(nickname: string): Promise<boolean> {
	const stringFactory = new StringFactory(nickname);

	// 닉네임 예약어
	const RESERVED = ["관리자", "운영자", "메이플", "GM"];
	if (RESERVED.includes(nickname)) {
		return false;
	}

	// 문자열 길이
	const length = stringFactory.byteLength;
	if (length < 4 && length > 12) {
		return false;
	}

	// 캐릭터 이름 유효성
	if (!nickname.match(/[a-zA-Z0-9가-힣]/)) {
		return false;
	}

	// 중복닉네임 검사
	if (await checkNickExists(nickname)) {
		return false;
	}

	return true;
}

// 닉네임 중복 여부 확인
async function checkNickExists(name: string): Promise<boolean> {
	const count = await prisma.character.count({ where: { name } });
	return count > 0 ? true : false;
}

export default CheckCharacterNameHandler;
