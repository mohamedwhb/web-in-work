import type { Category } from "@prisma/client";
import { secureFetch } from "./secure-fetch";

// Mock categories data with hierarchical structure
// const categories: Category[] = [
// 	{
// 		id: "cat-1",
// 		name: "Obst",
// 		color: "#FF9800",
// 		parentId: null,
// 		description: "Frisches Obst",
// 		order: 0,
// 	},
// 	{
// 		id: "cat-2",
// 		name: "Gemüse",
// 		color: "#4CAF50",
// 		parentId: null,
// 		description: "Frisches Gemüse",
// 		order: 1,
// 	},
// 	{
// 		id: "cat-3",
// 		name: "Kräuter",
// 		color: "#8BC34A",
// 		parentId: "cat-2",
// 		description: "Frische Kräuter",
// 		order: 0,
// 	},
// 	{
// 		id: "cat-4",
// 		name: "Zitrusfrüchte",
// 		color: "#FFEB3B",
// 		parentId: "cat-1",
// 		description: "Zitrusfrüchte",
// 		order: 0,
// 	},
// 	{
// 		id: "cat-5",
// 		name: "Kernobst",
// 		color: "#FF5722",
// 		parentId: "cat-1",
// 		description: "Äpfel, Birnen, etc.",
// 		order: 1,
// 	},
// 	{
// 		id: "cat-6",
// 		name: "Wurzelgemüse",
// 		color: "#795548",
// 		parentId: "cat-2",
// 		description: "Karotten, Zwiebeln, etc.",
// 		order: 1,
// 	},
// 	{
// 		id: "cat-7",
// 		name: "Bio-Äpfel",
// 		color: "#8D6E63",
// 		parentId: "cat-5",
// 		description: "Biologisch angebaute Äpfel",
// 		order: 0,
// 	},
// ];

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
	try {
		const res = await fetch("/api/categories");
		const data = await res.json();
		return data.categories;
	} catch (error) {
		console.error(error);
		return [];
	}
}

// Get category by ID
export async function getCategoryById(
	id: string,
): Promise<Category | undefined> {
	try {
		const res = await fetch(`/api/categories/${id}`);
		const data = await res.json();
		return data.category;
	} catch (error) {
		console.error(error);
		return undefined;
	}
}

// Create a new category
export async function createCategory(
	category: Omit<Category, "id">,
): Promise<Category> {
	try {
		const res = await secureFetch("/api/categories", {
			method: "POST",
			body: JSON.stringify(category),
		});
		const data = await res.json();
		return data.category;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Update a category
export async function updateCategory(
	id: string,
	category: Partial<Category>,
): Promise<Category | undefined> {
	try {
		const res = await secureFetch(`/api/categories/${id}`, {
			method: "PATCH",
			body: JSON.stringify(category),
		});
		const data = await res.json();
		return data.category;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Delete a category
export async function deleteCategory(id: string): Promise<boolean> {
	try {
		const res = await secureFetch(`/api/categories/${id}`, {
			method: "DELETE",
		});
		const data = await res.json();
		return data.success;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Get direct children of a category
export async function getCategoryChildren(
	parentId: string | null,
): Promise<Category[]> {
	try {
		const res = await fetch(`/api/categories?parentId=${parentId}&order=asc`);
		const data = await res.json();
		return data.categories;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Get all descendants of a category (children, grandchildren, etc.)
export async function getCategoryDescendants(
	categoryId: string,
): Promise<Category[]> {
	try {
		const res = await fetch(
			`/api/categories/${categoryId}?includeDescendants=true`,
		);
		const data = await res.json();
		return data.category.descendants;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Get the path from root to a category
export async function getCategoryPath(
	categoryId: string,
	allCategories: Category[] = [],
): Promise<Category[]> {
	try {
		const path: Category[] = [];
		const cats =
			allCategories.length > 0 ? allCategories : await getAllCategories();

		const findPath = (id: string): boolean => {
			const category = cats.find((c) => c.id === id);
			if (!category) return false;

			if (category.parentId) {
				const parentFound = findPath(category.parentId);
				if (!parentFound) return false;
			}

			path.push(category);
			return true;
		};

		findPath(categoryId);
		return path;
	} catch (error) {
		console.error(error);
		return [];
	}
}

// Check if a category is a descendant of another category
export async function isCategoryDescendantOf(
	categoryId: string,
	ancestorId: string,
): Promise<boolean> {
	try {
		const allCategories = await getAllCategories();
		let current = allCategories.find((c) => c.id === categoryId);

		while (current?.parentId) {
			if (current.parentId === ancestorId) {
				return true;
			}
			current = allCategories.find((c) => c.id === current?.parentId);
		}

		return false;
	} catch (error) {
		console.error(error);
		return false;
	}
}

// Move a category to a new parent
export async function moveCategory(
	categoryId: string,
	newParentId: string | null,
	newOrder?: number,
): Promise<Category | undefined> {
	try {
		const category = await getCategoryById(categoryId);
		if (!category) {
			return undefined;
		}

		// Wenn keine neue Reihenfolge angegeben wurde, füge am Ende hinzu
		const order =
			newOrder !== undefined
				? newOrder
				: await getNextOrderForParent(newParentId);

		// Aktualisiere die Kategorie
		const updatedCategory = await updateCategory(categoryId, {
			...category,
			parentId: newParentId,
			order,
		});

		// Aktualisiere die Reihenfolge der anderen Kategorien mit demselben Elternteil
		if (newOrder !== undefined) {
			const siblings = await getCategoryChildren(newParentId);
			for (const sibling of siblings) {
				if (sibling.id !== categoryId && (sibling.order || 0) >= newOrder) {
					await updateCategory(sibling.id, {
						...sibling,
						order: (sibling.order || 0) + 1,
					});
				}
			}
		}

		return updatedCategory;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Hilfsfunktion, um die nächste Reihenfolge für eine neue Kategorie zu ermitteln
async function getNextOrderForParent(parentId: string | null): Promise<number> {
	const siblings = await getCategoryChildren(parentId);
	return siblings.length > 0
		? Math.max(...siblings.map((c) => c.order || 0)) + 1
		: 0;
}

// Neu anordnen von Kategorien innerhalb desselben Elternteils
export async function reorderCategories(
	parentId: string | null,
	orderedIds: string[],
): Promise<Category[]> {
	try {
		const updatedCategories: Category[] = [];

		// Aktualisiere die Reihenfolge der Kategorien
		for (const [index, id] of orderedIds.entries()) {
			const category = await getCategoryById(id);
			if (category && category.parentId === parentId) {
				const updatedCategory = await updateCategory(id, {
					name: category.name,
					color: category.color,
					description: category.description,
					order: index,
					parentId: category.parentId,
				});
				if (updatedCategory) {
					updatedCategories.push(updatedCategory);
				}
			}
		}

		// Gib die aktualisierten Kategorien zurück
		return updatedCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
	} catch (error) {
		console.error(error);
		throw error;
	}
}
