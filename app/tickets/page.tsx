"use client";

import { useState } from "react";
import { generateTickets, Ticket } from "@/lib/ticket-generator";
import { generateFullSheetTickets } from "@/lib/sheet-generator";
import { TicketSheet } from "@/components/TicketSheet";
import { useGameStore } from "@/store/useStore";
import Papa from "papaparse";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Upload, Plus, Trash2, Home, Settings } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type TicketUploadRow = {
  "Player Name"?: string;
  Name?: string;
  "Number of tickets"?: string;
  Tickets?: string;
};

export default function TicketsPage() {
  const { tickets, addTickets, clearTickets, sessionConfig, startSession, endSession } = useGameStore();
  const [manualCount, setManualCount] = useState(1);
  const [playerName, setPlayerName] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  
  // Session Form State
  const [sessionForm, setSessionForm] = useState({
    gameTitle: "Real Diamond Housie",
    gameDate: new Date().toLocaleDateString('en-US'),
    issueDate: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    groupName: "Tambola Nights"
  });

  const handleGenerateManual = () => {
    if (manualCount < 1 || manualCount > 100) return;
    
    const newTickets: Ticket[] = [];
    const fullSheets = Math.floor(manualCount / 6);
    const remainder = manualCount % 6;
    let nextId = tickets.length + 1;

    for(let i=0; i<fullSheets; i++) {
        const sheet = generateFullSheetTickets(playerName || "Player", nextId);
        newTickets.push(...sheet);
        nextId += 6;
    }
    if (remainder > 0) {
        const excess = generateTickets(remainder, playerName || "Player", nextId);
        newTickets.push(...excess);
        nextId += remainder;
    }
    
    addTickets(newTickets);
    setPlayerName("");
    setManualCount(1);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const generated: Ticket[] = [];
        let nextId = tickets.length + 1;

        (results.data as TicketUploadRow[]).forEach((row) => {
          const name = row["Player Name"] || row["Name"] || "Unknown";
          const sheetsCount = parseInt(row["Number of tickets"] || row["Tickets"] || "1", 10);
          if (!isNaN(sheetsCount)) {
            const fullSheets = Math.floor(sheetsCount / 6);
            const remainder = sheetsCount % 6;
            
            for(let i=0; i<fullSheets; i++) {
              const sheet = generateFullSheetTickets(name, nextId);
              generated.push(...sheet);
              nextId += 6;
            }
            if (remainder > 0) {
              const excess = generateTickets(remainder, name, nextId);
              generated.push(...excess);
              nextId += remainder;
            }
          }
        });
        addTickets(generated);
      },
    });
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF("p", "pt", "a4");
      const ticketsContainer = document.getElementById("tickets-print-container");
      
      if (!ticketsContainer) return;
      
      const ticketElements = ticketsContainer.querySelectorAll(".ticket-wrapper");
      
      for (let i = 0; i < ticketElements.length; i++) {
        const el = ticketElements[i] as HTMLElement;
        const canvas = await html2canvas(el, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const margin = 40;
        const width = pdfWidth - margin * 2;
        const height = (imgProps.height * width) / imgProps.width;
        
        // A ticket sheet is approximately 800px wide. We scale it onto an A4
        const x = margin;
        const y = margin; // One full sheet per page

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", x, y, width, height);
      }
      
      pdf.save("tambola_tickets.pdf");
    } finally {
      setIsExporting(false);
    }
  };

  const groupedTickets = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.playerName]) acc[ticket.playerName] = [];
    acc[ticket.playerName].push(ticket);
    return acc;
  }, {} as Record<string, Ticket[]>);

  // If no session is active, render the setup form
  if (!sessionConfig?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-6">
        <form 
          onSubmit={(e) => { e.preventDefault(); startSession(sessionForm); }}
          className="glass p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-lg border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500" />
            <h1 className="text-2xl sm:text-3xl font-bold">Session Setup</h1>
          </div>
          <p className="text-slate-500 mb-6">Configure the exact credentials and titles to be printed on your generated tickets.</p>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-semibold mb-1">Game Title</label>
              <input required type="text" value={sessionForm.gameTitle} onChange={e => setSessionForm({...sessionForm, gameTitle: e.target.value})} className="w-full p-3 rounded-xl border border-border" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Group / Organization Name</label>
              <input required type="text" value={sessionForm.groupName} onChange={e => setSessionForm({...sessionForm, groupName: e.target.value})} className="w-full p-3 rounded-xl border border-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Issue Date Label</label>
                <input required type="text" value={sessionForm.issueDate} onChange={e => setSessionForm({...sessionForm, issueDate: e.target.value})} className="w-full p-3 rounded-xl border border-border" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Game Date Label</label>
                <input required type="text" value={sessionForm.gameDate} onChange={e => setSessionForm({...sessionForm, gameDate: e.target.value})} className="w-full p-3 rounded-xl border border-border" />
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full min-h-14 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-base sm:text-lg">
            Start Generating Tickets
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <Home className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Ticket Management</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-8">
        {/* Controls Panel */}
        <div className="xl:col-span-1 space-y-5 md:space-y-6">
          <div className="glass p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">Manual Generation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Player Name</label>
                <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full min-h-11 p-2 rounded-lg border border-border bg-background"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Number of Tickets</label>
              <input 
                type="number" 
                min="1" max="100"
                value={manualCount}
                onChange={(e) => setManualCount(parseInt(e.target.value) || 1)}
                className="w-full min-h-11 p-2 rounded-lg border border-border bg-background"
              />
            </div>
            <button 
              onClick={handleGenerateManual}
              className="w-full min-h-12 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" /> Generate Tickets
            </button>
          </div>
        </div>

        <div className="glass p-5 sm:p-6 rounded-2xl shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload</h2>
          <p className="text-sm text-slate-500 mb-4">Upload a CSV file with columns: `Player Name` and `Number of tickets`.</p>
            <label className="w-full min-h-32 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-5 sm:p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm font-medium">Click to upload CSV</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          
          {tickets.length > 0 && (
            <div className="glass p-5 sm:p-6 rounded-2xl shadow-sm border border-border space-y-4">
              <h2 className="text-xl font-semibold">Actions</h2>
              <button 
                onClick={exportPDF}
                disabled={isExporting}
                className="w-full min-h-12 flex items-center justify-center gap-2 bg-slate-800 text-white hover:bg-slate-900 p-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Download className="w-5 h-5" /> {isExporting ? "Exporting..." : "Export as PDF"}
              </button>
              
              <button 
                onClick={clearTickets}
                className="w-full min-h-12 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 p-3 rounded-lg font-medium transition-colors dark:border-red-900 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-5 h-5" /> Clear All Tickets
              </button>
              <button 
                onClick={endSession}
                className="w-full min-h-12 flex items-center justify-center gap-2 border border-orange-200 text-orange-600 hover:bg-orange-50 p-3 rounded-lg font-medium transition-colors dark:border-orange-900 dark:hover:bg-orange-900/20"
              >
                End Current Session
              </button>
            </div>
          )}
        </div>

        {/* Tickets Preview Panel */}
        <div className="xl:col-span-2 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Generated Tickets</h2>
            <div className="flex flex-wrap gap-2">
              <span className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-bold">
                {Object.keys(groupedTickets).length} Sheets
              </span>
              <span className="bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300 px-3 py-1 rounded-full text-sm font-bold">
                {tickets.length} Tickets
              </span>
            </div>
          </div>
          
          {tickets.length === 0 ?
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-2xl">
              <p className="text-slate-500">No tickets generated yet.</p>
            </div>
          : (
            <div className="flex flex-col gap-4 w-full pb-20">
              <AnimatePresence>
                {Object.entries(groupedTickets).map(([playerId, playerTickets]) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`chunk-${playerId}`} 
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
                  >
                    <div 
                      className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      onClick={() => setExpandedPlayer(expandedPlayer === playerId ? null : playerId)}
                    >
                      <div className="font-bold text-base sm:text-lg flex items-center gap-3 min-w-0">
                        <span className="text-slate-800 dark:text-slate-200 break-words">{playerId}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <span className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-semibold">
                          {playerTickets.length} Tickets
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium w-12 text-center text-sm">
                          {expandedPlayer === playerId ? "Hide" : "View"}
                        </span>
                      </div>
                    </div>
                    
                    {expandedPlayer === playerId && (
                      <div className="p-3 sm:p-5 md:p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20 flex flex-col items-center overflow-x-auto w-full">
                        <TicketSheet 
                          tickets={playerTickets} 
                          gameTitle={sessionConfig.gameTitle}
                          gameDate={sessionConfig.gameDate}
                          issueDate={sessionConfig.issueDate}
                          groupName={sessionConfig.groupName}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
