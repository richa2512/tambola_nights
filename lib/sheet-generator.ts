import { TicketGrid, Ticket } from "./ticket-generator";

const COLUMN_CAPACITIES = [9, 10, 10, 10, 10, 10, 10, 10, 11];
const COLUMN_RANGES = [
  { min: 1, max: 9 },
  { min: 10, max: 19 },
  { min: 20, max: 29 },
  { min: 30, max: 39 },
  { min: 40, max: 49 },
  { min: 50, max: 59 },
  { min: 60, max: 69 },
  { min: 70, max: 79 },
  { min: 80, max: 90 },
];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate a valid 6x9 matrix of column counts
function getValidSizeMatrix(): number[][] | null {
  // Try random matrix generation until we hit a valid one
  for (let attempt = 0; attempt < 5000; attempt++) {
    const matrix = Array(6).fill(null).map(() => Array(9).fill(1));
    const colRemaining = COLUMN_CAPACITIES.map(c => c - 6); // minus 1 per ticket
    
    // We need to add exactly 36 slots across the 6 tickets (since 9x6=54 are pre-filled, 90-54=36)
    // 6 tickets * 6 extra slots = 36
    let valid = true;
    for (let t = 0; t < 6; t++) {
      let ticketExtra = 6;
      let tries = 0;
      while (ticketExtra > 0 && tries < 100) {
        const colIdx = Math.floor(Math.random() * 9);
        if (matrix[t][colIdx] < 3 && colRemaining[colIdx] > 0) {
          matrix[t][colIdx]++;
          colRemaining[colIdx]--;
          ticketExtra--;
        }
        tries++;
      }
      if (ticketExtra > 0) {
        valid = false;
        break;
      }
    }
    
    if (valid && colRemaining.every(c => c === 0)) {
      return matrix;
    }
  }
  return null;
}

function attemptGenerateLayoutForCounts(colCounts: number[]): number[][] | null {
  const grid = [
    Array(9).fill(0),
    Array(9).fill(0),
    Array(9).fill(0),
  ];
  const rowSums = [0, 0, 0];

  function solve(colIdx: number): boolean {
    if (colIdx === 9) {
      return rowSums[0] === 5 && rowSums[1] === 5 && rowSums[2] === 5;
    }

    const needed = colCounts[colIdx];
    const combos: number[][] = [];
    if (needed === 1) combos.push([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    else if (needed === 2) combos.push([1, 1, 0], [1, 0, 1], [0, 1, 1]);
    else if (needed === 3) combos.push([1, 1, 1]);

    const shuffledCombos = shuffle(combos);

    for (const combo of shuffledCombos) {
      let valid = true;
      for (let r = 0; r < 3; r++) {
        if (combo[r] === 1 && rowSums[r] >= 5) {
          valid = false; break;
        }
      }

      if (valid) {
        for (let r = 0; r < 3; r++) {
          grid[r][colIdx] = combo[r];
          rowSums[r] += combo[r];
        }
        if (solve(colIdx + 1)) return true;
        for (let r = 0; r < 3; r++) {
          grid[r][colIdx] = 0;
          rowSums[r] -= combo[r];
        }
      }
    }
    return false;
  }

  if (solve(0)) return grid;
  return null;
}

export function generateFullSheetTickets(playerNamePrefix: string = "Player", startId: number = 1): Ticket[] {
  let sizeMatrix: number[][] | null = null;
  let layoutMatrices: (number[][] | null)[] = [];
  
  // Outer loop to retry if layout generation fails for the specific size matrix
  while (true) {
    sizeMatrix = getValidSizeMatrix();
    if (!sizeMatrix) continue;
    
    layoutMatrices = [];
    let success = true;
    for (let t = 0; t < 6; t++) {
      const layout = attemptGenerateLayoutForCounts(sizeMatrix[t]);
      if (!layout) {
        success = false;
        break;
      }
      layoutMatrices.push(layout);
    }
    if (success) break;
  }

  // Now we populate numbers precisely
  // Each column exactly once from 1-90
  const finalGrids: TicketGrid[] = Array(6).fill(null).map(() => [
    Array(9).fill(null), Array(9).fill(null), Array(9).fill(null)
  ]);

  for (let c = 0; c < 9; c++) {
    // Generate shuffled numbers for this column
    const range = COLUMN_RANGES[c];
    let nums = [];
    for (let i = range.min; i <= range.max; i++) nums.push(i);
    nums = shuffle(nums);

    for (let t = 0; t < 6; t++) {
      const gridLayout = layoutMatrices[t]!;
      let count = 0;
      for (let r = 0; r < 3; r++) if (gridLayout[r][c] === 1) count++;
      
      const allocatedNums = [];
      for (let i = 0; i < count; i++) allocatedNums.push(nums.pop()!);
      allocatedNums.sort((a, b) => a - b);
      
      let numIdx = 0;
      for (let r = 0; r < 3; r++) {
        if (gridLayout[r][c] === 1) {
          finalGrids[t][r][c] = allocatedNums[numIdx++];
        }
      }
    }
  }

  const tickets: Ticket[] = [];
  const ts = Date.now();
  for (let i = 0; i < 6; i++) {
    tickets.push({
      id: startId + i,
      playerName: `${playerNamePrefix}`,
      grid: finalGrids[i],
      timestamp: ts,
    });
  }

  return tickets;
}
