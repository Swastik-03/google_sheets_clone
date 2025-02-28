"use client"

import type React from "react"

import { FunctionSquare, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type FormulaBarProps = {
  selectedCell: string | null
  cellData: {
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
  } | null
  onCellChange: (cellId: string, value: string, isFormula: boolean) => void
}

export function FormulaBar({ selectedCell, cellData, onCellChange }: FormulaBarProps) {
  // Handle formula input change
  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCell) return

    const value = e.target.value
    const isFormula = value.startsWith("=")

    onCellChange(selectedCell, value, isFormula)
  }

  // Insert a function into the formula
  const insertFunction = (funcName: string) => {
    if (!selectedCell) return

    const currentValue = cellData?.formula || cellData?.value || ""
    const newValue = `=${funcName}()`

    onCellChange(selectedCell, newValue, true)
  }

  return (
    <div className="flex items-center p-2 bg-white">
      <div className="flex items-center mr-2">
        <FunctionSquare className="w-5 h-5 text-green-600 mr-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center text-sm font-medium">
              <span>fx</span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white">
            <DropdownMenuItem onClick={() => insertFunction("SUM")}>SUM - Sum of values </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFunction("AVERAGE")}>AVERAGE - Average of values</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFunction("MAX")}>MAX - Maximum value</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFunction("MIN")}>MIN - Minimum value</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFunction("COUNT")}>COUNT - Count values</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFunction("TRIM")}>TRIM - Remove whitespace</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFunction("UPPER")}>UPPER - Convert to uppercase</DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFunction("LOWER")}>LOWER - Convert to lowercase</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-16 h-8 flex items-center justify-center bg-gray-100 border rounded mr-2">
        {selectedCell || ""}
      </div>

      <input
        type="text"
        className="flex-1 h-8 px-2 border rounded"
        placeholder="Enter a formula starting with ="
        value={selectedCell && cellData ? cellData.formula || cellData.value : ""}
        onChange={handleFormulaChange}
        disabled={!selectedCell}
      />
    </div>
  )
}

