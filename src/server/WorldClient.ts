import net from "net";
import config from "@/config.json";

export const getChannelServer = async (channelId: number) => {
	return await executeFunctionRemote(`getChannelAddress(${channelId});`);
};

export const isChannelServerActive = async (channelId: number) => {
	return await executeFunctionRemote(`isChannelServerActive(${channelId});`);
};

const executeFunctionRemote = async (functionHead: string) => {
	const worldClient = createWorldClient();
	worldClient.write(functionHead);
	const result = await new Promise((resolve) => {
		worldClient.on("data", (data) => {
			resolve(data);
		});
	});
	worldClient.destroy();
	try {
		return JSON.parse(result.toString());
	} catch (error) {
		return result.toString();
	}
};

const createWorldClient = () => {
	const worldClient = new net.Socket();

	worldClient.connect(config.server.world.port, config.server.world.host);

	worldClient.on("error", (error) => {
		console.log(error);
		process.exit(1);
	});

	return worldClient;
};
