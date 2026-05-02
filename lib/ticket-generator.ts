export type TicketGrid = (number | null)[][];

export interface Ticket {
  id: string | number;
  playerName: string;
  grid: TicketGrid;
  timestamp: number;
}

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

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateTambolaTicket(): TicketGrid {
  let gridLayout: number[][] | null = null;

  // Keep trying until we get a valid layout
  while (!gridLayout) {
    gridLayout = attemptGenerateLayout();
  }

  // Populate numbers into the layout
  const grid: TicketGrid = [
    Array(9).fill(null),
    Array(9).fill(null),
    Array(9).fill(null),
  ];

  for (let col = 0; col < 9; col++) {
    // Count how many numbers are in this column
    let countInCol = 0;
    for (let row = 0; row < 3; row++) {
      if (gridLayout[row][col] === 1) countInCol++;
    }

    if (countInCol > 0) {
      // Pick unique numbers
      const range = COLUMN_RANGES[col];
      const numbers = new Set<number>();
      while (numbers.size < countInCol) {
        numbers.add(getRandomInt(range.min, range.max));
      }
      
      const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
      
      // Place them in the grid top to bottom
      let numIdx = 0;
      for (let row = 0; row < 3; row++) {
        if (gridLayout[row][col] === 1) {
          grid[row][col] = sortedNumbers[numIdx];
          numIdx++;
        }
      }
    }
  }

  return grid;
}

function attemptGenerateLayout(): number[][] | null {
  // Determine column counts
  const colCounts = Array(9).fill(1);
  let remaining = 6;
  
  while (remaining > 0) {
    const randomCol = Math.floor(Math.random() * 9);
    if (colCounts[randomCol] < 3) {
      colCounts[randomCol]++;
      remaining--;
    }
  }

  // Backtracking to assign to 3 rows
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
    
    // Generate all valid combinations of placing 'needed' ones in 3 slots
    const combos: number[][] = [];
    if (needed === 1) {
      combos.push([1, 0, 0], [0, 1, 0], [0, 0, 1]);
    } else if (needed === 2) {
      combos.push([1, 1, 0], [1, 0, 1], [0, 1, 1]);
    } else if (needed === 3) {
      combos.push([1, 1, 1]);
    }

    // Shuffle combos for more randomness
    const shuffledCombos = shuffle(combos);

    for (const combo of shuffledCombos) {
      // Check if this combo violates row constraints (max 5)
      let valid = true;
      for (let r = 0; r < 3; r++) {
        if (combo[r] === 1 && rowSums[r] >= 5) {
          valid = false;
          break;
        }
      }

      if (valid) {
        // Apply
        for (let r = 0; r < 3; r++) {
          grid[r][colIdx] = combo[r];
          rowSums[r] += combo[r];
        }

        if (solve(colIdx + 1)) return true;

        // Backtrack
        for (let r = 0; r < 3; r++) {
          grid[r][colIdx] = 0;
          rowSums[r] -= combo[r];
        }
      }
    }

    return false;
  }

  if (solve(0)) {
    return grid;
  }
  return null;
}

export function generateTicketId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'T-';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateTickets(count: number, playerNamePrefix: string = "Player", startId: number = 1): Ticket[] {
  const tickets: Ticket[] = [];
  for (let i = 0; i < count; i++) {
    tickets.push({
      id: startId + i,
      playerName: count === 1 ? playerNamePrefix : `${playerNamePrefix} ${i + 1}`,
      grid: generateTambolaTicket(),
      timestamp: Date.now(),
    });
  }
  return tickets;
}
