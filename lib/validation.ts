import { TicketGrid } from "./ticket-generator";

export type ClaimType = 
  | "EARLY_5"
  | "TOP_LINE"
  | "MIDDLE_LINE"
  | "BOTTOM_LINE"
  | "FULL_HOUSE"
  | "CORNERS"
  | "BREAKFAST"
  | "LUNCH"
  | "DINNER";

export interface ClaimResult {
  isValid: boolean;
  message: string;
}

// Helper to get all non-null numbers from a specific row
function getRowNumbers(grid: TicketGrid, rowIndex: number): number[] {
  return grid[rowIndex].filter((n) => n !== null) as number[];
}

// Helper to get all numbers
function getAllNumbers(grid: TicketGrid): number[] {
  return [
    ...getRowNumbers(grid, 0),
    ...getRowNumbers(grid, 1),
    ...getRowNumbers(grid, 2),
  ];
}

// Extracted corner logic
function getCornerNumbers(grid: TicketGrid): number[] {
  const topRow = getRowNumbers(grid, 0);
  const bottomRow = getRowNumbers(grid, 2);
  
  if (topRow.length === 0 || bottomRow.length === 0) return [];

  return [
    topRow[0], // Top Left
    topRow[topRow.length - 1], // Top Right
    bottomRow[0], // Bottom Left
    bottomRow[bottomRow.length - 1], // Bottom Right
  ];
}

export function validateClaim(
  claim: ClaimType,
  grid: TicketGrid,
  calledNumbers: number[]
): ClaimResult {
  const calledSet = new Set(calledNumbers);

  switch (claim) {
    case "EARLY_5": {
      const allNums = getAllNumbers(grid);
      const matched = allNums.filter((n) => calledSet.has(n));
      if (matched.length >= 5) {
        return { isValid: true, message: "Valid Early 5!" };
      }
      return { isValid: false, message: `Invalid. Found ${matched.length}/5 matched numbers.` };
    }

    case "TOP_LINE": {
      const rowNum = getRowNumbers(grid, 0);
      const matched = rowNum.filter((n) => calledSet.has(n));
      return matched.length === 5
        ? { isValid: true, message: "Valid Top Line!" }
        : { isValid: false, message: `Invalid. Found ${matched.length}/5 in Top Line.` };
    }

    case "MIDDLE_LINE": {
      const rowNum = getRowNumbers(grid, 1);
      const matched = rowNum.filter((n) => calledSet.has(n));
      return matched.length === 5
        ? { isValid: true, message: "Valid Middle Line!" }
        : { isValid: false, message: `Invalid. Found ${matched.length}/5 in Middle Line.` };
    }

    case "BOTTOM_LINE": {
      const rowNum = getRowNumbers(grid, 2);
      const matched = rowNum.filter((n) => calledSet.has(n));
      return matched.length === 5
        ? { isValid: true, message: "Valid Bottom Line!" }
        : { isValid: false, message: `Invalid. Found ${matched.length}/5 in Bottom Line.` };
    }

    case "FULL_HOUSE": {
      const allNums = getAllNumbers(grid);
      const matched = allNums.filter((n) => calledSet.has(n));
      return matched.length === 15
        ? { isValid: true, message: "Valid Full House!" }
        : { isValid: false, message: `Invalid. Found ${matched.length}/15 numbers.` };
    }

    case "CORNERS": {
      const corners = getCornerNumbers(grid);
      const matched = corners.filter((n) => calledSet.has(n));
      return matched.length === 4
        ? { isValid: true, message: "Valid Corners!" }
        : { isValid: false, message: `Invalid Corners. Found ${matched.length}/4.` };
    }

    case "BREAKFAST": {
      // All numbers from 1 to 30 marked on a single ticket
      const allNums = getAllNumbers(grid);
      const breakfastNums = allNums.filter((n) => n >= 1 && n <= 30);
      const matched = breakfastNums.filter((n) => calledSet.has(n));
      return matched.length === breakfastNums.length && breakfastNums.length > 0
        ? { isValid: true, message: "Valid Breakfast!" }
        : { isValid: false, message: `Invalid Breakfast. Found ${matched.length}/${breakfastNums.length} (1-30) marked.` };
    }
    case "LUNCH": {
      // All numbers from 31 to 60 marked on a single ticket
      const allNums = getAllNumbers(grid);
      const lunchNums = allNums.filter((n) => n >= 31 && n <= 60);
      const matched = lunchNums.filter((n) => calledSet.has(n));
      return matched.length === lunchNums.length && lunchNums.length > 0
        ? { isValid: true, message: "Valid Lunch!" }
        : { isValid: false, message: `Invalid Lunch. Found ${matched.length}/${lunchNums.length} (31-60) marked.` };
    }
    case "DINNER": {
      // All numbers from 61 to 90 marked on a single ticket
      const allNums = getAllNumbers(grid);
      const dinnerNums = allNums.filter((n) => n >= 61 && n <= 90);
      const matched = dinnerNums.filter((n) => calledSet.has(n));
      return matched.length === dinnerNums.length && dinnerNums.length > 0
        ? { isValid: true, message: "Valid Dinner!" }
        : { isValid: false, message: `Invalid Dinner. Found ${matched.length}/${dinnerNums.length} (61-90) marked.` };
    }
    default:
      return { isValid: false, message: "Unknown Claim Type" };
  }
}
