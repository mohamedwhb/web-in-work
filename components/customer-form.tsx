"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

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
import { customerSchema } from "@/schemas/customer-schema";
import type { Customer } from "@prisma/client";
import { AuthGuard } from "./auth-guard";

type CustomerFormProps = {
	customer?: Customer;
	onCancel: () => void;
	onSave: () => void;
};

export default function CustomerForm({
	customer,
	onCancel,
	onSave,
}: CustomerFormProps) {
	const isEdit = !!customer;
	const [isSaving, startTransition] = useTransition();
	const { toast } = useToast();
	// Initialize form with default values or customer data
	const form = useForm<z.infer<typeof customerSchema>>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			name: customer?.name || "",
			email: customer?.email || "",
			phone: customer?.phone || "",
			vatId: customer?.vatId || "",
			taxId: customer?.taxId || "",
			country: customer?.country || "at",
			zip: customer?.zip || "",
			city: customer?.city || "",
			street: customer?.street || "",
		},
	});

	// Handle form submission
	const onSubmit = (data: z.infer<typeof customerSchema>) => {
		startTransition(async () => {
			try {
				let method: "POST" | "PATCH";
				if (isEdit) {
					method = "PATCH";
				} else {
					method = "POST";
				}
				const res = await secureFetch(
					`/api/customers/${isEdit ? customer?.id : ""}`,
					{
						method,
						body: JSON.stringify(data),
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
			}
		});
	};

	return (
		<AuthGuard
			requiredPermissions={isEdit ? ["EDIT_CUSTOMERS"] : ["CREATE_CUSTOMERS"]}
		>
			<Card>
				<CardHeader>
					<CardTitle>
						{isEdit ? "Kunde bearbeiten" : "Kunde hinzufügen"}
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
									name="vatId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>UID-NR</FormLabel>
											<FormControl>
												<Input placeholder="z.B. ATU12345678" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="taxId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Steuer NR.</FormLabel>
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
									name="street"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Straat</FormLabel>
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
		</AuthGuard>
	);
}
