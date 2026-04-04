import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockUser } from "@/data/mockUser";
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
  const [user] = useState<User>(mockUser);
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState<string | undefined>("09:03");
  const [isOnBreak, setIsOnBreak] = useState(false);

  const checkIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setIsCheckedIn(true);
    setCheckInTime(time);
    setIsOnBreak(false);
  };

  const checkOut = () => {
    setIsCheckedIn(false);
    setCheckInTime(undefined);
    setIsOnBreak(false);
  };

  const toggleBreak = () => {
    setIsOnBreak((prev) => !prev);
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
