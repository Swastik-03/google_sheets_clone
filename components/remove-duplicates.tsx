"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type RemoveDuplicatesProps = {
  selectedRange: { start: string; end: string } | null
  columns: string[]
  onRemoveDuplicates: (columnIndices: number[]) => void
}

export function RemoveDuplicates({ selectedRange, columns, onRemoveDuplicates }: RemoveDuplicatesProps) {
  const [selectedColumns, setSelectedColumns] = useState<number[]>([])

  const handleColumnToggle = (columnIndex: number) => {
    setSelectedColumns((prev) => {
      if (prev.includes(columnIndex)) {
        return prev.filter((col) => col !== columnIndex)
      } else {
        return [...prev, columnIndex]
      }
    })
  }

  const handleRemove = () => {
    if (selectedColumns.length > 0) {
      onRemoveDuplicates(selectedColumns)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!selectedRange}>
          Remove Duplicates
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Duplicates</DialogTitle>
          <DialogDescription>Select the columns to check for duplicate values.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-60 overflow-y-auto">
          {columns.map((column, index) => (
            <div key={column} className="flex items-center space-x-2">
              <Checkbox
                id={`column-${column}`}
                checked={selectedColumns.includes(index)}
                onCheckedChange={() => handleColumnToggle(index)}
              />
              <Label htmlFor={`column-${column}`}>Column {column}</Label>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleRemove} disabled={selectedColumns.length === 0}>
            Remove Duplicates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

