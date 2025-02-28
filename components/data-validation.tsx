"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type DataValidationProps = {
  selectedCell: string | null
  onApplyValidation: (cellId: string, validationType: "text" | "number" | "date" | "list", options: any) => void
}

export function DataValidation({ selectedCell, onApplyValidation }: DataValidationProps) {
  const [validationType, setValidationType] = useState<"text" | "number" | "date" | "list">("text")
  const [minValue, setMinValue] = useState("")
  const [maxValue, setMaxValue] = useState("")
  const [listValues, setListValues] = useState("")

  const handleApply = () => {
    if (!selectedCell) return

    let options: any = {}

    switch (validationType) {
      case "number":
        options = {
          min: minValue !== "" ? Number(minValue) : undefined,
          max: maxValue !== "" ? Number(maxValue) : undefined,
        }
        break
      case "date":
        options = {
          min: minValue !== "" ? minValue : undefined,
          max: maxValue !== "" ? maxValue : undefined,
        }
        break
      case "list":
        options = {
          values: listValues.split(",").map((v) => v.trim()),
        }
        break
    }

    onApplyValidation(selectedCell, validationType, options)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!selectedCell}>
          Data Validation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Data Validation</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="validation-type">Validation Type</Label>
            <Select value={validationType} onValueChange={(value) => setValidationType(value as any)}>
              <SelectTrigger id="validation-type">
                <SelectValue placeholder="Select validation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {validationType === "number" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="min-value">Minimum Value (Optional)</Label>
                <Input id="min-value" type="number" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-value">Maximum Value (Optional)</Label>
                <Input id="max-value" type="number" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
              </div>
            </>
          )}

          {validationType === "date" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="min-date">Minimum Date (Optional)</Label>
                <Input id="min-date" type="date" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-date">Maximum Date (Optional)</Label>
                <Input id="max-date" type="date" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
              </div>
            </>
          )}

          {validationType === "list" && (
            <div className="grid gap-2">
              <Label htmlFor="list-values">List Values (comma separated)</Label>
              <Input
                id="list-values"
                value={listValues}
                onChange={(e) => setListValues(e.target.value)}
                placeholder="Value1, Value2, Value3"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleApply}>Apply Validation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

