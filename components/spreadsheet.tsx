"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Download, Upload, FileSpreadsheet } from "lucide-react"
import { Cell } from "@/components/cell"
import { Toolbar } from "@/components/toolbar"
import { FormulaBar } from "@/components/formula-bar"
import { evaluateFormula } from "@/lib/formula-parser"

// Define types
type CellData = {
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

type SpreadsheetData = {
  [key: string]: CellData
}

export function Spreadsheet() {
  // State for the spreadsheet data
  const [data, setData] = useState<SpreadsheetData>({})

  // State for the selected cell
  const [selectedCell, setSelectedCell] = useState<string | null>(null)

  // State for the active cell being edited
  const [activeCell, setActiveCell] = useState<string | null>(null)

  // State for the current selection range
  const [selectionRange, setSelectionRange] = useState<{ start: string; end: string } | null>(null)

  // Ref for the spreadsheet container
  const spreadsheetRef = useRef<HTMLDivElement>(null)

  // Generate column headers (A, B, C, ...)
  const [columns, setColumns] = useState(Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)))

  // Generate row numbers (1, 2, 3, ...)
  const [rows, setRows] = useState(Array.from({ length: 100 }, (_, i) => i + 1))

  // State for row heights
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({})

  // State for column widths
  const [colWidths, setColWidths] = useState<{ [key: string]: number }>({})

  // State for row resizing
  const [isResizingRow, setIsResizingRow] = useState<number | null>(null)

  // State for column resizing
  const [isResizingCol, setIsResizingCol] = useState<string | null>(null)

  // State for resize start position
  const [resizeStartPos, setResizeStartPos] = useState<{ x: number, y: number } | null>(null)

  // State for context menu
  const [showContextMenu, setShowContextMenu] = useState<{ x: number, y: number, type: 'row' | 'column' | 'cell', target: number | string } | null>(null)

  // State for dragging selection
  const [isDraggingSelection, setIsDraggingSelection] = useState(false)

  // State for selection start
  const [selectionStart, setSelectionStart] = useState<string | null>(null)

  // State for selection end
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null)

  // State for clipboard
  const [clipboard, setClipboard] = useState<{ value: string, formula: string } | null>(null)


  // Initialize the spreadsheet with empty cells
  useEffect(() => {
    const initialData: SpreadsheetData = {}

    // Create empty cells for the visible area
    for (let row = 1; row <= 100; row++) {
      for (let col = 0; col < 26; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row}`
        initialData[cellId] = {
          value: '',
          formula: '',
          dataType: 'auto',
          style: {
            bold: false,
            italic: false,
            underline: false,
            align: 'left',
            backgroundColor: '',
            textColor: '',
            fontSize: 14
          }
        }
      }
    }

    setData(initialData)

    // Initialize default column widths
    const initialColWidths: { [key: string]: number } = {}
    columns.forEach(col => {
      initialColWidths[col] = 100 // Default width in pixels
    })
    setColWidths(initialColWidths)

    // Initialize default row heights
    const initialRowHeights: { [key: number]: number } = {}
    rows.forEach(row => {
      initialRowHeights[row] = 24 // Default height in pixels
    })
    setRowHeights(initialRowHeights)
  }, [columns, rows]) // Added columns and rows as dependencies

  // Handle cell selection
  const handleCellSelect = (cellId: string) => {
    setSelectedCell(cellId)
    setActiveCell(null)
  }

  // Handle cell editing
  const handleCellEdit = (cellId: string) => {
    setActiveCell(cellId)
  }

  // Handle cell value change
  const handleCellChange = (cellId: string, value: string, isFormula = false) => {
    setData(prevData => {
      const newData = { ...prevData }
      const cellData = newData[cellId]

      if (isFormula) {
        // Store the formula and evaluate it
        newData[cellId] = {
          ...cellData,
          formula: value,
          value: evaluateFormula(value, newData)
        }
      } else {
        // Validate the data based on the cell's data type
        const validation = validateCellData(cellId, value, cellData.dataType)

        if (validation.valid) {
          // Store the value directly
          newData[cellId] = {
            ...cellData,
            value,
            formula: '',
            dataType: validation.type
          }
        } else {
          // Handle invalid data
          alert(validation.message)
          return prevData
        }
      }

      // Update dependent cells
      updateDependentCells(cellId, newData)

      return newData
    })
  }

  // Handle cell style change
  const handleCellStyleChange = (
    cellId: string,
    styleProperty: keyof CellData["style"] | "dataType",
    value: any
  ) => {
    setData((prevData) => {
      const newData = { ...prevData }

      if (styleProperty === "dataType") {
        // Update dataType directly on cellData
        newData[cellId] = {
          ...newData[cellId],
          dataType: value,
        }
      } else {
        // Update style properties
        newData[cellId] = {
          ...newData[cellId],
          style: {
            ...newData[cellId].style,
            [styleProperty]: value,
          },
        }
      }

      return newData
    })
  }


  // Handle drag start
  const handleDragStart = (e: React.DragEvent, cellId: string) => {
    e.dataTransfer.setData("text/plain", cellId)
    e.dataTransfer.effectAllowed = "move"
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetCellId: string) => {
    e.preventDefault()
    const sourceCellId = e.dataTransfer.getData("text/plain")

    if (sourceCellId === targetCellId) return

    setData((prevData) => {
      const newData = { ...prevData }

      // Copy the source cell data to the target cell
      newData[targetCellId] = { ...newData[sourceCellId] }

      // Clear the source cell
      newData[sourceCellId] = {
        value: "",
        formula: "",
        dataType: 'auto',
        style: {
          bold: false,
          italic: false,
          underline: false,
          align: "left",
          backgroundColor: "",
          textColor: "",
          fontSize: 14
        },
      }

      return newData
    })
  }

  // Export spreadsheet data
  const exportData = () => {
    const dataStr = JSON.stringify(data)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = "spreadsheet.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Import spreadsheet data
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string)
        setData(importedData)
      } catch (error) {
        console.error("Error importing data:", error)
      }
    }

    reader.readAsText(file)
  }

  // Add row
  const addRow = (afterRow: number) => {
    // Shift all rows down
    setData(prevData => {
      const newData = { ...prevData }

      // Move all rows below the insertion point down by one
      for (let row = rows.length; row > afterRow; row--) {
        for (let col = 0; col < columns.length; col++) {
          const oldCellId = `${columns[col]}${row}`
          const newCellId = `${columns[col]}${row + 1}`
          newData[newCellId] = { ...newData[oldCellId] }
        }
      }

      // Clear the new row
      for (let col = 0; col < columns.length; col++) {
        const cellId = `${columns[col]}${afterRow + 1}`
        newData[cellId] = {
          value: '',
          formula: '',
          dataType: 'auto',
          style: {
            bold: false,
            italic: false,
            underline: false,
            align: 'left',
            backgroundColor: '',
            textColor: '',
            fontSize: 14
          }
        }
      }

      return newData
    })

    // Update row heights
    setRowHeights(prev => {
      const newHeights = { ...prev }

      // Shift heights down
      for (let row = rows.length; row > afterRow; row--) {
        newHeights[row + 1] = newHeights[row]
      }

      // Set default height for new row
      newHeights[afterRow + 1] = 24

      return newHeights
    })

    // Update rows array
    setRows(prev => [...prev, prev.length + 1])
  }

  // Delete row
  const deleteRow = (rowIndex: number) => {
    setData(prevData => {
      const newData = { ...prevData }

      // Move all rows below the deletion point up by one
      for (let row = rowIndex; row < rows.length; row++) {
        for (let col = 0; col < columns.length; col++) {
          const oldCellId = `${columns[col]}${row + 1}`
          const newCellId = `${columns[col]}${row}`
          newData[newCellId] = { ...newData[oldCellId] }
        }
      }

      // Remove the last row
      for (let col = 0; col < columns.length; col++) {
        delete newData[`${columns[col]}${rows.length}`]
      }

      return newData
    })

    // Update row heights
    setRowHeights(prev => {
      const newHeights = { ...prev }

      // Shift heights up
      for (let row = rowIndex; row < rows.length; row++) {
        newHeights[row] = newHeights[row + 1]
      }

      // Remove the last row height
      delete newHeights[rows.length]

      return newHeights
    })

    // Update rows array
    setRows(prev => prev.slice(0, -1))
  }

  // Add column
  const addColumn = (afterCol: string) => {
    const afterColIndex = columns.indexOf(afterCol)

    // Create a new column letter
    const newColLetter = String.fromCharCode(65 + columns.length)

    setData(prevData => {
      const newData = { ...prevData }

      // Move all columns to the right of the insertion point
      for (let col = columns.length - 1; col > afterColIndex; col--) {
        for (let row = 1; row <= rows.length; row++) {
          const oldCellId = `${columns[col]}${row}`
          const newCellId = `${columns[col + 1]}${row}`
          newData[newCellId] = { ...newData[oldCellId] }
        }
      }

      // Clear the new column
      for (let row = 1; row <= rows.length; row++) {
        const cellId = `${newColLetter}${row}`
        newData[cellId] = {
          value: '',
          formula: '',
          dataType: 'auto',
          style: {
            bold: false,
            italic: false,
            underline: false,
            align: 'left',
            backgroundColor: '',
            textColor: '',
            fontSize: 14
          }
        }
      }

      return newData
    })

    // Update column widths
    setColWidths(prev => {
      const newWidths = { ...prev }

      // Set default width for new column
      newWidths[newColLetter] = 100

      return newWidths
    })

    // Update columns array
    setColumns(prev => [...prev, newColLetter])
  }

  // Delete column
  const deleteColumn = (colLetter: string) => {
    const colIndex = columns.indexOf(colLetter)

    setData(prevData => {
      const newData = { ...prevData }

      // Move all columns to the right of the deletion point left by one
      for (let col = colIndex; col < columns.length - 1; col++) {
        for (let row = 1; row <= rows.length; row++) {
          const oldCellId = `${columns[col + 1]}${row}`
          const newCellId = `${columns[col]}${row}`
          newData[newCellId] = { ...newData[oldCellId] }
        }
      }

      // Remove the last column
      for (let row = 1; row <= rows.length; row++) {
        delete newData[`${columns[columns.length - 1]}${row}`]
      }

      return newData
    })

    // Update column widths
    setColWidths(prev => {
      const newWidths = { ...prev }

      // Remove the deleted column width
      delete newWidths[colLetter]

      return newWidths
    })

    // Update columns array
    setColumns(prev => prev.filter(col => col !== colLetter))
  }

  // Handle row resize start
  const handleRowResizeStart = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault()
    setIsResizingRow(rowIndex)
    setResizeStartPos({ x: e.clientX, y: e.clientY })
  }

  // Handle column resize start
  const handleColResizeStart = (e: React.MouseEvent, colLetter: string) => {
    e.preventDefault()
    setIsResizingCol(colLetter)
    setResizeStartPos({ x: e.clientX, y: e.clientY })
  }

  // Handle resize move
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (isResizingRow && resizeStartPos) {
      const deltaY = e.clientY - resizeStartPos.y
      setRowHeights(prev => ({
        ...prev,
        [isResizingRow]: Math.max(24, (prev[isResizingRow] || 24) + deltaY)
      }))
      setResizeStartPos({ x: e.clientX, y: e.clientY })
    } else if (isResizingCol && resizeStartPos) {
      const deltaX = e.clientX - resizeStartPos.x
      setColWidths(prev => ({
        ...prev,
        [isResizingCol]: Math.max(50, (prev[isResizingCol] || 100) + deltaX)
      }))
      setResizeStartPos({ x: e.clientX, y: e.clientY })
    }
  }, [isResizingRow, isResizingCol, resizeStartPos])

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizingRow(null)
    setIsResizingCol(null)
    setResizeStartPos(null)
  }, [])

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizingRow || isResizingCol) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove)
      window.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isResizingRow, isResizingCol, handleResizeMove, handleResizeEnd])

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, type: 'row' | 'column' | 'cell', target: number | string) => {
    e.preventDefault()
    setShowContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      target
    })
  }

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(null)
    }

    window.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [])

  // Handle selection start
  const handleSelectionStart = (cellId: string) => {
    setSelectionStart(cellId)
    setSelectionEnd(cellId)
    setIsDraggingSelection(true)
  }

  // Handle selection move
  const handleSelectionMove = (cellId: string) => {
    if (isDraggingSelection) {
      setSelectionEnd(cellId)
    }
  }

  // Handle selection end
  const handleSelectionEnd = () => {
    setIsDraggingSelection(false)
  }

  // Copy selection
  const copySelection = () => {
    if (!selectedCell) return;
    if (!data || !data[selectedCell]) return;
  
    // Copy both value & formula
    const { value, formula } = data[selectedCell];
  
    setClipboard({ value: value ? String(value) : "", formula: formula || "" });
  };
  

  const handleDeleteCell = (cellId: string) => {
    setData(prevData => ({
      ...prevData,
      [cellId]: {
        ...prevData[cellId],
        value: '',
        formula: '',
      }
    }));
  };


  // Cut selection
  const cutSelection = () => {
    if (!selectedCell) return;
    if (!data || !data[selectedCell]) return;
  
    // Copy value & formula before clearing the cell
    const { value, formula } = data[selectedCell];
    setClipboard({ value: value ? String(value) : "", formula: formula || "" });
  
    // Clear the cell after cutting
    const newData = { ...data };
    newData[selectedCell] = { ...newData[selectedCell], value: "", formula: "" };
    setData(newData);
  };
  
  
  

  // Paste selection
  const pasteSelection = (targetCell: string) => {
    if (!targetCell || !clipboard) return;
  
    const newData = { ...data };
    newData[targetCell] = {
      ...newData[targetCell],
      value: clipboard.formula ? clipboard.formula : clipboard.value, // Paste formula if exists
      formula: clipboard.formula, // Keep formula if copied
    };
  
    setData(newData);
  };
  

  // Helper function to parse a cell ID into column and row
  const parseCellId = (cellId: string): [string, number] => {
    const col = cellId.match(/[A-Z]+/)?.[0] || 'A'
    const row = Number.parseInt(cellId.match(/[0-9]+/)?.[0] || '1')
    return [col, row]
  }

  // Helper function to update formula cell references
  const updateFormulaCellReferences = (formula: string, colOffset: number, rowOffset: number): string => {
    // Regular expression to match cell references (e.g., A1, B2, etc.)
    const cellRefRegex = /([A-Z]+)([0-9]+)/g

    // Replace cell references with their updated positions
    return formula.replace(cellRefRegex, (match, col, row) => {
      const newCol = String.fromCharCode(col.charCodeAt(0) + colOffset)
      const newRow = Number.parseInt(row) + rowOffset
      return `${newCol}${newRow}`
    })
  }

  // Helper function to get all cells in a selection range
  const getSelectedCells = (start: string, end: string): string[] => {
    const [startCol, startRow] = parseCellId(start)
    const [endCol, endRow] = parseCellId(end)

    const startColIndex = startCol.charCodeAt(0)
    const endColIndex = endCol.charCodeAt(0)

    const minColIndex = Math.min(startColIndex, endColIndex)
    const maxColIndex = Math.max(startColIndex, endColIndex)

    const minRow = Math.min(startRow, endRow)
    const maxRow = Math.max(startRow, endRow)

    const selectedCells: string[] = []

    for (let colIndex = minColIndex; colIndex <= maxColIndex; colIndex++) {
      const col = String.fromCharCode(colIndex)

      for (let row = minRow; row <= maxRow; row++) {
        selectedCells.push(`${col}${row}`)
      }
    }

    return selectedCells
  }

  // Data validation function
  const validateCellData = (cellId: string, value: string, dataType: CellData['dataType']) => {
    if (dataType === 'auto') {
      // Auto-detect the data type
      if (!isNaN(Number(value))) {
        return { valid: true, type: 'number' as const }
      } else if (!isNaN(Date.parse(value))) {
        return { valid: true, type: 'date' as const }
      } else {
        return { valid: true, type: 'text' as const }
      }
    } else if (dataType === 'number') {
      // Validate as number
      if (!isNaN(Number(value))) {
        return { valid: true, type: 'number' as const }
      } else {
        return { valid: false, message: 'Value must be a number' }
      }
    } else if (dataType === 'date') {
      // Validate as date
      if (!isNaN(Date.parse(value))) {
        return { valid: true, type: 'date' as const }
      } else {
        return { valid: false, message: 'Value must be a valid date' }
      }
    }

    // Text type always valid
    return { valid: true, type: 'text' as const }
  }

  // Function to update cells that depend on the changed cell
  const updateDependentCells = (changedCellId: string, spreadsheetData: SpreadsheetData) => {
    // Find all cells that reference the changed cell
    Object.entries(spreadsheetData).forEach(([cellId, cellData]) => {
      if (cellData.formula && cellData.formula.includes(changedCellId)) {
        // Re-evaluate the formula
        spreadsheetData[cellId].value = evaluateFormula(cellData.formula, spreadsheetData)

        // Recursively update cells that depend on this cell
        updateDependentCells(cellId, spreadsheetData)
      }
    })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Spreadsheet header */}
      <div className="flex items-center p-2 bg-white border-b">
        <div className="flex items-center mr-4">
          <FileSpreadsheet className="w-6 h-6 mr-2 text-green-600" />
          <h1 className="text-lg font-medium">Sheets Clone</h1>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={exportData}
            className="p-1 text-gray-600 rounded hover:bg-gray-100"
            title="Export"
          >
            <Download className="w-5 h-5" />
          </button>

          <label className="p-1 text-gray-600 rounded hover:bg-gray-100 cursor-pointer" title="Import">
            <Upload className="w-5 h-5" />
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importData}
            />
          </label>
        </div>
      </div>

      {/* Formula bar */}
      <FormulaBar
        selectedCell={selectedCell}
        cellData={selectedCell ? data[selectedCell] : null}
        onCellChange={handleCellChange}
      />

      {/* Toolbar */}
      <Toolbar
        selectedCell={selectedCell}
        cellData={selectedCell ? data[selectedCell] : null}
        onStyleChange={handleCellStyleChange}
        onCopy={copySelection}
        onCut={cutSelection}
        onPaste={() => selectedCell && pasteSelection(selectedCell)}
      />

      {/* Spreadsheet container */}
      <div
        className="flex-1 overflow-auto"
        ref={spreadsheetRef}
      >
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                {/* Empty corner cell */}
                <th className="w-10 h-8 bg-gray-100 border border-gray-300 sticky top-0 left-0 z-20"></th>

                {/* Column headers */}
                {columns.map(column => (
                  <th
                    key={column}
                    className="h-8 px-2 bg-gray-100 border border-gray-300 sticky top-0 z-10 relative select-none"
                    style={{ width: `${colWidths[column] || 100}px` }}
                    onContextMenu={(e) => handleContextMenu(e, 'column', column)}
                  >
                    <div className="flex items-center justify-center">
                      {column}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize"
                        onMouseDown={(e) => handleColResizeStart(e, column)}
                      ></div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row}>
                  {/* Row header */}
                  <td
                    className="bg-gray-100 border border-gray-300 text-center sticky left-0 z-10 relative select-none"
                    style={{ height: `${rowHeights[row] || 24}px` }}
                    onContextMenu={(e) => handleContextMenu(e, 'row', row)}
                  >
                    <div className="flex items-center justify-center h-full">
                      {row}
                      <div
                        className="absolute right-0 bottom-0 left-0 h-1 cursor-row-resize"
                        onMouseDown={(e) => handleRowResizeStart(e, row)}
                      ></div>
                    </div>
                  </td>

                  {/* Cells */}
                  {columns.map(column => {
                    const cellId = `${column}${row}`
                    const cellData = data[cellId] || {
                      value: '',
                      formula: '',
                      dataType: 'auto',
                      style: {
                        bold: false,
                        italic: false,
                        underline: false,
                        align: 'left',
                        backgroundColor: '',
                        textColor: '',
                        fontSize: 14
                      }
                    }

                    // Check if this cell is in the current selection
                    const isInSelection = selectionStart && selectionEnd &&
                      getSelectedCells(selectionStart, selectionEnd).includes(cellId)

                    return (
                      <Cell
                        key={cellId}
                        id={cellId}
                        data={cellData}
                        isSelected={selectedCell === cellId}
                        isInSelection={isInSelection}
                        isActive={activeCell === cellId}
                        onSelect={() => handleCellSelect(cellId)}
                        onEdit={() => handleCellEdit(cellId)}
                        onChange={(value, isFormula) => handleCellChange(cellId, value, isFormula)}
                        onDragStart={(e) => handleDragStart(e, cellId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, cellId)}
                        onSelectionStart={() => handleSelectionStart(cellId)}
                        onSelectionMove={() => handleSelectionMove(cellId)}
                        onSelectionEnd={handleSelectionEnd}
                        onContextMenu={(e) => handleContextMenu(e, 'cell', cellId)}
                        width={colWidths[column] || 100}
                        height={rowHeights[row] || 24}
                      />
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white border rounded shadow-lg z-50"
          style={{ top: showContextMenu.y, left: showContextMenu.x }}
        >
          {showContextMenu.type === 'row' && (
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => addRow(showContextMenu.target as number)}
              >
                Insert row below
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => deleteRow(showContextMenu.target as number)}
              >
                Delete row
              </button>
            </div>
          )}

          {showContextMenu.type === 'column' && (
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => addColumn(showContextMenu.target as string)}
              >
                Insert column right
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => deleteColumn(showContextMenu.target as string)}
              >
                Delete column
              </button>
            </div>
          )}

          {showContextMenu.type === 'cell' && (
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  copySelection()
                  setShowContextMenu(null)
                }}
              >
                Copy
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  cutSelection()
                  setShowContextMenu(null)
                }}
              >
                Cut
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  if (selectedCell) {
                    pasteSelection(selectedCell)
                    setShowContextMenu(null)
                  }
                }}
              >
                Paste
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                onClick={() => {
                  if (selectedCell) {
                    handleDeleteCell(selectedCell)
                    setShowContextMenu(null)
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

