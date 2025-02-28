"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

type CellProps = {
  id: string
  data: {
    value: string
    formula: string
    dataType: "text" | "number" | "date" | "auto"
    style: {
      bold: boolean
      italic: boolean
      underline: boolean
      align: "left" | "center" | "right"
      backgroundColor: string
      textColor: string
      fontSize: number
    }
  }
  isSelected: boolean
  isInSelection?: boolean
  isActive: boolean
  width: number
  height: number
  onSelect: () => void
  onEdit: () => void
  onChange: (value: string, isFormula: boolean) => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onSelectionStart?: () => void
  onSelectionMove?: () => void
  onSelectionEnd?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function Cell({
  id,
  data,
  isSelected,
  isInSelection,
  isActive,
  width,
  height,
  onSelect,
  onEdit,
  onChange,
  onDragStart,
  onDragOver,
  onDrop,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  onContextMenu,
}: CellProps) {
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Update the edit value when the cell becomes active
  useEffect(() => {
    if (isActive) {
      setEditValue(data.formula || data.value)

      // Focus the input when the cell becomes active
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [isActive, data.formula, data.value])

  // Handle cell click
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey && onSelectionMove) {
      onSelectionMove()
    } else {
      if (isSelected) {
        onEdit()
      } else {
        onSelect()
        if (onSelectionStart) {
          onSelectionStart()
        }
      }
    }
  }

  // Handle mouse over for selection
  const handleMouseOver = () => {
    if (onSelectionMove) {
      onSelectionMove()
    }
  }

  // Handle mouse up for ending selection
  const handleMouseUp = () => {
    if (onSelectionEnd) {
      onSelectionEnd()
    }
  }

  // Handle double click
  const handleDoubleClick = () => {
    onEdit()
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Save the cell value
      const isFormula = editValue.startsWith("=")
      onChange(editValue, isFormula)
      onSelect() // Exit edit mode
    } else if (e.key === "Escape") {
      // Cancel editing
      onSelect()
    }
  }

  // Handle blur
  const handleBlur = () => {
    // Save the cell value when the input loses focus
    const isFormula = editValue.startsWith("=")
    onChange(editValue, isFormula)
    onSelect() // Exit edit mode
  }

  // Format the cell value based on data type
  const formattedValue = () => {
    if (data.dataType === "date" && !isNaN(Date.parse(data.value))) {
      return new Date(data.value).toLocaleDateString()
    }
    return data.value
  }

  // Generate cell style
  const cellStyle = {
    fontWeight: data.style.bold ? "bold" : "normal",
    fontStyle: data.style.italic ? "italic" : "normal",
    textDecoration: data.style.underline ? "underline" : "none",
    textAlign: data.style.align,
    backgroundColor: data.style.backgroundColor || (isSelected ? "#e8f0fe" : isInSelection ? "#e8f0fe80" : "white"),
    color: data.style.textColor || "black",
    border: isSelected ? "2px solid #1a73e8" : "1px solid #e0e0e0",
    fontSize: `${data.style.fontSize || 14}px`,
    width: `${width}px`,
    height: `${height}px`,
  } as React.CSSProperties

  return (
    <td
      className="p-0 relative"
      style={cellStyle}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      draggable={!isActive}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onContextMenu={onContextMenu}
    >
      {isActive ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full px-2 border-0 outline-none"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          style={{
            fontWeight: data.style.bold ? "bold" : "normal",
            fontStyle: data.style.italic ? "italic" : "normal",
            textDecoration: data.style.underline ? "underline" : "none",
            fontSize: `${data.style.fontSize || 14}px`,
          }}
        />
      ) : (
        <div
          className="w-full h-full px-2 overflow-hidden whitespace-nowrap text-ellipsis flex items-center"
          style={{
            justifyContent:
              data.style.align === "center" ? "center" : data.style.align === "right" ? "flex-end" : "flex-start",
          }}
        >
          {formattedValue()}
        </div>
      )}
    </td>
  )
}

