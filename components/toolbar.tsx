"use client"

import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Palette,
  Copy,
  Scissors,
  Clipboard,
  ChevronDown,
  ScalingIcon as FontSize,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SketchPicker } from "react-color";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ToolbarProps = {
  selectedCell: string | null;
  cellData: {
    value: string;
    formula: string;
    dataType: "text" | "number" | "date" | "auto";
    style: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
      align: "left" | "center" | "right";
      backgroundColor: string;
      textColor: string;
      fontSize: number;
    };
  } | null;
  onStyleChange: (cellId: string, styleProperty: string, value: any) => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
};

export function Toolbar({ selectedCell, cellData, onStyleChange, onCopy, onCut, onPaste }: ToolbarProps) {
  // Toggle style property
  const handleStyleClick = (styleProperty: keyof (typeof cellData)["style"], value: any) => {
    if (!selectedCell || !cellData) return;
    const currentValue = cellData.style[styleProperty];
    onStyleChange(selectedCell, styleProperty, typeof value === "boolean" ? !currentValue : value);
  };

  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  return (
    <div className="flex items-center p-2 bg-white border-b space-x-2">
      {/* Clipboard Operations */}
      <Button variant="ghost" size="icon" onClick={onCopy} disabled={!selectedCell} title="Copy">
        <Copy className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onCut} disabled={!selectedCell} title="Cut">
        <Scissors className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onPaste} disabled={!selectedCell} title="Paste">
        <Clipboard className="w-5 h-5" />
      </Button>

      <div className="w-px h-6 bg-gray-300" />

      {/* Text Formatting */}
      {[{ icon: Bold, prop: "bold" }, { icon: Italic, prop: "italic" }, { icon: Underline, prop: "underline" }].map(
        ({ icon: Icon, prop }) => (
          <Button
            key={prop}
            variant="ghost"
            size="icon"
            className={cn(cellData?.style[prop] && "bg-gray-200")}
            onClick={() => handleStyleClick(prop, true)}
            disabled={!selectedCell}
            title={prop.charAt(0).toUpperCase() + prop.slice(1)}
          >
            <Icon className="w-5 h-5" />
          </Button>
        )
      )}

      <div className="w-px h-6 bg-gray-300" />

      {/* Color Pickers */}
      {[{ icon: Type, prop: "textColor" }, { icon: Palette, prop: "backgroundColor" }].map(({ icon: Icon, prop }) => (
        <div key={prop} className="relative">
          <Button
            variant="ghost"
            size="icon"
            disabled={!selectedCell}
            title={prop === "textColor" ? "Text Color" : "Background Color"}
            onClick={() => setShowColorPicker(showColorPicker === prop ? null : prop)}
          >
            <div className="flex items-center space-x-2">
              <Icon className="w-5 h-5" />
              <div className="w-1 h-4 border rounded" style={{ backgroundColor: cellData?.style[prop] || "transparent" }} />
            </div>
          </Button>
          {showColorPicker === prop && (
            <div className="absolute z-10 mt-2">
              <SketchPicker
                color={cellData?.style[prop] || "#000"}
                onChangeComplete={(color) => handleStyleClick(prop, color.hex)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Data Type Selection */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 rounded hover:bg-gray-100 flex items-center"
            disabled={!selectedCell}
            title="Data Type"
          >
            <span className="text-xs font-medium mr-1">
              {cellData?.dataType === "auto"
                ? "Auto"
                : cellData?.dataType === "number"
                  ? "123"
                  : cellData?.dataType === "date"
                    ? "Date"
                    : "Abc"}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white">
          <DropdownMenuItem onClick={() => onStyleChange(selectedCell!, "dataType", "auto")}>Auto</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStyleChange(selectedCell!, "dataType", "text")}>Text</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStyleChange(selectedCell!, "dataType", "number")}>Number</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStyleChange(selectedCell!, "dataType", "date")}>Date</DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-6 bg-gray-300" />
    </div>
  );
}
