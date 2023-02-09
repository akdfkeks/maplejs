import moment from "moment";
import Client from "../client/client";
import PacketReader from "../packet/tools/PacketReader";

const PongHandler = async (client: Client, reader: PacketReader) => {
	client.lastPong = moment();
};

export default PongHandler;
