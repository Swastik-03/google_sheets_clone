import { evaluate } from "mathjs";

type CellData = {
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
};

type SpreadsheetData = {
  [key: string]: CellData;
};

export function evaluateFormula(formula: string, data: SpreadsheetData): string {
  if (!formula.startsWith("=")) {
    return formula;
  }

  try {
    const expression = formula.substring(1);
    if (expression.startsWith("SUM(")) {
      return evaluateSum(expression.slice(4, -1), data);
    }
    if (expression.startsWith("AVERAGE(")) {
      return evaluateAverage(expression.slice(8, -1), data);
    }
    if (expression.startsWith("COUNT(")) {
      return evaluateCount(expression.slice(6, -1), data);
    }
    if (expression.startsWith("MAX(")) {
      return evaluateMax(expression.slice(4, -1), data);
    }
    if (expression.startsWith("MIN(")) {
      return evaluateMin(expression.slice(4, -1), data);
    }
    if (expression.startsWith("TRIM(")) {
      return evaluateTrim(expression.slice(5, -1), data);
    }
    if (expression.startsWith("UPPER(")) {
      return evaluateUpper(expression.slice(6, -1), data);
    }
    if (expression.startsWith("LOWER(")) {
      return evaluateLower(expression.slice(6, -1), data);
    }
    
    const processedExpression = processCellReferences(expression, data);
    const result = evaluate(processedExpression);
    return formatResult(result);
  } catch (error) {
    console.error("Error evaluating formula:", error);
    return "#ERROR!";
  }
}

function processCellReferences(expression: string, data: SpreadsheetData): string {
  const cellRefRegex = /\$?([A-Z]+)\$?(\d+)/g;
  return expression.replace(cellRefRegex, (match, col, row) => {
    const cellId = `${col}${row}`;
    const cellData = data[cellId];
    return cellData && !isNaN(Number(cellData.value)) ? cellData.value : "0";
  });
}

function expandRange(range: string): string[] {
  if (!range.includes(":")) {
    return [range];
  }
  const [start, end] = range.split(":");
  const startCol = start.match(/[A-Z]+/)?.[0] || "A";
  const startRow = Number(start.match(/\d+/)?.[0] || "1");
  const endCol = end.match(/[A-Z]+/)?.[0] || "A";
  const endRow = Number(end.match(/\d+/)?.[0] || "1");

  const startColIndex = columnToIndex(startCol);
  const endColIndex = columnToIndex(endCol);

  const cells: string[] = [];
  for (let col = startColIndex; col <= endColIndex; col++) {
    for (let row = startRow; row <= endRow; row++) {
      cells.push(`${indexToColumn(col)}${row}`);
    }
  }
  return cells;
}

function columnToIndex(column: string): number {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + (column.charCodeAt(i) - 64);
  }
  return index;
}

function indexToColumn(index: number): string {
  let column = "";
  while (index > 0) {
    const remainder = (index - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    index = Math.floor((index - 1) / 26);
  }
  return column;
}

function formatResult(result: number): string {
  return Number.isInteger(result) ? result.toString() : result.toFixed(2).replace(/\.00$/, "");
}

function evaluateSum(range: string, data: SpreadsheetData): string {
  return formatResult(expandRange(range).reduce((sum, cell) => sum + (Number(data[cell]?.value) || 0), 0));
}

function evaluateAverage(range: string, data: SpreadsheetData): string {
  const values = expandRange(range).map(cell => Number(data[cell]?.value) || 0);
  return values.length ? formatResult(values.reduce((sum, v) => sum + v, 0) / values.length) : "#DIV/0!";
}

function evaluateCount(range: string, data: SpreadsheetData): string {
  return formatResult(expandRange(range).filter(cell => !isNaN(Number(data[cell]?.value))).length);
}

function evaluateMax(range: string, data: SpreadsheetData): string {
  return formatResult(Math.max(...expandRange(range).map(cell => Number(data[cell]?.value) || -Infinity)));
}

function evaluateMin(range: string, data: SpreadsheetData): string {
  return formatResult(Math.min(...expandRange(range).map(cell => Number(data[cell]?.value) || Infinity)));
}

function evaluateTrim(cellRef: string, data: SpreadsheetData): string {
  return data[cellRef]?.value.trim() || "";
}

function evaluateUpper(cellRef: string, data: SpreadsheetData): string {
  return data[cellRef]?.value.toUpperCase() || "";
}

function evaluateLower(cellRef: string, data: SpreadsheetData): string {
  return data[cellRef]?.value.toLowerCase() || "";
}
