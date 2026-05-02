import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Ticket } from "@/lib/ticket-generator";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

export interface SessionConfig {
  isActive: boolean;
  gameTitle: string;
  gameDate: string;
  issueDate: string;
  groupName: string;
}

export interface PastSession {
  gameId: string;
  calledNumbers: number[];
  tickets: Ticket[];
  sessionConfig: SessionConfig;
  endedAt: number;
}

interface GameState {
  gameId: string | null;
  calledNumbers: number[];
  tickets: Ticket[];
  sessionConfig: SessionConfig | null;
  role: 'admin' | 'sub-admin' | null;
  pastSessions: PastSession[];
  
  // Actions
  initializeGame: () => void;
  callNumber: (num: number) => void;
  resetGame: () => void;
  addTickets: (tickets: Ticket[]) => void;
  clearTickets: () => void;
  startSession: (config: Omit<SessionConfig, 'isActive'>) => void;
  endSession: () => void;
  restoreSession: (session: PastSession) => void;
  
  // Realtime Sync
  joinSession: (joinId: string) => Promise<boolean>;
  setRole: (role: 'admin' | 'sub-admin' | null) => void;
  unsubscribeSnapshot: (() => void) | null;
}

const pushToFirebase = (state: GameState) => {
  if (!state.role || !state.gameId || !db) return; // Allow both Admins & Co-Admins to actively drive the board Sync
  setDoc(doc(db, "sessions", state.gameId), {
    calledNumbers: state.calledNumbers,
    tickets: JSON.stringify(state.tickets), // Bypass Firestore 'Nested Arrays' strict limitation
    sessionConfig: state.sessionConfig,
    updatedAt: Date.now()
  }).catch(e => console.error("Firebase Sync Error", e));
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gameId: null,
      calledNumbers: [],
      tickets: [],
      sessionConfig: null,
      role: null,
      pastSessions: [],
      unsubscribeSnapshot: null,

      initializeGame: () => {
        const newGameId = `GAME-${Math.floor(Math.random() * 10000)}`;
        set({ gameId: newGameId, calledNumbers: [] });
        pushToFirebase(get());
      },
      
      callNumber: (num: number) => {
        const state = get();
        const updated = state.calledNumbers.includes(num) 
          ? state.calledNumbers 
          : [num, ...state.calledNumbers];
          
        set({ calledNumbers: updated });
        pushToFirebase(get()); // Broadcast to everyone
      },

      resetGame: () => {
        set({ calledNumbers: [], gameId: null });
        pushToFirebase(get());
      },

      addTickets: (newTickets) => {
        set((state) => ({ tickets: [...state.tickets, ...newTickets] }));
        pushToFirebase(get());
      },

      clearTickets: () => {
        set({ tickets: [] });
        pushToFirebase(get());
      },

      startSession: (config) => {
        const newGameId = get().gameId || `GAME-${Math.floor(Math.random() * 10000)}`;
        set({
          sessionConfig: { ...config, isActive: true },
          gameId: newGameId,
          role: 'admin'
        });
        pushToFirebase(get());
      },
      
      endSession: () => {
        const state = get();
        if (state.unsubscribeSnapshot) state.unsubscribeSnapshot();
        
        // Vault it
        if (state.gameId && state.sessionConfig) {
          const archivedSession: PastSession = {
            gameId: state.gameId,
            calledNumbers: [...state.calledNumbers],
            tickets: [...state.tickets],
            sessionConfig: { ...state.sessionConfig, isActive: false },
            endedAt: Date.now()
          };
          set(s => ({ pastSessions: [archivedSession, ...s.pastSessions] }));
        }

        set({ sessionConfig: null, tickets: [], calledNumbers: [], gameId: null, role: null, unsubscribeSnapshot: null });
      },

      restoreSession: (session: PastSession) => {
        set({
          gameId: session.gameId,
          sessionConfig: { ...session.sessionConfig, isActive: true },
          tickets: [...session.tickets],
          calledNumbers: [...session.calledNumbers],
          role: 'admin'
        });
        pushToFirebase(get()); // Wake up the server
      },

      setRole: (role) => set({ role }),

      joinSession: async (joinId: string) => {
        if (!db) {
          alert("Firebase is not connected! Unable to join real-time sessions.");
          return false;
        }
        
        try {
          const docRef = doc(db, "sessions", joinId);
          const snapshot = await getDoc(docRef);
          
          if (!snapshot.exists()) {
            return false; // Game not found
          }

          // Sub-Admin Snapshot Setup
          const unsub = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              let parsedTickets = [];
              if (data.tickets) {
                 parsedTickets = typeof data.tickets === 'string' ? JSON.parse(data.tickets) : data.tickets;
              }
              set({
                gameId: joinId,
                calledNumbers: data.calledNumbers || [],
                tickets: parsedTickets,
                sessionConfig: data.sessionConfig || null,
                role: 'sub-admin'
              });
            }
          });

          const prevUnsub = get().unsubscribeSnapshot;
          if (prevUnsub) prevUnsub();

          set({ unsubscribeSnapshot: unsub, role: 'sub-admin', gameId: joinId });
          return true;
        } catch (e) {
          console.error("Join session error", e);
          return false;
        }
      }
    }),
    {
      name: "tambola-storage",
      partialize: (state) => ({ 
        gameId: state.gameId, 
        calledNumbers: state.calledNumbers, 
        tickets: state.tickets, 
        sessionConfig: state.sessionConfig,
        role: state.role,
        pastSessions: state.pastSessions
      }) 
    }
  )
);
