import type { MenuItem } from "@/types";

export const mockMenuItems: MenuItem[][] = [
  [
    {
      id: "profile",
      label: "Mein Profil",
      sublabel: "Persönliche Daten bearbeiten",
      icon: "user",
    },
    {
      id: "notifications",
      label: "Benachrichtigungen",
      sublabel: "Push & E-Mail Einstellungen",
      icon: "bell",
      badge: 3,
    },
  ],
  [
    {
      id: "meetings",
      label: "Meetings",
      sublabel: "Termine und Besprechungen",
      icon: "calendar",
    },
    {
      id: "availability",
      label: "Verfügbarkeiten",
      sublabel: "Wunschdaten & Sperrzeiten",
      icon: "clock",
    },
  ],
  [
    {
      id: "settings",
      label: "Einstellungen",
      sublabel: "App & Konto-Einstellungen",
      icon: "settings",
    },
    {
      id: "support",
      label: "Support & Feedback",
      sublabel: "Hilfe & Rückmeldungen",
      icon: "help-circle",
    },
  ],
  [
    {
      id: "logout",
      label: "Abmelden",
      icon: "log-out",
      danger: true,
    },
  ],
];
