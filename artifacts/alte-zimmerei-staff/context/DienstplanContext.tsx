import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/constants/api";
import type { Shift, Event, Unavailability } from "@/types";

interface DienstplanContextValue {
  shifts: Shift[];
  events: Event[];
  unavailabilities: Unavailability[];
  addEvent: (event: Omit<Event, "id" | "status">) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
  addUnavailability: (date: string, reason?: string) => void;
  removeUnavailability: (id: string) => void;
  myUnavailabilityDates: Set<string>;
  changedShifts: Shift[];
  dismissShiftChange: (shiftId: string) => void;
  dismissedChangeIds: Set<string>;
  transferShift: (shiftId: string) => void;
  refresh: () => Promise<void>;
}

const DienstplanContext = createContext<DienstplanContextValue | null>(null);

export function DienstplanProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [dismissedChangeIds, setDismissedChangeIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [shiftsRes, eventsRes] = await Promise.all([
        apiFetch("/shifts", { token }),
        apiFetch("/events", { token }),
      ]);
      if (shiftsRes.ok) {
        const data = await shiftsRes.json();
        setShifts(data);
      }
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(
          data.map((e: any) => ({
            id: e.id,
            name: e.name,
            date: e.date,
            startTime: e.startTime,
            endTime: e.endTime,
            location: e.location,
            description: e.description,
            djs: e.djs || [],
            staff: e.staff || [],
            flyerUri: e.flyerUri,
            status: e.status,
            protocol: e.protocol,
          }))
        );
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addEvent = useCallback(
    async (eventData: Omit<Event, "id" | "status">) => {
      if (!token) return;
      const res = await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify(eventData),
        token,
      });
      if (res.ok) {
        await loadData();
      }
    },
    [token, loadData]
  );

  const updateEvent = useCallback(
    async (id: string, updates: Partial<Event>) => {
      if (!token) return;
      const res = await apiFetch(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
        token,
      });
      if (res.ok) {
        await loadData();
      }
    },
    [token, loadData]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      if (!token) return;
      const res = await apiFetch(`/events/${id}`, {
        method: "DELETE",
        token,
      });
      if (res.ok || res.status === 204) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        setShifts((prev) => prev.filter((s) => s.eventId !== id));
      }
    },
    [token]
  );

  const getEventById = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  );

  const addUnavailability = useCallback(
    (date: string, reason?: string) => {
      if (!user) return;
      const entry: Unavailability = {
        id: `u_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        date,
        reason,
      };
      setUnavailabilities((prev) => [...prev, entry]);
    },
    [user]
  );

  const removeUnavailability = useCallback((id: string) => {
    setUnavailabilities((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const myUnavailabilityDates = new Set(
    unavailabilities
      .filter((u) => u.userId === user?.id)
      .map((u) => u.date)
  );

  const changedShifts = shifts.filter(
    (s) => s.isOwn && s.status === "changed" && !dismissedChangeIds.has(s.id)
  );

  const dismissShiftChange = useCallback((shiftId: string) => {
    setDismissedChangeIds((prev) => {
      const next = new Set(prev);
      next.add(shiftId);
      return next;
    });
  }, []);

  const transferShift = useCallback(
    async (shiftId: string) => {
      if (!token) return;
      await apiFetch(`/shifts/${shiftId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "open" }),
        token,
      }).catch(() => {});
      setShifts((prev) =>
        prev.map((s) => (s.id === shiftId ? { ...s, isOwn: false } : s))
      );
    },
    [token]
  );

  return (
    <DienstplanContext.Provider
      value={{
        shifts,
        events,
        unavailabilities,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        addUnavailability,
        removeUnavailability,
        myUnavailabilityDates,
        changedShifts,
        dismissShiftChange,
        dismissedChangeIds,
        transferShift,
        refresh: loadData,
      }}
    >
      {children}
    </DienstplanContext.Provider>
  );
}

export function useDienstplan(): DienstplanContextValue {
  const ctx = useContext(DienstplanContext);
  if (!ctx) throw new Error("useDienstplan must be used within DienstplanProvider");
  return ctx;
}
