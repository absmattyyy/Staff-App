import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { mockShifts } from "@/data/mockShifts";
import { mockEvents } from "@/data/mockEvents";
import { mockUser } from "@/data/mockUser";
import type { Shift, Event, Unavailability } from "@/types";

interface DienstplanContextValue {
  shifts: Shift[];
  events: Event[];
  unavailabilities: Unavailability[];
  addEvent: (event: Omit<Event, "id" | "status">) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  addUnavailability: (date: string, reason?: string) => void;
  removeUnavailability: (id: string) => void;
  myUnavailabilityDates: Set<string>;
  changedShifts: Shift[];
  dismissShiftChange: (shiftId: string) => void;
  dismissedChangeIds: Set<string>;
  transferShift: (shiftId: string) => void;
}

const DienstplanContext = createContext<DienstplanContextValue | null>(null);

export function DienstplanProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [dismissedChangeIds, setDismissedChangeIds] = useState<Set<string>>(new Set());

  const addEvent = useCallback((eventData: Omit<Event, "id" | "status">) => {
    const newEvent: Event = {
      ...eventData,
      id: `e_${Date.now()}`,
      status: "upcoming",
    };
    setEvents((prev) => [newEvent, ...prev].sort((a, b) => a.date.localeCompare(b.date)));

    const newShifts: Shift[] = eventData.staff.map((member, idx) => ({
      id: `s_${Date.now()}_${idx}`,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      eventName: eventData.name,
      eventId: newEvent.id,
      role: member.role,
      location: eventData.location,
      status: "confirmed",
      isOwn: member.id === mockUser.id,
    }));
    setShifts((prev) => [...prev, ...newShifts]);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setShifts((prev) => prev.filter((s) => s.eventId !== id));
  }, []);

  const getEventById = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  );

  const addUnavailability = useCallback((date: string, reason?: string) => {
    const entry: Unavailability = {
      id: `u_${Date.now()}`,
      userId: mockUser.id,
      userName: mockUser.name,
      date,
      reason,
    };
    setUnavailabilities((prev) => [...prev, entry]);
  }, []);

  const removeUnavailability = useCallback((id: string) => {
    setUnavailabilities((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const myUnavailabilityDates = new Set(
    unavailabilities
      .filter((u) => u.userId === mockUser.id)
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

  const transferShift = useCallback((shiftId: string) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, isOwn: false } : s))
    );
  }, []);

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
