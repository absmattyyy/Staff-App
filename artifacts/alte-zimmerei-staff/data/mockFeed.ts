import type { FeedPost } from "@/types";

export const mockFeedPosts: FeedPost[] = [
  {
    id: "p1",
    author: {
      id: "admin1",
      name: "Thomas Wagner",
      role: "Geschäftsführer",
    },
    content:
      "Herzlich willkommen in unserer neuen Mitarbeiter-App! 🎉 Hier findet ihr alle wichtigen Infos, euren Dienstplan und könnt Schichten tauschen. Wir freuen uns auf ein großartiges Jahr mit euch!",
    createdAt: "2026-04-04T09:00:00",
    category: "news",
    isPinned: true,
    isImportant: true,
    reactions: { like: 24, heart: 8, thumbsUp: 12 },
    commentsCount: 7,
  },
  {
    id: "p2",
    author: {
      id: "admin1",
      name: "Thomas Wagner",
      role: "Geschäftsführer",
    },
    content:
      "WICHTIG: Ab dem 10. April gilt die neue Pausenregelung. Jede Schicht über 6 Stunden beinhaltet eine Pflichtpause von 30 Minuten. Bitte tragt Pausen korrekt in der Zeiterfassung ein. Details findet ihr im internen Bereich.",
    createdAt: "2026-04-03T14:30:00",
    category: "news",
    isPinned: false,
    isImportant: true,
    reactions: { like: 18, heart: 2, thumbsUp: 15 },
    commentsCount: 3,
  },
  {
    id: "p3",
    author: {
      id: "u5",
      name: "Julia Becker",
      role: "Barmanagerin",
    },
    content:
      "Kleiner Hinweis für alle: Die neue Kaffeemaschine an der Bar ist jetzt vollständig eingerichtet. Schulungen finden diese Woche statt – bitte bei mir melden, wer Bedienungsunterlagen braucht!",
    createdAt: "2026-04-03T11:15:00",
    category: "general",
    isPinned: false,
    isImportant: false,
    reactions: { like: 11, heart: 4, thumbsUp: 6 },
    commentsCount: 5,
  },
  {
    id: "p4",
    author: {
      id: "admin2",
      name: "Sabine Krause",
      role: "Personalleitung",
    },
    content:
      "Dienstplan für April ist jetzt vollständig eingepflegt. Bitte prüft eure Schichten und meldet Unstimmigkeiten bis spätestens Sonntag, 6. April. Wir bitten um pünktliche Rückmeldung!",
    createdAt: "2026-04-02T16:45:00",
    category: "news",
    isPinned: false,
    isImportant: false,
    reactions: { like: 29, heart: 1, thumbsUp: 22 },
    commentsCount: 11,
  },
  {
    id: "p5",
    author: {
      id: "u7",
      name: "Max Hoffmann",
      role: "Servicemitarbeiter",
    },
    content:
      "Suche jemanden, der am Sa 12. April Schicht tauschen möchte. Ich biete dafür den So 13. April (gleiche Zeiten). Bei Interesse einfach melden oder den Schichttausch-Bereich nutzen!",
    createdAt: "2026-04-02T10:30:00",
    category: "general",
    isPinned: false,
    isImportant: false,
    reactions: { like: 3, heart: 0, thumbsUp: 2 },
    commentsCount: 4,
  },
  {
    id: "p6",
    author: {
      id: "admin1",
      name: "Thomas Wagner",
      role: "Geschäftsführer",
    },
    content:
      "Team-Meeting April findet statt am Dienstag, 8. April um 10:00 Uhr im großen Veranstaltungsraum. Themen: Saisonplanung, Personalstruktur und neue Abläufe an der Bar. Pflichttermin für alle Mitarbeiter!",
    createdAt: "2026-04-01T09:00:00",
    category: "news",
    isPinned: true,
    isImportant: false,
    reactions: { like: 33, heart: 5, thumbsUp: 28 },
    commentsCount: 9,
  },
  {
    id: "p7",
    author: {
      id: "u3",
      name: "Lena Fischer",
      role: "Küchenhilfe",
    },
    content:
      "Nachdem die letzte Hochzeitsveranstaltung so super geklappt hat – Glückwunsch an alle! Das Team war unglaublich. Danke für die tolle Zusammenarbeit!",
    createdAt: "2026-03-31T19:00:00",
    category: "general",
    isPinned: false,
    isImportant: false,
    reactions: { like: 42, heart: 15, thumbsUp: 37 },
    commentsCount: 14,
  },
  {
    id: "p8",
    author: {
      id: "admin2",
      name: "Sabine Krause",
      role: "Personalleitung",
    },
    content:
      "Erinnerung: Urlaubsanträge für Mai und Juni bitte bis zum 15. April einreichen. Anträge können über die App oder direkt per E-Mail gestellt werden.",
    createdAt: "2026-03-30T12:00:00",
    category: "news",
    isPinned: false,
    isImportant: false,
    reactions: { like: 16, heart: 0, thumbsUp: 14 },
    commentsCount: 2,
  },
  {
    id: "p_own1",
    author: {
      id: "u1",
      name: "Anna Müller",
      role: "Serviceleiterin",
    },
    content:
      "Kurze Info: Ich habe die Tischreservierungen für nächste Woche aktualisiert. Bitte schaut kurz rein, damit ihr einen Überblick habt.",
    createdAt: "2026-04-04T08:15:00",
    category: "general",
    isPinned: false,
    isImportant: false,
    reactions: { like: 3, heart: 0, thumbsUp: 2 },
    commentsCount: 0,
  },
];
