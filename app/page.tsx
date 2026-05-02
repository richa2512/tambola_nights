"use client";

import Link from "next/link";
import { Ticket, Mic2, Users, FileText, Download, Settings, PlayCircle, RotateCcw } from "lucide-react";
import { useGameStore } from "@/store/useStore";
import { isFirebaseReady, getFirebaseInitError } from "@/lib/firebase";
import { useState } from "react";

export default function Home() {
  const { sessionConfig, startSession, endSession, tickets, pastSessions, restoreSession, gameId } = useGameStore();
  
  const [sessionForm, setSessionForm] = useState({
    gameTitle: "Real Diamond Housie",
    gameDate: new Date().toLocaleDateString('en-US'),
    issueDate: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    groupName: "Tambola Nights"
  });
  
  const [activeTab, setActiveTab] = useState<'host' | 'join'>('host');
  const [joinId, setJoinId] = useState("");
  const [joinError, setJoinError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    setJoinError("");

    if (!isFirebaseReady()) {
      const reason = getFirebaseInitError() || "Firebase is not configured on this build.";
      setJoinError(reason);
      return;
    }

    const success = await useGameStore.getState().joinSession(joinId.trim());
    if (!success) {
      setJoinError(`Game "${joinId.trim()}" was not found. Double-check the join code with the host.`);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 md:px-10 lg:px-16 flex flex-col items-center justify-center relative overflow-x-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-none">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-500/20 blur-[100px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-3xl text-center glass p-5 sm:p-7 md:p-10 lg:p-12 rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary-500/10 rounded-2xl mb-5 sm:mb-6 shadow-inner">
          <Ticket className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 transform -rotate-12" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 bg-gradient-to-br from-primary-600 to-secondary-500 text-transparent bg-clip-text drop-shadow-sm">
          Tambola Housie
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 md:mb-12 font-medium leading-relaxed max-w-2xl mx-auto">
          The ultimate platform to host, manage, and play Tambola. Generate beautiful tickets, validate claims instantly, and host live games with a modern interface.
        </p>

        {!sessionConfig?.isActive ? (
          <div className="bg-white/50 dark:bg-slate-900/50 rounded-2xl sm:rounded-3xl border border-border shadow-inner text-left max-w-xl mx-auto mb-8 transition-all overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x border-b border-border text-center font-bold">
              <button 
                onClick={() => setActiveTab('host')} 
                className={`min-h-14 px-3 py-3 sm:py-4 flex items-center justify-center gap-2 text-sm sm:text-base ${activeTab === 'host' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Settings className="w-5 h-5" /> Host Global Game
              </button>
              <button 
                onClick={() => setActiveTab('join')}
                className={`min-h-14 px-3 py-3 sm:py-4 flex items-center justify-center gap-2 text-sm sm:text-base border-t sm:border-t-0 border-border ${activeTab === 'join' ? 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <Users className="w-5 h-5" /> Join as Sub-Admin
              </button>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8">
              {activeTab === 'host' ? (
                <form onSubmit={(e) => { e.preventDefault(); startSession(sessionForm); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Game Title</label>
                    <input required type="text" value={sessionForm.gameTitle} onChange={e => setSessionForm({...sessionForm, gameTitle: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Group / Organization Name</label>
                    <input required type="text" value={sessionForm.groupName} onChange={e => setSessionForm({...sessionForm, groupName: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Issue Date</label>
                      <input required type="text" value={sessionForm.issueDate} onChange={e => setSessionForm({...sessionForm, issueDate: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Game Date</label>
                      <input required type="text" value={sessionForm.gameDate} onChange={e => setSessionForm({...sessionForm, gameDate: e.target.value})} className="w-full p-3 rounded-xl border border-border bg-background" />
                    </div>
                  </div>
                  <button type="submit" className="w-full min-h-14 py-4 mt-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                    <PlayCircle className="w-6 h-6" /> Start Empty Session Now
                  </button>
                </form>
              ) : (
                <form onSubmit={handleJoin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Global Game ID</label>
                    <input required type="text" placeholder="GAME-XXXX" value={joinId} onChange={e => setJoinId(e.target.value)} className="w-full p-3 rounded-xl border border-border bg-background text-center text-lg font-mono tracking-widest uppercase" />
                  </div>
                  {joinError && <p className="text-red-500 text-sm font-semibold text-center">{joinError}</p>}
                  <button type="submit" className="w-full min-h-14 py-4 mt-6 bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                    <Mic2 className="w-6 h-6" /> Sync to Host Session
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl mb-8 w-full max-w-xl backdrop-blur-md">
              <h2 className="text-emerald-700 dark:text-emerald-400 font-bold text-lg mb-2 flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Active Session Running
              </h2>
              <p className="font-mono font-medium text-sm sm:text-base text-slate-700 dark:text-slate-300 break-words">{sessionConfig.gameTitle} {gameId}</p>
              <p className="text-sm text-slate-500 mt-2">{tickets.length} Tickets Generated</p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-xs rounded-full uppercase tracking-widest shadow-inner">
                 Join Code: {gameId}
              </div>
              
              <button onClick={endSession} className="mt-4 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-colors">
                End Session
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
              <Link href="/host" className="group relative w-full min-h-14 flex justify-center py-4 px-4 border border-transparent text-base lg:text-lg font-bold rounded-2xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg shadow-primary-500/30 transition-all overflow-hidden hover:scale-[1.02]">
                <span className="relative flex items-center gap-2">
                  <Mic2 className="w-5 h-5" />
                  Host Live Game
                </span>
              </Link>
              
              <Link href="/play" className="group relative w-full min-h-14 flex justify-center py-4 px-4 border border-transparent text-base lg:text-lg font-bold rounded-2xl text-white bg-secondary-500 hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 shadow-lg shadow-secondary-500/30 transition-all overflow-hidden hover:scale-[1.02]">
                <span className="relative flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Join Game
                </span>
              </Link>

              <Link href="/tickets" className="group relative w-full min-h-14 flex justify-center py-4 px-4 border-2 border-slate-200 dark:border-slate-700 text-base lg:text-lg font-bold rounded-2xl text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-primary-500/50">
                <span className="relative flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Manage Tickets
                </span>
              </Link>
            </div>
          </div>
        )}
        
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200/50 dark:border-slate-800/50 grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-primary-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Strict Rules</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-secondary-500">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Bulk Assign</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-emerald-500">
              <Download className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">PDF Export</span>
          </div>
        </div>

        {pastSessions && pastSessions.length > 0 && !sessionConfig?.isActive && (
          <div className="w-full mt-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left shadow-inner">
            <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-slate-500" />
              History Vault
            </h3>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto custom-scrollbar">
              {pastSessions.map((ps, i) => (
                <div key={ps.gameId + i} className="flex flex-col md:flex-row justify-between md:items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-xs font-bold font-mono tracking-widest text-slate-400 uppercase bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded inline-block mb-1">{ps.gameId}</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{ps.sessionConfig.gameTitle}</p>
                    <p className="text-xs text-slate-500">{ps.tickets?.length || 0} Tickets • {ps.calledNumbers?.length || 0} Numbers Called</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm("Restore this session? Your current empty session will be replaced.")) {
                        restoreSession(ps);
                      }
                    }}
                    className="mt-3 md:mt-0 px-4 py-2 border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-bold text-sm rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    Restore Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <Link href="/privacy" className="hover:text-primary-600">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-primary-600">
            Terms
          </Link>
        </div>
      </div>
    </main>
  );
}
