"use strict";

import prisma from "./database/prisma";
import ServerFactory from "./server/ServerFactory";

const main = async () => {
	await prisma
		.$connect()
		.then(() => {
			console.log("[Database] Connection has been established...");
		})
		.catch(() => {
			console.log("[Database] Fail to create database connection...");
		});

	ServerFactory().listen(8484, () => {
		console.log("[Login] Server on port 8484");
	});
};

main();
