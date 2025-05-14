"use client"

import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { getCategoryPath } from "@/lib/category-service"
import type { Category } from "@/types/category"

interface CategoryBreadcrumbProps {
  categoryId: string
  categories: Category[]
  onCategoryClick?: (category: Category) => void
  compact?: boolean
}

export function CategoryBreadcrumb({
  categoryId,
  categories,
  onCategoryClick,
  compact = false,
}: CategoryBreadcrumbProps) {
  const [categoryPath, setCategoryPath] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategoryPath = async () => {
      try {
        const path = await getCategoryPath(categoryId, categories)
        setCategoryPath(path)
      } catch (error) {
        console.error("Error fetching category path:", error)
      }
    }

    fetchCategoryPath()
  }, [categoryId, categories])

  if (categoryPath.length === 0) {
    const category = categories.find((cat) => cat.id === categoryId)
    if (!category) return <span>Unbekannt</span>

    return (
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
        <span>{category.name}</span>
      </div>
    )
  }

  if (compact && categoryPath.length > 0) {
    const lastCategory = categoryPath[categoryPath.length - 1]
    return (
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: lastCategory.color }}></div>
        <span className="text-muted-foreground text-xs">
          {categoryPath.length > 1 && `${categoryPath.length - 1} › `}
        </span>
        <span>{lastCategory.name}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center flex-wrap gap-1">
      {categoryPath.map((category, index) => (
        <div key={category.id} className="flex items-center">
          {index === 0 ? (
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
          ) : (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          )}
          <button
            type="button"
            onClick={() => onCategoryClick?.(category)}
            className={`hover:underline ${index === categoryPath.length - 1 ? "font-medium" : "text-muted-foreground"}`}
          >
            {category.name}
          </button>
        </div>
      ))}
    </div>
  )
}
