import path from "path";

class ServerProperties {
	private static props = new Map<string, any>();
	static {
		this.props.set("world.host", "127.0.0.1");
		this.props.set("world.exp", 1);
		this.props.set("world.meso", 1);
		this.props.set("world.serverMessage", "");
		this.props.set("world.flags", 0);
		this.props.set("world.adminOnly", false);

		this.props.set("login.serverName", "스카니아");
		this.props.set("login.userlimit", 100);
		this.props.set("login.eventMessage", "");
		this.props.set("login.flag", 0);
		this.props.set("login.maxCharacters", "3");

		this.props.set("channel.net.interface", "127.0.0.1");
		this.props.set("channel.net.port", 8585);
		this.props.set("channel.count", 1);
		this.props.set(
			"channel.events",
			"HenesysPQ," +
				"HenesysPQBonus," +
				"OrbisPQ," +
				"Boats," +
				"Flight," +
				"Geenie," +
				"Trains," +
				"elevator," +
				"3rdjob," +
				"s4aWorld," +
				"s4nest," +
				"s4resurrection," +
				"s4resurrection2," +
				"ProtectTylus," +
				"ZakumPQ," +
				"ZakumBattle," +
				"FireDemon," +
				"LudiPQ," +
				"ElementThanatos," +
				"Papulatus," +
				"cpq," +
				"TamePig," +
				"s4common2," +
				"HorntailPQ," +
				"HorntailBattle," +
				"Pirate," +
				"Adin," +
				"KerningPQ," +
				"GuildQuest," +
				"ShanghaiBoss," +
				"NightMarketBoss," +
				"4jberserk," +
				"4jrush," +
				"DollHouse," +
				"Ellin," +
				"Juliet," +
				"Romeo," +
				"KyrinTest," +
				"KyrinTrainingGroundC," +
				"KyrinTrainingGroundV," +
				"KyrinTest," +
				"ProtectDelli," +
				"AirStrike," +
				"AirStrike2," +
				"JenumistHomu," +
				"YureteLab1," +
				"YureteLab2," +
				"YureteLab3," +
				"PinkBeanBattle," +
				"NautilusCow," +
				"SnowRose," +
				"DarkMagicianAgit," +
				"Gojarani," +
				"MachineRoom"
		);

		process.env.wzpath = path.resolve("../../wz");
	}

	public static get(s: string) {
		return this.props.get(s);
	}
}

export default ServerProperties;
