"use strict";

import prisma from "./database/prisma";
import CashshopServer from "./handler/cashshop/CashshopServer";
import ChannelServer from "./handler/channel/ChannelServer";
import EtcServer from "./handler/etc/EtcServer";
import LoginServer from "./handler/login/LoginServer";
import ServerFactory from "./server/ServerFactory";

const main = async () => {
	await prisma
		.$connect()
		.then(() => {
			console.log("[DB] Connection has been established...");
		})
		.catch(() => {
			console.log("[DB] Fail to create database connection...");
		});

	LoginServer();

	// 채널 수 만큼 8585 부터 open
	for (const port of [8585]) {
		ChannelServer(port);
	}

	CashshopServer();
	EtcServer();
};

main();
