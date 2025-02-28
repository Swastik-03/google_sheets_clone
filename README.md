# Google Sheets Clone

This project is a clone of Google Sheets built using modern web technologies. It provides a spreadsheet interface with functionalities such as cell editing, formula evaluation, data validation, and more.

## Table of Contents

- Features
- Tech Stack
- Data Structures
- Installation
- Usage
- Contributing
- License

## Features

- Cell editing with support for text, numbers, and dates
- Formula evaluation (SUM, AVERAGE, COUNT, MAX, MIN, TRIM, UPPER, LOWER)
- Data validation for text, numbers, dates, and lists
- Copy, cut, and paste functionalities
- Row and column resizing
- Context menu for row and column operations
- Export and import spreadsheet data as JSON

## Tech Stack

- **Next.js**: A React framework for building server-side rendered and statically generated web applications.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Radix UI**: A set of accessible and unstyled UI components for building high-quality web applications.
- **Math.js**: A library for mathematical operations and formula evaluation.
- **Lucide Icons**: A collection of simple and consistent icons for React.

### Why These Technologies?

- **Next.js**: Provides a robust framework for building scalable and performant web applications with server-side rendering and static site generation.
- **React**: Offers a component-based architecture that makes it easy to build and manage complex UIs.
- **TypeScript**: Enhances code quality and developer productivity with static type checking.
- **Tailwind CSS**: Enables rapid UI development with utility-first CSS classes.
- **Radix UI**: Ensures accessibility and provides unstyled components that can be customized to fit the design.
- **Math.js**: Simplifies the implementation of formula evaluation with its extensive mathematical functions.
- **Lucide Icons**: Provides a consistent and easy-to-use icon set for enhancing the UI.

## Data Structures

### CellData

Represents the data and style of a single cell in the spreadsheet.

```typescript
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
```

### SpreadsheetData

A dictionary that maps cell IDs (e.g., "A1", "B2") to their corresponding `CellData`.

```typescript
type SpreadsheetData = {
  [key: string]: CellData;
};
```

### State Management

- **data**: Holds the entire spreadsheet data as a `SpreadsheetData` object.
- **selectedCell**: Tracks the currently selected cell ID.
- **activeCell**: Tracks the cell ID that is currently being edited.
- **selectionRange**: Tracks the range of cells selected for operations like copy, cut, and paste.
- **rowHeights**: Stores the heights of each row.
- **colWidths**: Stores the widths of each column.
- **clipboard**: Stores the copied or cut cell data for pasting.

## Installation

1. Clone the repository:

```sh
git clone https://github.com/Swastik-03/google_sheets_clone.git
```

2. Navigate to the project directory:

```sh
cd google_sheets_clone
```

3. Install dependencies:

```sh
npm install
```

## Usage

1. Start the development server:

```sh
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.