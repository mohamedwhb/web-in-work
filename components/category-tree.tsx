"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/category"

interface CategoryTreeProps {
  categories: Category[]
  onSelectCategory: (category: Category) => void
  selectedCategoryId?: string | null
  parentId?: string | null
  level?: number
  highlightText?: string
}

export function CategoryTree({
  categories,
  onSelectCategory,
  selectedCategoryId,
  parentId = null,
  level = 0,
  highlightText = "",
}: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // Filter categories by parent ID
  const filteredCategories = categories.filter((category) => category.parentId === parentId)

  // Toggle category expansion
  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  // Check if a category has children
  const hasChildren = (categoryId: string) => {
    return categories.some((category) => category.parentId === categoryId)
  }

  // Highlight matching text
  const highlightMatch = (text: string) => {
    if (!highlightText || !text) return text

    const lowerText = text.toLowerCase()
    const lowerHighlight = highlightText.toLowerCase()

    if (!lowerText.includes(lowerHighlight)) return text

    const index = lowerText.indexOf(lowerHighlight)
    const before = text.substring(0, index)
    const match = text.substring(index, index + highlightText.length)
    const after = text.substring(index + highlightText.length)

    return (
      <>
        {before}
        <span className="bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">{match}</span>
        {after}
      </>
    )
  }

  // Auto-expand categories if there's a search query
  useEffect(() => {
    if (highlightText) {
      // Expand all categories when searching
      const newExpandedState: Record<string, boolean> = {}
      categories.forEach((category) => {
        newExpandedState[category.id] = true
      })
      setExpandedCategories(newExpandedState)
    }
  }, [highlightText, categories])

  if (filteredCategories.length === 0) {
    return null
  }

  return (
    <div className={cn("pl-4", level === 0 ? "pl-0" : "")}>
      {filteredCategories.map((category) => {
        const isExpanded = expandedCategories[category.id] ?? false
        const hasChildCategories = hasChildren(category.id)
        const isSelected = selectedCategoryId === category.id
        const matchesSearch =
          highlightText &&
          (category.name.toLowerCase().includes(highlightText.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(highlightText.toLowerCase())))

        return (
          <div key={category.id} className="mb-1">
            <div
              className={cn(
                "flex items-center py-1 px-2 rounded-md",
                isSelected ? "bg-primary/10" : "hover:bg-muted",
                matchesSearch ? "ring-1 ring-yellow-400 dark:ring-yellow-600" : "",
              )}
            >
              {hasChildCategories ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(category.id)}
                  className="mr-1 p-1 rounded-md hover:bg-muted-foreground/10"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}

              <button
                type="button"
                className="flex items-center gap-2 flex-1 text-left"
                onClick={() => onSelectCategory(category)}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                <span>{highlightMatch(category.name)}</span>
              </button>
            </div>

            {hasChildCategories && isExpanded && (
              <CategoryTree
                categories={categories}
                onSelectCategory={onSelectCategory}
                selectedCategoryId={selectedCategoryId}
                parentId={category.id}
                level={level + 1}
                highlightText={highlightText}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
