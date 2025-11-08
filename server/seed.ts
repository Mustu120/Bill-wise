import { db } from "./db";
import { users } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

async function seedAdminUser() {
  const adminEmail = "admin123@gmail.com";
  const adminPassword = "@Admin1212";
  
  try {
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists!");
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);

    await db.insert(users).values({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✓ Admin user created successfully!");
    console.log(`  Email: ${adminEmail}`);
    console.log("  You can now log in with these credentials.");
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }
}

seedAdminUser()
  .then(() => {
    console.log("Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
