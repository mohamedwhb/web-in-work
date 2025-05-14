"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreVertical, Edit, Trash, MoveVertical, Search, X } from "lucide-react"
import { CategoryBadge } from "@/components/category-badge"
import type { Category } from "@/types/category"
import { CategoryTree } from "@/components/category-tree"
import { DraggableCategoryTree } from "@/components/draggable-category-tree"
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryChildren,
  isCategoryDescendantOf,
  moveCategory,
  reorderCategories,
} from "@/lib/category-service"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    color: "#4CAF50",
    parentId: "",
    description: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories()
        setCategories(data)
        setFilteredCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Filter categories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories)
      return
    }

    const query = searchQuery.toLowerCase()

    // Find categories that match the search query
    const matchingCategories = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        (category.description && category.description.toLowerCase().includes(query)),
    )

    // If no direct matches, show all categories
    if (matchingCategories.length === 0) {
      setFilteredCategories([])
      return
    }

    // Find all parent categories of matching categories
    const relevantCategoryIds = new Set<string>()

    // Add all matching categories
    matchingCategories.forEach((category) => {
      relevantCategoryIds.add(category.id)
    })

    // Add all parent categories
    const addParents = (categoryId: string | null) => {
      if (!categoryId) return

      const category = categories.find((c) => c.id === categoryId)
      if (category) {
        relevantCategoryIds.add(category.id)
        if (category.parentId) {
          addParents(category.parentId)
        }
      }
    }

    // For each matching category, add its parent chain
    matchingCategories.forEach((category) => {
      if (category.parentId) {
        addParents(category.parentId)
      }
    })

    // Filter categories to only include relevant ones
    const result = categories.filter((category) => relevantCategoryIds.has(category.id))
    setFilteredCategories(result)
  }, [searchQuery, categories])

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      color: "#4CAF50",
      parentId: "",
      description: "",
    })
    setErrors({})
  }

  // Open dialog for creating a new category
  const openCreateDialog = () => {
    setCurrentCategory(null)
    resetForm()
    setIsDialogOpen(true)
  }

  // Open dialog for editing a category
  const openEditDialog = (category: Category) => {
    setCurrentCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      parentId: category.parentId || "",
      description: category.description || "",
    })
    setIsDialogOpen(true)
  }

  // Open dialog for deleting a category
  const openDeleteDialog = (category: Category) => {
    setCurrentCategory(category)
    setIsDeleteDialogOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle parent category selection
  const handleParentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, parentId: value === "none" ? "" : value }))
  }

  // Validate form
  const validateForm = async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name ist erforderlich"
    }

    if (formData.parentId && currentCategory) {
      // Check if the selected parent is a descendant of the current category
      // This would create a circular reference
      const isDescendant = await isCategoryDescendantOf(formData.parentId, currentCategory.id)
      if (isDescendant) {
        newErrors.parentId =
          "Eine Kategorie kann nicht als Unterkategorie ihrer eigenen Unterkategorie festgelegt werden"
      }

      // Check if the selected parent is the current category itself
      if (formData.parentId === currentCategory.id) {
        newErrors.parentId = "Eine Kategorie kann nicht ihre eigene Unterkategorie sein"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) return

    try {
      if (currentCategory) {
        // Update existing category
        await updateCategory(currentCategory.id, {
          name: formData.name,
          color: formData.color,
          parentId: formData.parentId || null,
          description: formData.description,
        })
      } else {
        // Create new category
        await createCategory({
          name: formData.name,
          color: formData.color,
          parentId: formData.parentId || null,
          description: formData.description,
        })
      }

      // Refresh categories
      const updatedCategories = await getAllCategories()
      setCategories(updatedCategories)
      setFilteredCategories(updatedCategories)
      setIsDialogOpen(false)

      toast({
        title: currentCategory ? "Kategorie aktualisiert" : "Kategorie erstellt",
        description: `Die Kategorie "${formData.name}" wurde erfolgreich ${currentCategory ? "aktualisiert" : "erstellt"}.`,
      })
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Fehler",
        description: "Beim Speichern der Kategorie ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    }
  }

  // Handle category deletion
  const handleDelete = async () => {
    if (!currentCategory) return

    try {
      // Check if category has children
      const children = await getCategoryChildren(currentCategory.id)
      if (children.length > 0) {
        toast({
          title: "Löschen nicht möglich",
          description: "Diese Kategorie hat Unterkategorien und kann nicht gelöscht werden.",
          variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
        return
      }

      await deleteCategory(currentCategory.id)
      const updatedCategories = await getAllCategories()
      setCategories(updatedCategories)
      setFilteredCategories(updatedCategories)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Kategorie gelöscht",
        description: `Die Kategorie "${currentCategory.name}" wurde erfolgreich gelöscht.`,
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Fehler",
        description: "Beim Löschen der Kategorie ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    }
  }

  // Handle category move
  const handleCategoryMove = async (categoryId: string, newParentId: string | null) => {
    try {
      // Prüfen, ob die Verschiebung einen Zyklus erzeugen würde
      if (newParentId) {
        const isDescendant = await isCategoryDescendantOf(newParentId, categoryId)
        if (isDescendant) {
          toast({
            title: "Verschieben nicht möglich",
            description: "Eine Kategorie kann nicht als Unterkategorie ihrer eigenen Unterkategorie festgelegt werden.",
            variant: "destructive",
          })
          return
        }
      }

      await moveCategory(categoryId, newParentId)
      const updatedCategories = await getAllCategories()
      setCategories(updatedCategories)
      setFilteredCategories(updatedCategories)

      toast({
        title: "Kategorie verschoben",
        description: "Die Kategorie wurde erfolgreich verschoben.",
      })
    } catch (error) {
      console.error("Error moving category:", error)
      toast({
        title: "Fehler",
        description: "Beim Verschieben der Kategorie ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    }
  }

  // Handle categories reorder
  const handleCategoriesReorder = async (parentId: string | null, orderedIds: string[]) => {
    try {
      await reorderCategories(parentId, orderedIds)
      const updatedCategories = await getAllCategories()
      setCategories(updatedCategories)
      setFilteredCategories(updatedCategories)
    } catch (error) {
      console.error("Error reordering categories:", error)
      toast({
        title: "Fehler",
        description: "Beim Neuordnen der Kategorien ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Get root categories
  const rootCategories = filteredCategories
    .filter((category) => !category.parentId)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  // Check if we have search results
  const hasSearchResults = searchQuery.trim() !== "" && filteredCategories.length > 0
  const noSearchResults = searchQuery.trim() !== "" && filteredCategories.length === 0

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kategorien</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="drag-mode" checked={isDragModeEnabled} onCheckedChange={setIsDragModeEnabled} />
              <Label htmlFor="drag-mode" className="flex items-center gap-1">
                <MoveVertical className="h-4 w-4" />
                Drag & Drop Modus
              </Label>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Neue Kategorie
            </Button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Kategorien durchsuchen..."
            className="pl-8 pr-10"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Suche löschen</span>
            </button>
          )}
        </div>

        {/* Search results info */}
        {hasSearchResults && (
          <div className="text-sm text-muted-foreground">
            {filteredCategories.length} {filteredCategories.length === 1 ? "Kategorie" : "Kategorien"} gefunden für "
            {searchQuery}"
          </div>
        )}
        {noSearchResults && (
          <div className="text-sm text-muted-foreground">Keine Kategorien gefunden für "{searchQuery}"</div>
        )}
      </div>

      {isDragModeEnabled ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="mb-4 text-sm text-muted-foreground">
            Im Drag & Drop Modus können Sie Kategorien per Drag & Drop neu anordnen und in andere Kategorien
            verschieben. Ziehen Sie eine Kategorie auf eine andere, um sie als Unterkategorie zu verschieben.
          </div>
          <DraggableCategoryTree
            categories={filteredCategories}
            onCategoryMove={handleCategoryMove}
            onCategoriesReorder={handleCategoriesReorder}
            onSelectCategory={openEditDialog}
            selectedCategoryId={currentCategory?.id}
          />
        </div>
      ) : (
        <>
          {noSearchResults ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <p className="text-muted-foreground">Keine Kategorien gefunden.</p>
              <Button variant="outline" onClick={clearSearch} className="mt-4">
                Suche zurücksetzen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rootCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-md font-medium">
                      <div className="flex items-center gap-2">
                        <CategoryBadge color={category.color} />
                        <span
                          className={
                            searchQuery && category.name.toLowerCase().includes(searchQuery.toLowerCase())
                              ? "bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded"
                              : ""
                          }
                        >
                          {category.name}
                        </span>
                      </div>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menü öffnen</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(category)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {searchQuery && category.description.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                          <span className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">
                            {category.description}
                          </span>
                        ) : (
                          category.description
                        )}
                      </p>
                    )}
                    <CategoryTree
                      categories={filteredCategories}
                      onSelectCategory={(cat) => openEditDialog(cat)}
                      parentId={category.id}
                      selectedCategoryId={currentCategory?.id}
                      highlightText={searchQuery}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentCategory ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}</DialogTitle>
            <DialogDescription>
              {currentCategory
                ? "Aktualisieren Sie die Details der Kategorie."
                : "Fügen Sie eine neue Kategorie hinzu, um Ihre Produkte zu organisieren."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Farbe</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input name="color" value={formData.color} onChange={handleInputChange} className="flex-1" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parentId">Übergeordnete Kategorie (optional)</Label>
                <Select value={formData.parentId} onValueChange={handleParentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Keine übergeordnete Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine übergeordnete Kategorie</SelectItem>
                    {categories
                      .filter((cat) => cat.id !== currentCategory?.id)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.parentId && <p className="text-red-500 text-sm">{errors.parentId}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Beschreibung (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit">{currentCategory ? "Aktualisieren" : "Erstellen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategorie löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie die Kategorie "{currentCategory?.name}" löschen möchten? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
