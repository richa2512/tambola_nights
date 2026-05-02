"use client";

import { useState } from "react";
import { useGameStore } from "@/store/useStore";
import { TicketCard } from "@/components/TicketCard";
import { validateClaim, ClaimType } from "@/lib/validation";
import { Search, Home, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PlayPage() {
  const { tickets, calledNumbers, gameId } = useGameStore();
  const [searchInput, setSearchInput] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<string | number | null>(null);
  
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);

  const activeTicket = tickets.find(t => t.id === activeTicketId);
  const calledSet = new Set(calledNumbers);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = tickets.find(t => t.id.toString().toLowerCase() === searchInput.toLowerCase());
    if (ticket) {
      setActiveTicketId(ticket.id);
      setSearchInput("");
      setValidationResult(null);
    } else {
      alert("Ticket not found!");
    }
  };

  const checkClaim = (type: ClaimType) => {
    if (!activeTicket) return;
    const result = validateClaim(type, activeTicket.grid, calledNumbers);
    setValidationResult(result);
    
    // Auto clear message after few seconds
    setTimeout(() => {
      setValidationResult(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen px-4 py-5 sm:p-6 md:p-8 max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full flex items-center justify-between gap-4 mb-8">
        <Link href="/" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <Home className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <div className="text-right">
          <h1 className="text-xl sm:text-2xl font-bold">Player View</h1>
          {gameId && <p className="text-xs sm:text-sm text-primary-600 font-mono break-all">Live Session: {gameId}</p>}
        </div>
      </div>

      {!activeTicketId ? (
        <form onSubmit={handleSearch} className="w-full max-w-md glass p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg border border-border text-center space-y-6 mt-6 sm:mt-10">
          <div className="inline-flex items-center justify-center p-4 bg-primary-100 text-primary-600 rounded-full mb-2">
             <Search className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Find Your Ticket</h2>
          <p className="text-slate-500">Enter your generated Ticket ID below to join the game.</p>
          
          <div className="space-y-4">
            <input 
              required
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. T-XYZ123"
              className="w-full p-4 text-center text-lg font-mono rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-background focus:border-primary-500 focus:ring-0 uppercase transition-colors"
            />
            <button 
              type="submit"
              className="w-full min-h-14 py-4 text-base sm:text-lg font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.02]"
            >
              Load Ticket
            </button>
          </div>
        </form>
      ) : activeTicket ? (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-border">
            <div className="min-w-0">
              <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Playing as</p>
              <h2 className="text-xl font-bold break-word">{activeTicket.playerName}</h2>
            </div>
            <button 
              onClick={() => setActiveTicketId(null)}
              className="min-h-11 px-4 py-2 text-sm font-medium border border-border rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Switch Ticket
            </button>
          </div>

          {validationResult && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
              validationResult.isValid 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' 
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400'
            }`}>
              {validationResult.isValid ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              <span className="font-semibold text-base sm:text-lg">{validationResult.message}</span>
            </div>
          )}

          <div className="flex justify-center w-full">
            <TicketCard 
              ticket={activeTicket} 
              calledNumbers={calledSet}
              interactive={true}
            />
          </div>

          <div className="glass p-6 rounded-2xl shadow-sm border border-border space-y-6">
            <div className="mb-2">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">💎 Exciting Game Variations</h3>
              <ul className="space-y-2 text-sm sm:text-base">
                <li>🔸 <b>Top Line – ₹500</b><br /><span className="text-slate-500">(Mark all 5 numbers in the 1st row on a single ticket)</span></li>
                <li>🔸 <b>Middle Line – ₹500</b><br /><span className="text-slate-500">(Mark all 5 numbers in the 2nd row on a single ticket)</span></li>
                <li>🔸 <b>Bottom Line – ₹500</b><br /><span className="text-slate-500">(Mark all 5 numbers in the 3rd row on a single ticket)</span></li>
                <li>🥐 <b>Breakfast – ₹500</b><br /><span className="text-slate-500">(All numbers from 1 to 30 marked on a single ticket)</span></li>
                <li>🍛 <b>Lunch – ₹500</b><br /><span className="text-slate-500">(All numbers from 31 to 60 marked on a single ticket)</span></li>
                <li>🍲 <b>Dinner – ₹500</b><br /><span className="text-slate-500">(All numbers from 61 to 90 marked on a single ticket)</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Claim Prize</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Early 5", type: "EARLY_5" },
                  { label: "Top Line", type: "TOP_LINE" },
                  { label: "Middle Line", type: "MIDDLE_LINE" },
                  { label: "Bottom Line", type: "BOTTOM_LINE" },
                  { label: "Corners", type: "CORNERS" },
                  { label: "Full House", type: "FULL_HOUSE" },
                  { label: "🥐 Breakfast", type: "BREAKFAST" },
                  { label: "🍛 Lunch", type: "LUNCH" },
                  { label: "🍲 Dinner", type: "DINNER" },
                ].map((claim) => (
                  <button
                    key={claim.type}
                    onClick={() => checkClaim(claim.type as ClaimType)}
                    className="min-h-12 p-3 font-semibold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600 dark:hover:bg-primary-950/50 dark:hover:border-primary-800 dark:hover:text-primary-400 transition-colors shadow-sm"
                  >
                    {claim.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
