import { Point } from "@/src/lib/Point";
import StringFactory from "./StringFactory";

class LittleEndianPacketWriter {
	private buffer: Buffer;
	private offset: number;

	constructor(size: number = 32) {
		this.buffer = Buffer.alloc(size);
	}

	public getPacket() {
		return this.buffer;
	}

	public toSting() {
		return this.buffer.toString();
	}

	public writeZeroBytes(n: number) {
		for (let i = 0; i < n; i++) {
			this.writeByte(0);
		}
	}

	public writeByte(n: number) {
		this.buffer.writeInt8(n, this.offset);
		this.offset += 1;
	}

	public writeBytes(n: Uint8Array) {
		for (let i = 0; i < n.length; i++) {
			this.writeByte(n[i]);
		}
	}

	public writeShort(n: number) {
		this.buffer.writeInt16LE(n, this.offset);
		this.offset += 2;
	}

	public writeInt(n: number) {
		this.buffer.writeInt32LE(n, this.offset);
		this.offset += 4;
	}

	public writeLong(n: number | bigint) {
		this.buffer.writeBigInt64LE(typeof n === "bigint" ? n : BigInt(n), this.offset);
		this.offset += 8;
	}

	public writeAsciiString(s: string, max?: number) {
		const ascii = Buffer.from(s, "ascii");
		if (max) {
			if (ascii.length > max) {
				s = s.substring(0, max);
			}
			this.writeBytes(ascii);
			this.writeZeroBytes(max - ascii.length);
		} else {
			this.writeBytes(ascii);
		}
	}

	public writeMapleAsciiString(s: string) {
		const ascii = Buffer.from(s, "ascii");
		// 1. 문자열의 길이를 버퍼에 작성합니다
		this.writeShort(ascii.length);
		// 2. 문자열을 작성합니다
		this.writeAsciiString(s);
	}

	public writeOpcode(code: number) {
		this.writeShort(code);
	}

	public writePos(p: Point) {
		this.writeShort(p.x);
		this.writeShort(p.y);
	}
}

export default LittleEndianPacketWriter;
