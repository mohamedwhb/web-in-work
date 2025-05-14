import { formatCurrency } from "@/lib/pdf-export-utils";
import type { Prisma } from "@prisma/client";
import { forwardRef } from "react";

type PrintableOffer = Prisma.OfferGetPayload<{
	include: {
		customer: true;
	};
}>;

export const PrintableOffers = forwardRef<
	HTMLDivElement,
	{ offers: PrintableOffer[] }
>(({ offers }, ref) => (
	<div ref={ref} style={{ padding: "1rem", fontFamily: "sans-serif" }}>
		{offers.map((o) => (
			<div
				key={o.id}
				style={{
					marginBottom: "2rem",
					pageBreakInside: "avoid",
					borderBottom: "1px solid #ccc",
					paddingBottom: "1rem",
				}}
			>
				<h2 style={{ margin: 0 }}>Angebot {o.id}</h2>
				<p>
					<strong>Kunde:</strong> {o.customer.name}
				</p>
				<p>
					<strong>Betrag:</strong> {formatCurrency(o.total)}
				</p>
				<p>
					<strong>Status:</strong> {o.status}
				</p>
			</div>
		))}
	</div>
));
