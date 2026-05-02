"use client";

import { useRef, useState } from "react";
import { Ticket } from "@/lib/ticket-generator";
import html2canvas from "html2canvas";
import { Download, MessageCircle } from "lucide-react";


interface TicketSheetProps {
  tickets: Ticket[]; 
  gameTitle?: string;
  issueDate?: string;
  gameDate?: string;
  groupName?: string;
}

export function TicketSheet({ tickets, gameTitle, issueDate, gameDate, groupName }: TicketSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(sheetRef.current, { scale: 2, useCORS: true, backgroundColor: "#ff9a9e" });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Tambola-${tickets[0].playerName.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (e) {
      console.error(e);
      alert("Error generating download image.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!sheetRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(sheetRef.current, { scale: 2, useCORS: true, backgroundColor: "#ff9a9e" });
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        setIsExporting(false);
        return;
      }

      const safeName = tickets[0].playerName.replace(/\s+/g, "-");
      const fileName = `tambola_sheet_${safeName}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      // 1) Native Web Share API — works on mobile (iOS/Android) and lets user pick WhatsApp
      if (typeof navigator !== "undefined" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: gameTitle || "Tambola Game",
            text: "Here is your Tambola Sheet!",
            files: [file],
          });
          setIsExporting(false);
          return;
        } catch (err) {
          const error = err as Error;
          // User cancelled the share dialog — don't fall back
          if (error?.name === "AbortError") {
            setIsExporting(false);
            return;
          }
          console.error("Native share failed, falling back to download + WhatsApp link", err);
        }
      }

      // 2) Desktop / unsupported browsers fallback:
      //    Download the image, then open WhatsApp (web or installed app) with a prefilled message.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a short delay so the download has time to start
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      const message = `Here is your Tambola Sheet for ${tickets[0].playerName}! Please attach the just-downloaded image (${fileName}).`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      // window.open is more reliable than location.href and works in most browsers including in-app webviews
      const opened = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (!opened) {
        // Popup blocked — fall back to direct navigation
        window.location.href = waUrl;
      }
    } catch (e) {
      console.error(e);
      alert("Error generating image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!tickets || tickets.length === 0) return null;

  const player = tickets[0].playerName;
  const computedIssueDate = issueDate || new Date(tickets[0].timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const computedGameDate = gameDate || new Date().toLocaleDateString('en-US');
  const computedTitle = gameTitle || "TAMBOLA HOUSIE";
  const computedGroupName = groupName || "THE REAL VIRTUAL BINGO GROUP";

  // Group tickets into columns of 6
  const columns = [];
  for (let i = 0; i < tickets.length; i += 6) {
    columns.push(tickets.slice(i, i + 6));
  }

  const numCols = columns.length;
  // 380px per col + 24px gap (gap-x-6) + 48px padding (p-6)
  const minWidth = numCols * 380 + Math.max(0, numCols - 1) * 24 + 48;
  const containerWidth = Math.max(800, minWidth);

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex min-w-max flex-col gap-4 items-center px-1 sm:px-2">
        {/* The Action Buttons (hidden during printing/exporting inherently by html2canvas grabbing only the ref) */}
        {!isExporting && (
          <div className="flex flex-wrap justify-center gap-2 mb-2 no-print">
            <button 
              onClick={handleDownload} 
              className="min-h-11 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 shadow-sm font-medium"
            >
              <Download className="w-4 h-4" /> Download Sheet
            </button>
            <button 
              onClick={handleShare} 
              className="min-h-11 flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] shadow-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" /> Share via WhatsApp
            </button>
          </div>
        )}

        {/* The Actual Sheet to export */}
        <div 
          ref={sheetRef}
          className="m-0 p-4 md:p-6 text-[#1e293b] font-sans ticket-wrapper"
          style={{ backgroundColor: "#ff9a9e", width: `${containerWidth}px` }} 
        >
          {/* Header Section */}
          <div className="mb-6 font-mono text-sm tracking-tight text-[#3b3a32] flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-widest text-[#3b3a32] italic flex items-center gap-2 mb-2">
              🦄✨{computedTitle}✨🦄
            </h1>
            <p className="italic">Ticket Issued ON: <span className="font-semibold">{computedIssueDate}</span></p>
            <p className="italic">Game ON: <span className="font-semibold">{computedGameDate}</span></p>
            <p className="italic">Issued By : <span className="font-semibold">Admin</span></p>
            <p className="italic text-lg">Player Name : <span className="font-bold underline">{player}</span></p>
          </div>

          {/* Block of columns */}
          <div className="flex gap-x-6 w-max">
            {columns.map((columnTickets, cIdx) => (
              <div key={cIdx} className="flex flex-col gap-y-4 w-[380px]">
                {columnTickets.map((ticket, tIdx) => (
                  <div key={ticket.id} className="flex flex-col">
                    <div className="flex justify-between items-center px-1 mb-1 text-[10px] md:text-xs">
                      <span className="font-semibold italic text-[#334155] font-serif opacity-80 tracking-widest uppercase truncate max-w-[70%]">
                        ♔{computedGroupName}♔
                      </span>
                      <span className="font-bold font-mono text-[#1e293b] tracking-wider">
                        {ticket.id}
                      </span>
                    </div>
                    
                    <div className="bg-[#ffffff] border-[3px] border-[#000000] rounded-lg overflow-hidden flex">
                      {/* Grid Lines */}
                      <div className="flex-1 grid grid-cols-9 divide-x-[2px] divide-[#000000] border-r-[2px] border-[#000000]">
                        {Array.from({ length: 9 }).map((_, col) => (
                          <div key={col} className="grid grid-rows-3 divide-y-[2px] divide-[#000000]">
                            {Array.from({ length: 3 }).map((_, row) => {
                              const cell = ticket.grid[row][col];
                              return (
                                <div 
                                  key={row} 
                                  className="aspect-[4/5] flex items-center justify-center font-bold text-[16px] leading-none"
                                >
                                  {cell !== null ? cell : ""}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      {/* Row indices indicator on the right hand side */}
                      <div className="w-5 bg-[#ffe4e1] flex flex-col justify-around py-1 text-[10px] font-bold text-[#475569] font-mono text-center">
                        <div>{cIdx * 18 + tIdx * 3 + 1}</div>
                        <div>{cIdx * 18 + tIdx * 3 + 2}</div>
                        <div>{cIdx * 18 + tIdx * 3 + 3}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
