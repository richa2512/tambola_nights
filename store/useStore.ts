import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Ticket } from "@/lib/ticket-generator";
import { getFirebaseDb, getFirebaseInitError } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import type { DocumentData, DocumentSnapshot } from "firebase/firestore";

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
  hasHydrated: boolean;
  
  // Actions
  setHasHydrated: (hasHydrated: boolean) => void;
  initializeGame: () => void;
  callNumber: (num: number) => void;
  resetGame: () => void;
  addTickets: (tickets: Ticket[]) => void;
  clearTickets: () => void;
  deleteTicketsByPlayer: (playerName: string) => void;
  startSession: (config: Omit<SessionConfig, 'isActive'>) => void;
  endSession: () => void;
  restoreSession: (session: PastSession) => void;
  
  // Realtime Sync
  joinSession: (joinId: string) => Promise<boolean>;
  ensureRealtimeSubscription: (joinId?: string) => boolean;
  setRole: (role: 'admin' | 'sub-admin' | null) => void;
  unsubscribeSnapshot: (() => void) | null;
  subscribedGameId: string | null;
}

const pushToFirebase = (state: GameState) => {
  const db = getFirebaseDb();
  if (!state.role || !state.gameId || !db) return; // Allow both Admins & Co-Admins to actively drive the board Sync
  setDoc(doc(db, "sessions", state.gameId), {
    calledNumbers: state.calledNumbers,
    tickets: JSON.stringify(state.tickets), // Bypass Firestore 'Nested Arrays' strict limitation
    sessionConfig: state.sessionConfig,
    updatedAt: Date.now()
  }).catch(e => console.error("Firebase Sync Error", e));
};

const readSessionSnapshot = (docSnap: DocumentSnapshot<DocumentData>) => {
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  let parsedTickets: Ticket[] = [];

  if (data.tickets) {
    try {
      parsedTickets = typeof data.tickets === 'string' ? JSON.parse(data.tickets) : data.tickets;
    } catch (e) {
      console.error("Ticket sync parse error", e);
    }
  }

  return {
    calledNumbers: data.calledNumbers || [],
    tickets: parsedTickets,
    sessionConfig: data.sessionConfig || null,
  };
};

const canSyncRole = (role: GameState["role"]) => role === 'admin' || role === 'sub-admin';

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      gameId: null,
      calledNumbers: [],
      tickets: [],
      sessionConfig: null,
      role: null,
      pastSessions: [],
      hasHydrated: false,
      unsubscribeSnapshot: null,
      subscribedGameId: null,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      initializeGame: () => {
        const state = get();
        if (state.gameId || state.sessionConfig?.isActive) return;

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

      deleteTicketsByPlayer: (playerName) => {
        set((state) => ({ tickets: state.tickets.filter(t => t.playerName !== playerName) }));
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

        set({ sessionConfig: null, tickets: [], calledNumbers: [], gameId: null, role: null, unsubscribeSnapshot: null, subscribedGameId: null });
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

      ensureRealtimeSubscription: (joinId) => {
        const state = get();
        const sessionId = joinId || state.gameId;
        const db = getFirebaseDb();

        if (!db || !sessionId || !canSyncRole(state.role)) {
          return false;
        }

        if (state.unsubscribeSnapshot && state.subscribedGameId === sessionId) {
          return true;
        }

        if (state.unsubscribeSnapshot) {
          state.unsubscribeSnapshot();
        }

        const docRef = doc(db, "sessions", sessionId);
        const unsub = onSnapshot(docRef, (docSnap) => {
          const session = readSessionSnapshot(docSnap);

          if (!session) {
            set({
              sessionConfig: null,
              tickets: [],
              calledNumbers: [],
              gameId: sessionId,
            });
            return;
          }

          set({
            gameId: sessionId,
            ...session,
          });
        }, (e) => {
          console.error("Realtime session sync error", e);
        });

        set({ unsubscribeSnapshot: unsub, subscribedGameId: sessionId, gameId: sessionId });
        return true;
      },

      joinSession: async (joinId: string) => {
        const db = getFirebaseDb();
        if (!db) {
          const reason = getFirebaseInitError() || "Firebase is not initialised on this device.";
          alert(`Cannot join real-time session.\n\n${reason}`);
          return false;
        }

        try {
          const docRef = doc(db, "sessions", joinId);
          const snapshot = await getDoc(docRef);

          if (!snapshot.exists()) {
            return false; // Game not found
          }

          const session = readSessionSnapshot(snapshot);
          if (session) {
            set({ gameId: joinId, ...session, role: 'sub-admin' });
          } else {
            set({ gameId: joinId, role: 'sub-admin' });
          }

          return get().ensureRealtimeSubscription(joinId);
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
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);
