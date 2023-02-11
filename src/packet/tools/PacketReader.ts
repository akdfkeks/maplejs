import { Point } from "@/src/lib/Point";
import iconv from "iconv-lite";

class PacketReader {
	private buffer: Buffer;
	private offset: number = 0;

	constructor(data: Buffer) {
		this.buffer = Buffer.from(data);
		this.offset = 0;
	}

	public readByte() {
		const r = this.buffer.readInt8(this.offset);
		this.offset += 1;
		return r & 0xff;
	}

	public readUByte() {
		const r = this.buffer.readUInt8(this.offset);
		this.offset += 1;
		return r & 0xff;
	}

	// public readOpcode() {
	// 	const byte1 = this.readUByte();
	// 	const byte2 = this.readUByte();
	// 	return (byte2 << 8) + byte1;
	// }

	public readInt() {
		const r = this.buffer.readInt32LE(this.offset);
		this.offset += 4;
		return r;
	}

	public readShort() {
		const byte1 = this.readByte();
		const byte2 = this.readByte();

		return (byte2 << 8) + byte1;
	}

	public readUShort() {
		let r = this.readShort();
		if (r < 0) r += 65536;
		return r;
	}

	public readLong() {
		const byte1 = this.readByte();
		const byte2 = this.readByte();
		const byte3 = this.readByte();
		const byte4 = this.readByte();
		const byte5 = this.readByte();
		const byte6 = this.readByte();
		const byte7 = this.readByte();
		const byte8 = this.readByte();

		return (
			(byte8 << 56) +
			(byte7 << 48) +
			(byte6 << 40) +
			(byte5 << 32) +
			(byte4 << 24) +
			(byte3 << 16) +
			(byte2 << 8) +
			byte1
		);
	}

	public readAsciiString(n: number) {
		const r = Buffer.alloc(n);
		for (let i = 0; i < n; i++) {
			r[i] = this.readByte();
		}

		return iconv.decode(r, "cp949");
	}
	public readMapleAsciiString() {
		return this.readAsciiString(this.readShort()); // 아마 String 의 Length 를 읽는듯 싶음
	}

	public readPos(): Point {
		const x = this.readShort();
		const y = this.readShort();
		return new Point({ x, y });
	}

	public skip(length: number): void {
		this.offset += length;
	}

	public getBuffer(): Buffer {
		return this.buffer;
	}
}

export default PacketReader;
