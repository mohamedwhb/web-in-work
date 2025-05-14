import type { PermissionKeyType } from "./permissions";

export type Employee = {
	id: number;
	name: string;
	userId: string;
	address: string;
	phone: string;
	email: string;
	position: string;
	department: string;
	status: "active" | "inactive" | "on_leave";
	joinDate: string;
	permissions: PermissionKeyType[];
	avatar?: string;
	notes?: string;
};

// Beispieldaten für Mitarbeiter mit Berechtigungen
export const employeesData: Employee[] = [
	{
		id: 1,
		name: "Mohamed Wahba",
		userId: "mwahba12",
		address: "Puchsbaumgasse 1, 1100 Wien",
		phone: "0123456789",
		email: "mohamedwahba25@gmail.com",
		position: "Geschäftsführer",
		department: "Management",
		status: "active",
		joinDate: "2020-01-15",
		permissions: [
			"VIEW_DASHBOARD",
			"VIEW_OFFERS",
			"CREATE_OFFERS",
			"EDIT_OFFERS",
			"DELETE_OFFERS",
			"VIEW_INVOICES",
			"CREATE_INVOICES",
			"EDIT_INVOICES",
			"DELETE_INVOICES",
			"VIEW_CUSTOMERS",
			"CREATE_CUSTOMERS",
			"EDIT_CUSTOMERS",
			"DELETE_CUSTOMERS",
			"VIEW_PRODUCTS",
			"CREATE_PRODUCTS",
			"EDIT_PRODUCTS",
			"DELETE_PRODUCTS",
			"VIEW_EMPLOYEES",
			"CREATE_EMPLOYEES",
			"EDIT_EMPLOYEES",
			"DELETE_EMPLOYEES",
			"MANAGE_PERMISSIONS",
			"VIEW_FINANCES",
			"MANAGE_FINANCES",
			"VIEW_SETTINGS",
			"EDIT_SETTINGS",
			"VIEW_REPORTS",
			"CREATE_REPORTS",
			"VIEW_INVENTORY",
			"MANAGE_INVENTORY",
		],
		avatar: "https://avatars.githubusercontent.com/u/4289837?v=4",
		notes: "Engagierter Geschäftsführer mit Fokus auf Innovation.",
	},
];
