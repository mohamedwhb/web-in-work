"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

import type { Employee } from "@/app/(root)/mitarbeiter/page";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { secureFetch } from "@/lib/secure-fetch";

// Define schema for employee data
const employeeSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name muss mindestens 2 Zeichen lang sein" }),
	username: z
		.string()
		.min(2, { message: "User-ID muss mindestens 2 Zeichen lang sein" }),
	email: z
		.string()
		.email({ message: "Ungültige E-Mail-Adresse" })
		.optional()
		.or(z.literal("")),
	phone: z.string().optional(),
	zip: z.string().optional(),
	city: z.string().optional(),
	country: z.string(),
	street: z.string().optional(),
});

type EmployeeFormProps = {
	employee?: Employee;
	onCancel: () => void;
	onSave: () => void;
};

type FormData = z.infer<typeof employeeSchema>;

export default function EmployeeForm({
	employee,
	onCancel,
	onSave,
}: EmployeeFormProps) {
	const isEdit = !!employee;
	const [isSaving, setIsSaving] = useState(false);
	const { toast } = useToast();

	const form = useForm<FormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			name: employee?.user.name || "",
			username: employee?.user.username || "",
			email: employee?.user.email || "",
			phone: employee?.phone || "",
			country: employee?.country || "at",
			zip: employee?.zip || "",
			city: employee?.city || "",
			street: employee?.street || "",
		},
	});

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		try {
			let method: "POST" | "PATCH";
			if (isEdit) {
				method = "PATCH";
			} else {
				method = "POST";
			}
			const dataToSend = {
				userId: employee?.user.id || "",
				user: {
					id: employee?.user.id || "",
					name: data.name || "",
					username: data.username || "",
					email: data.email || "",
				},
				phone: data.phone || "",
				zip: data.zip || "",
				city: data.city || "",
				country: data.country,
				street: data.street || "",
			};
			const res = await secureFetch(
				`/api/employee/${employee?.id ? employee?.id : ""}`,
				{
					method,
					body: JSON.stringify(dataToSend),
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error);
			}

			onSave();
			toast({
				title: "Kunde gespeichert",
				description: "Der Kunde wurde erfolgreich gespeichert",
			});
		} catch (error) {
			console.error("Error saving customer:", error);
			toast({
				title: "Fehler beim Speichern des Kunden",
				description: "Bitte versuche es erneut",
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{isEdit ? "Mitarbeiter:in bearbeiten" : "Mitarbeiter:in hinzufügen"}
				</CardTitle>
			</CardHeader>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>User-ID</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Telefon</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="zip"
								render={({ field }) => (
									<FormItem>
										<FormLabel>PLZ</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="city"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ort</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Land</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Land auswählen" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="at">Österreich</SelectItem>
												<SelectItem value="de">Deutschland</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="street"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Adresse</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline" onClick={onCancel} type="button">
							Schließen
						</Button>
						<Button type="submit" disabled={isSaving}>
							{isSaving ? "Wird gespeichert..." : "Speichern"}
						</Button>
					</CardFooter>
				</form>
			</Form>
		</Card>
	);
}
