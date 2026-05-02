"use client";

import { useEffect, useState, useRef } from "react";
import { useGameStore } from "@/store/useStore";
import { CallerBoard } from "@/components/CallerBoard";
import { Mic2, Play, Square, RotateCcw, Volume2, VolumeX, Home } from "lucide-react";
import Link from "next/link";
import { Howl } from 'howler';

const callSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], // Generic pop sound
  volume: 0.5,
});

export default function HostPage() {
  const { gameId, initializeGame, resetGame, calledNumbers, callNumber, role } = useGameStore();
  const [isAutoCalling, setIsAutoCalling] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!gameId) {
      initializeGame();
    }
  }, [gameId, initializeGame]);

  const drawRandomNumber = () => {
    if (calledNumbers.length >= 90) {
      if (isAutoCalling) toggleAutoCall();
      return;
    }
    
    let randomNum;
    do {
      randomNum = Math.floor(Math.random() * 90) + 1;
    } while (calledNumbers.includes(randomNum));
    
    if (soundEnabled) {
      callSound.play();
    }
    
    callNumber(randomNum);
  };

  const toggleAutoCall = () => {
    if (isAutoCalling) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsAutoCalling(false);
    } else {
      setIsAutoCalling(true);
      drawRandomNumber();
      timerRef.current = setInterval(() => {
        drawRandomNumber();
      }, 5000); // 5 second timer
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const lastCalledItem = calledNumbers[0];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             <Home className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic2 className="w-8 h-8 text-primary-500" /> Caller Panel
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {role === 'sub-admin' && (
             <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-amber-200 dark:border-amber-800 flex items-center gap-1">
               <span className="relative flex h-2 w-2 mr-1">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
               </span>
               Co-Admin Control
             </span>
          )}
          <span className="bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-full font-mono text-sm font-bold shadow-inner">
            {gameId ? `Game: ${gameId}` : "Initializing..."}
          </span>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
        {/* Active Number Display & Controls */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <div className="glass flex-grow p-8 rounded-3xl shadow-sm border border-border flex flex-col items-center justify-center relative overflow-hidden">
            {/* Soft backdrop blur effect for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-500/5 blur-[80px] pointer-events-none" />
            
            <h2 className="text-lg font-medium text-slate-500 mb-4 z-10">Current Number</h2>
            
            <div className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-900 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center mb-8">
              {lastCalledItem ? (
                <span className="text-8xl font-black text-slate-800 dark:text-white animate-in zoom-in spin-in-12 duration-500">
                  {lastCalledItem}
                </span>
              ) : (
                <span className="text-6xl font-bold text-slate-300 dark:text-slate-600">--</span>
              )}
            </div>

            <div className="w-full space-y-3 z-10">
              <button 
                onClick={drawRandomNumber}
                disabled={isAutoCalling || calledNumbers.length >= 90}
                className="w-full py-4 text-xl font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                Call Next Number
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={toggleAutoCall}
                  disabled={calledNumbers.length >= 90}
                  className={`flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all ${
                    isAutoCalling 
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {isAutoCalling ? <><Square className="w-5 h-5" /> Stop Auto</> : <><Play className="w-5 h-5" /> Auto Call</>}
                </button>
                
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset the game?")) {
                      if (isAutoCalling) toggleAutoCall();
                      resetGame();
                      initializeGame();
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-3 font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900"
                >
                  <RotateCcw className="w-5 h-5" /> Reset Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Master Board */}
        <div className="lg:col-span-2">
          <CallerBoard calledNumbers={calledNumbers} />
          
          {/* Recent Called List */}
          {calledNumbers.length > 0 && (
            <div className="mt-6 flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              <span className="text-sm font-semibold flex items-center text-slate-500 shrink-0 mr-2">Recent:</span>
              {calledNumbers.slice(0, 10).map((num, idx) => (
                <div 
                  key={`${num}-${idx}`} 
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 
                      ? "bg-primary-500 text-white ring-2 ring-primary-500/50 ring-offset-2 dark:ring-offset-slate-950" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
