import moment from "moment";
import MapleClient from "../client/Client";
import PacketReader from "../packet/tools/PacketReader";

const PongHandler = async (client: MapleClient, reader: PacketReader) => {
	client.setLastPong(moment());
};

export default PongHandler;
