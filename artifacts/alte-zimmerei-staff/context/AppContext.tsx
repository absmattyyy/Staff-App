import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/constants/api";
import type { User } from "@/types";

interface AppContextValue {
  user: User;
  isCheckedIn: boolean;
  checkInTime: string | undefined;
  isOnBreak: boolean;
  checkIn: () => void;
  checkOut: () => void;
  toggleBreak: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser, token } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | undefined>(undefined);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!token) {
      setIsCheckedIn(false);
      setCheckInTime(undefined);
      setIsOnBreak(false);
      return;
    }
    const today = getLocalDate();
    apiFetch(`/time-records?date=${today}`, { token }).then(async (res) => {
      if (!res.ok) return;
      const data: { date: string; bookings: { type: string; time: string }[] }[] = await res.json();
      const todayRecord = data.find((r) => r.date === today);
      if (!todayRecord) return;
      const bookings = todayRecord.bookings;
      const lastEntry = bookings[bookings.length - 1];
      if (!lastEntry) return;
      if (lastEntry.type === "checkin" || lastEntry.type === "break_end") {
        setIsCheckedIn(true);
        const checkin = bookings.find((b) => b.type === "checkin");
        if (checkin) setCheckInTime(checkin.time);
        setIsOnBreak(lastEntry.type === "break_end" ? false : false);
      } else if (lastEntry.type === "break_start") {
        setIsCheckedIn(true);
        const checkin = bookings.find((b) => b.type === "checkin");
        if (checkin) setCheckInTime(checkin.time);
        setIsOnBreak(true);
      } else if (lastEntry.type === "checkout") {
        setIsCheckedIn(false);
        setIsOnBreak(false);
      }
    }).catch(() => {});
  }, [token]);

  const getNow = () => {
    const now = new Date();

    return {
      time: now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", hour12: false }),
      date: getLocalDate(),
    };
  };

  const checkIn = useCallback(async () => {
    const { time, date } = getNow();
    setIsCheckedIn(true);
    setCheckInTime(time);
    setIsOnBreak(false);
    if (token) {
      apiFetch("/time-records", {
        method: "POST",
        body: JSON.stringify({ type: "checkin", time, date }),
        token,
      }).catch(() => {});
    }
  }, [token]);

  const checkOut = useCallback(async () => {
    const { time, date } = getNow();
    setIsCheckedIn(false);
    setCheckInTime(undefined);
    setIsOnBreak(false);
    if (token) {
      apiFetch("/time-records", {
        method: "POST",
        body: JSON.stringify({ type: "checkout", time, date }),
        token,
      }).catch(() => {});
    }
  }, [token]);

  const toggleBreak = useCallback(async () => {
    const { time, date } = getNow();
    setIsOnBreak((prev) => {
      const next = !prev;
      if (token) {
        apiFetch("/time-records", {
          method: "POST",
          body: JSON.stringify({ type: next ? "break_start" : "break_end", time, date }),
          token,
        }).catch(() => {});
      }
      return next;
    });
  }, [token]);

  const user: User = authUser ?? {
    id: "",
    name: "",
    firstName: "",
    lastName: "",
    role: "Mitarbeiter",
    email: "",
    joinedAt: "",
    isAdmin: false,
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isCheckedIn,
        checkInTime,
        isOnBreak,
        checkIn,
        checkOut,
        toggleBreak,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
