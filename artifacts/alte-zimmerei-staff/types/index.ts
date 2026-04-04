export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  avatar?: string;
  email: string;
  phone?: string;
  joinedAt: string;
  isAdmin: boolean;
}

export interface FeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  image?: string;
  createdAt: string;
  category: "news" | "general";
  isPinned: boolean;
  isImportant: boolean;
  reactions: {
    like: number;
    heart: number;
    thumbsUp: number;
    userReacted?: string;
  };
  commentsCount: number;
}

export type ShiftStatus = "confirmed" | "changed" | "open" | "cancelled";

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  eventName: string;
  role: string;
  location: string;
  status: ShiftStatus;
  isOwn: boolean;
  notes?: string;
}

export type BookingType = "checkin" | "checkout" | "break_start" | "break_end";

export interface TimeBooking {
  id: string;
  type: BookingType;
  time: string;
  date: string;
  note?: string;
}

export interface TimeRecord {
  date: string;
  bookings: TimeBooking[];
  totalMinutes?: number;
  breakMinutes?: number;
}

export type SwapStatus = "open" | "pending" | "approved" | "rejected";

export interface SwapRequest {
  id: string;
  shift: Shift;
  requestedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: SwapStatus;
  createdAt: string;
  note?: string;
  isOwn: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    role: string;
  };
  content: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  badge?: number;
  color?: string;
  danger?: boolean;
}
