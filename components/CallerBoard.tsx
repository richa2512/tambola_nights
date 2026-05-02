import { cn } from "@/lib/utils";

interface CallerBoardProps {
  calledNumbers: number[];
}

export function CallerBoard({ calledNumbers }: CallerBoardProps) {
  const calledSet = new Set(calledNumbers);

  return (
    <div className="glass p-3 sm:p-4 rounded-xl border border-border shadow-md">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Master Board</h3>
        <p className="text-xs text-slate-500">Numbers called: {calledNumbers.length} / 90</p>
      </div>
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 md:gap-2">
        {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
          const isCalled = calledSet.has(num);
          const isLastCalled = calledNumbers[0] === num;
          
          return (
            <div
              key={num}
              className={cn(
                "relative aspect-square min-w-0 flex items-center justify-center rounded sm:rounded-md md:rounded-lg text-[11px] min-[380px]:text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-all duration-300",
                isCalled 
                  ? "bg-secondary-500 text-white shadow-sm" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600",
                isLastCalled && "bg-primary-500 ring-4 ring-primary-500/30 scale-110 z-10 animate-pulse"
              )}
            >
              {num}
              {isLastCalled && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500"></span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
