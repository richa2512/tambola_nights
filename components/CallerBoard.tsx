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
      <div className="w-full overflow-x-auto pb-1">
        <div className="mx-auto grid w-[600px] max-w-none grid-cols-10 gap-px border border-slate-500 bg-slate-500 p-px">
          {Array.from({ length: 90 }, (_, i) => i + 1).map((num) => {
            const isCalled = calledSet.has(num);
            const isLastCalled = calledNumbers[0] === num;
            
            return (
              <div
                key={num}
                className={cn(
                  "aspect-square min-w-0 flex items-center justify-center rounded-none text-[38px] leading-none font-normal tabular-nums transition-colors",
                  isCalled 
                    ? "bg-[#064fe8] text-white" 
                    : "bg-[#f5f4ee] text-slate-500",
                  isLastCalled && "bg-[#d9001b] text-white"
                )}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
