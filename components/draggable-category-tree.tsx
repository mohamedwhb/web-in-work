"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, ChevronDown, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/category-service"

interface DraggableCategoryTreeProps {
  categories: Category[]
  onCategoryMove: (categoryId: string, newParentId: string | null) => void
  onCategoriesReorder: (parentId: string | null, orderedIds: string[]) => void
  onSelectCategory: (category: Category) => void
  selectedCategoryId?: string | null
  highlightText?: string
}

export function DraggableCategoryTree({
  categories,
  onCategoryMove,
  onCategoriesReorder,
  onSelectCategory,
  selectedCategoryId,
  highlightText = "",
}: DraggableCategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)

  // Sensoren für Drag-and-Drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Toggle category expansion
  const toggleExpand = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation()
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

  // Drag start handler
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    const draggedCategory = categories.find((cat) => cat.id === active.id)
    if (draggedCategory) {
      setActiveCategory(draggedCategory)
    }
  }

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeCategory = categories.find((cat) => cat.id === active.id)
      const overCategory = categories.find((cat) => cat.id === over.id)

      if (activeCategory && overCategory) {
        // Wenn die Zielkategorie dieselbe übergeordnete Kategorie hat, handelt es sich um eine Neuanordnung
        if (activeCategory.parentId === overCategory.parentId) {
          const parentId = activeCategory.parentId
          const siblings = categories
            .filter((cat) => cat.parentId === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))

          const oldIndex = siblings.findIndex((cat) => cat.id === active.id)
          const newIndex = siblings.findIndex((cat) => cat.id === over.id)

          if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = [...siblings]
            const [removed] = newOrder.splice(oldIndex, 1)
            newOrder.splice(newIndex, 0, removed)

            onCategoriesReorder(
              parentId,
              newOrder.map((cat) => cat.id),
            )
          }
        } else {
          // Andernfalls handelt es sich um eine Verschiebung zu einer neuen übergeordneten Kategorie
          onCategoryMove(active.id as string, overCategory.id)
        }
      }
    }

    setActiveId(null)
    setActiveCategory(null)
  }

  // Drag over handler
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeCategory = categories.find((cat) => cat.id === active.id)
    const overCategory = categories.find((cat) => cat.id === over.id)

    if (!activeCategory || !overCategory) return

    // Wenn über einer Kategorie, die nicht die aktive ist, und die Kategorie erweitert ist,
    // erweitern wir sie automatisch, um das Verschieben in Unterkategorien zu erleichtern
    if (active.id !== over.id && hasChildren(over.id as string)) {
      setExpandedCategories((prev) => ({
        ...prev,
        [over.id as string]: true,
      }))
    }
  }

  // Rendere die Kategoriestruktur rekursiv
  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const filteredCategories = categories
      .filter((category) => category.parentId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

    if (filteredCategories.length === 0) {
      return null
    }

    return (
      <div className={cn("pl-4", level === 0 ? "pl-0" : "")}>
        <SortableContext items={filteredCategories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
          {filteredCategories.map((category) => (
            <SortableItem
              key={category.id}
              category={category}
              hasChildren={hasChildren(category.id)}
              isExpanded={expandedCategories[category.id] ?? false}
              isSelected={selectedCategoryId === category.id}
              toggleExpand={toggleExpand}
              onSelectCategory={onSelectCategory}
              level={level}
              highlightText={highlightText}
              highlightMatch={highlightMatch}
            >
              {(expandedCategories[category.id] ?? false) &&
                hasChildren(category.id) &&
                renderCategoryTree(category.id, level + 1)}
            </SortableItem>
          ))}
        </SortableContext>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      {renderCategoryTree()}

      <DragOverlay>
        {activeId && activeCategory ? (
          <div className="flex items-center py-1 px-2 rounded-md bg-primary/10 border border-primary/30 shadow-md">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: activeCategory.color }}></div>
            <span>{activeCategory.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface SortableItemProps {
  category: Category
  hasChildren: boolean
  isExpanded: boolean
  isSelected: boolean
  toggleExpand: (categoryId: string, e: React.MouseEvent) => void
  onSelectCategory: (category: Category) => void
  level: number
  highlightText?: string
  highlightMatch: (text: string) => React.ReactNode
  children?: React.ReactNode
}

function SortableItem({
  category,
  hasChildren,
  isExpanded,
  isSelected,
  toggleExpand,
  onSelectCategory,
  level,
  highlightText = "",
  highlightMatch,
  children,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const matchesSearch =
    highlightText &&
    (category.name.toLowerCase().includes(highlightText.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(highlightText.toLowerCase())))

  return (
    <div ref={setNodeRef} style={style} className="mb-1">
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-md",
          isSelected ? "bg-primary/10" : "hover:bg-muted",
          isDragging ? "opacity-50" : "",
          matchesSearch ? "ring-1 ring-yellow-400 dark:ring-yellow-600" : "",
        )}
      >
        <div {...attributes} {...listeners} className="cursor-grab mr-1 text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>

        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => toggleExpand(category.id, e)}
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

      {children}
    </div>
  )
}
