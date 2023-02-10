"use strict";

import prisma from "./database/prisma";
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

	ServerFactory().listen(8484, () => {
		console.log("[Login] on port 8484");
	});

	ServerFactory().listen(9393, () => {
		console.log("[World] on port 9393");
	});

	// 채널 수 만큼 8585 부터 open
	for (const port of [8585]) {
		ServerFactory().listen(port, () => {
			console.log("[Channel] on port " + port);
		});
	}

	ServerFactory().listen(8888, () => {
		console.log("[CashShop] on port 8888");
	});

	ServerFactory().listen(9699, () => {
		console.log("[Etc] on port 9699");
	});
};

main();
