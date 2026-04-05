import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seed: Prüfe Datenbank...");

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "inhaber@alte-zimmerei.de"))
    .limit(1);

  if (existing.length > 0) {
    console.log("Seed: Admin-Benutzer existiert bereits, überspringe.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("inhaber123", 10);

  await db.insert(usersTable).values({
    email: "inhaber@alte-zimmerei.de",
    passwordHash,
    firstName: "Admin",
    lastName: "Inhaber",
    role: "Inhaber",
    joinedAt: new Date().toISOString().slice(0, 10),
    isAdmin: true,
  });

  console.log("Seed: Admin-Benutzer erstellt.");
  console.log("  E-Mail: inhaber@alte-zimmerei.de");
  console.log("  Passwort: inhaber123");
  console.log("  Bitte Passwort nach dem ersten Login ändern!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed fehlgeschlagen:", err);
  process.exit(1);
});
