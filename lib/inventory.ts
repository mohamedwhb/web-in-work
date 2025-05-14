import { toast } from "@/components/ui/use-toast";
import type { Product } from "@prisma/client";

// Define inventory update type
export type InventoryUpdate = {
	productId: number;
	quantity: number;
};

// Get product by barcode
export function getProductByBarcode(
	barcode: string,
	products: Product[],
): Product | undefined {
	return products.find((product) => product.barcode === barcode);
}

// Update inventory
export async function updateInventory(
	updates: InventoryUpdate[],
): Promise<boolean> {
	try {
		// In a real application, this would be an API call to update the database
		console.log("Updating inventory:", updates);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// In a real application, we would check for errors and return accordingly
		return true;
	} catch (error) {
		console.error("Error updating inventory:", error);
		toast({
			title: "Fehler bei der Lageraktualisierung",
			description: "Die Lagerbestände konnten nicht aktualisiert werden.",
			variant: "destructive",
		});
		return false;
	}
}

// Get inventory status
export function getInventoryStatus(
	product: Product,
): "in-stock" | "low-stock" | "out-of-stock" {
	if (product.stock <= 0) {
		return "out-of-stock";
	}
	if (product.stock <= 5) {
		return "low-stock";
	}
	return "in-stock";
}

// Check if product is available in requested quantity
export function isProductAvailable(
	product: Product,
	requestedQuantity: number,
): boolean {
	return product.stock >= requestedQuantity;
}
