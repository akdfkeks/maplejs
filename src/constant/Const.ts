import Item from "../client/inventory/Item";
import { GenerateTypeFromConst } from "../lib/TypeGenerator";

export const ItemType = {
	EQUIPPED: -1, // 착용중인 장비
	UNDEFINED: 0, //
	EQUIP: 1, // 장비
	USE: 2, // 소비
	SETUP: 3, // 설치
	ETC: 4, // 기타
	CASH: 5, // 캐시
} as const;

export const InventoryType = ItemType;

export const ItemLocation = {
	INVENTORY: 0, // 인벤토리
	STORAGE: 1, // 창고
	CASHSHOP: 2, // 캐시샵
	HERED_MERCHANT: 5, // ??
	DUEY: 6, // 택배
	MTS: 8, // Maple Trading System? 고용상인? 경매장? 캐시교환?
	MTS_TRANSFER: 9, //
} as const;

export type ItemType = GenerateTypeFromConst<typeof ItemType>;

export type InventoryType = ItemType;

export function toInvType(n: number) {
	if (n < -2 || n > 5) return InventoryType.UNDEFINED;
	return n as InventoryType;
}

export type ItemLocation = GenerateTypeFromConst<typeof ItemLocation>;
