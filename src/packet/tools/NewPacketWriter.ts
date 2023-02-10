import StringFactory from "./StringFactory";

class PacketWriter {
	private buffer: Buffer;
	private offset: number;

	/** TODO
	 * 기존 PacketWriter 는 write 마다 realloc 을 통해서
	 * 버퍼 새로 만들고 기존 데이터 옮기고 하고 있음
	 * 용도에 맞게 고정크기로 생성하는 방식으로 변경하기
	 */
}

export default PacketWriter;
