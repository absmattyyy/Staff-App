import type { TimeRecord, TimeBooking } from "@/types";

export const mockTimeRecords: TimeRecord[] = [
  {
    date: "2026-04-04",
    bookings: [
      {
        id: "b1",
        type: "checkin",
        time: "09:03",
        date: "2026-04-04",
      },
    ],
    totalMinutes: undefined,
    breakMinutes: 0,
  },
  {
    date: "2026-04-03",
    bookings: [
      {
        id: "b2",
        type: "checkin",
        time: "14:00",
        date: "2026-04-03",
      },
      {
        id: "b3",
        type: "break_start",
        time: "16:30",
        date: "2026-04-03",
      },
      {
        id: "b4",
        type: "break_end",
        time: "17:00",
        date: "2026-04-03",
      },
      {
        id: "b5",
        type: "checkout",
        time: "22:45",
        date: "2026-04-03",
      },
    ],
    totalMinutes: 525,
    breakMinutes: 30,
  },
  {
    date: "2026-04-02",
    bookings: [
      {
        id: "b6",
        type: "checkin",
        time: "10:00",
        date: "2026-04-02",
      },
      {
        id: "b7",
        type: "break_start",
        time: "13:00",
        date: "2026-04-02",
      },
      {
        id: "b8",
        type: "break_end",
        time: "13:30",
        date: "2026-04-02",
      },
      {
        id: "b9",
        type: "checkout",
        time: "18:05",
        date: "2026-04-02",
      },
    ],
    totalMinutes: 485,
    breakMinutes: 30,
  },
  {
    date: "2026-04-01",
    bookings: [
      {
        id: "b10",
        type: "checkin",
        time: "09:00",
        date: "2026-04-01",
      },
      {
        id: "b11",
        type: "break_start",
        time: "12:15",
        date: "2026-04-01",
      },
      {
        id: "b12",
        type: "break_end",
        time: "12:45",
        date: "2026-04-01",
      },
      {
        id: "b13",
        type: "checkout",
        time: "17:30",
        date: "2026-04-01",
      },
    ],
    totalMinutes: 510,
    breakMinutes: 30,
  },
  {
    date: "2026-03-31",
    bookings: [
      {
        id: "b14",
        type: "checkin",
        time: "18:00",
        date: "2026-03-31",
      },
      {
        id: "b15",
        type: "checkout",
        time: "23:30",
        date: "2026-03-31",
      },
    ],
    totalMinutes: 330,
    breakMinutes: 0,
  },
];

export const monthlyStats = {
  month: "April 2026",
  targetHours: 168,
  workedHours: 8.5,
  remainingHours: 159.5,
  overtimeHours: 0,
};
