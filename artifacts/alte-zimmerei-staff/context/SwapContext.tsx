import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import type { SwapRequest, Shift } from "@/types";

interface SwapContextValue {
  swaps: SwapRequest[];
  addSwapRequest: (shift: Shift, note?: string) => void;
  offerTakeOver: (swapId: string) => void;
  approveSwap: (swapId: string) => Shift | null;
  rejectSwap: (swapId: string) => void;
}

const SwapContext = createContext<SwapContextValue | null>(null);

export function SwapProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);

  const addSwapRequest = useCallback(
    (shift: Shift, note?: string) => {
      if (!user) return;
      const newSwap: SwapRequest = {
        id: `sw_${Date.now()}`,
        shift,
        requestedBy: { id: user.id, name: user.name },
        status: "open",
        createdAt: new Date().toISOString(),
        note,
        isOwn: true,
      };
      setSwaps((prev) => [newSwap, ...prev]);
    },
    [user]
  );

  const offerTakeOver = useCallback((swapId: string) => {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId ? { ...s, status: "pending" as const } : s
      )
    );
  }, []);

  const approveSwap = useCallback(
    (swapId: string): Shift | null => {
      const swap = swaps.find((s) => s.id === swapId);
      setSwaps((prev) =>
        prev.map((s) =>
          s.id === swapId ? { ...s, status: "approved" as const } : s
        )
      );
      return swap?.shift ?? null;
    },
    [swaps]
  );

  const rejectSwap = useCallback((swapId: string) => {
    setSwaps((prev) =>
      prev.map((s) =>
        s.id === swapId ? { ...s, status: "rejected" as const } : s
      )
    );
  }, []);

  return (
    <SwapContext.Provider
      value={{ swaps, addSwapRequest, offerTakeOver, approveSwap, rejectSwap }}
    >
      {children}
    </SwapContext.Provider>
  );
}

export function useSwaps(): SwapContextValue {
  const ctx = useContext(SwapContext);
  if (!ctx) throw new Error("useSwaps must be used within SwapProvider");
  return ctx;
}
