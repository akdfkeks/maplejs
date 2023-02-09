import { Account as PAccount } from "@prisma/client";
import Client from "../../client/client";

export class Account implements PAccount {
	gm: number;
	gender: number;
	id: number;
	email: string;
	name: string;
	password: string;
	second_password: string;
	logged_in: boolean;
	last_login: Date;
	last_ip: string;
	created_at: Date;
	birthday: Date;
	mac_address: string;
	cash: number;
	point: number;
}
