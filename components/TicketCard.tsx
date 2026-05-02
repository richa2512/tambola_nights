"use client";

import { motion } from "framer-motion";
import { Ticket } from "@/lib/ticket-generator";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticket: Ticket;
  calledNumbers?: Set<number>;
  interactive?: boolean;
  onNumberClick?: (num: number) => void;
}

export function TicketCard({ ticket, calledNumbers = new Set(), interactive = false, onNumberClick }: TicketCardProps) {
  return (
    <div className="bg-card w-full max-w-2xl border border-border shadow-sm rounded-xl overflow-hidden glass mix-blend-normal">
      <div className="bg-primary-600 dark:bg-primary-800 text-white p-3 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:justify-between min-[420px]:items-center border-b border-primary-700">
        <div className="min-w-0">
          <h3 className="font-bold tracking-wider uppercase text-base sm:text-lg leading-none">Tambola Housie</h3>
          <span className="text-xs text-primary-100 uppercase tracking-widest">{ticket.playerName}</span>
        </div>
        <div className="min-[420px]:text-right">
          <span className="text-sm font-mono bg-black/20 px-2 py-1 rounded inline-block">ID: {ticket.id}</span>
        </div>
      </div>
      
      <div className="p-2 sm:p-3">
        <div className="grid grid-cols-9 gap-1 sm:gap-1.5 md:gap-2">
          {ticket.grid.map((row, rIdx) => 
            row.map((cell, cIdx) => {
              const isCalled = cell !== null && calledNumbers.has(cell);
              
              return (
                <motion.div
                  key={`${rIdx}-${cIdx}`}
                  whileHover={interactive && cell !== null && !isCalled ? { scale: 1.05 } : {}}
                  whileTap={interactive && cell !== null && !isCalled ? { scale: 0.95 } : {}}
                  onClick={() => interactive && cell && onNumberClick?.(cell)}
                  className={cn(
                    "aspect-square min-w-0 flex items-center justify-center rounded-md sm:rounded-lg border text-sm min-[380px]:text-base sm:text-xl md:text-2xl font-bold transition-all",
                    cell === null 
                      ? "bg-secondary-50/50 dark:bg-slate-800/20 border-transparent" 
                      : "bg-white dark:bg-slate-900 border-border shadow-sm text-foreground",
                    isCalled && "bg-secondary-500 text-white border-secondary-500 shadow-secondary-500/20 scale-105 z-10 ring-2 ring-secondary-500/50",
                    interactive && cell !== null && !isCalled && "cursor-pointer hover:border-primary-500"
                  )}
                >
                  {cell !== null ? cell : ""}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
