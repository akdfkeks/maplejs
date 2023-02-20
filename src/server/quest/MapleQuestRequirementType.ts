import { GenerateTypeFromConst } from "@/src/lib/TypeGenerator";

export enum MapleQuestRequirementType {
	UNDEFINED = -1,
	job = 0,
	item = 1,
	quest = 2,
	lvmin = 3,
	lvmax = 4,
	end = 5,
	mob = 6,
	npc = 7,
	fieldEnter = 8,
	interval = 9,
	startscript = 10,
	endscript = 10,
	pet = 11,
	pettamenessmin = 12,
	mbmin = 13,
	questComplete = 14,
	pop = 15,
	skill = 16,
	mbcard = 17,
	subJobFlags = 18,
	dayByDay = 19,
	normalAutoStart = 20,
	partyQuest_S = 21,
	charmMin = 22,
	senseMin = 23,
	craftMin = 24,
	willMin = 25,
	charismaMin = 26,
	insightMin = 27,
}

export namespace MapleQuestRequirementType {
	export function getByType(type: number) {
		for (const i of Object.values(MapleQuestRequirementType)) {
			if (i == type) return i;
		}
		return null;
	}

	export function getByWZName(name: string) {
		return MapleQuestRequirementType[name] || -1;
	}
}
