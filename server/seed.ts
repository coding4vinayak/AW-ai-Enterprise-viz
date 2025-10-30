import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function seedDatabase() {
  console.log('Seeding database...');
  const startTime = Date.now();

  try {
    // Create timeout promise (increased to 30s for production data)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Seed timeout after 30s')), 30000);
    });

    // Actual seeding logic
    const seedPromise = (async () => {
      // Quick database connection test first
      const { db } = await import("./db");
      await db.execute('SELECT 1');
      console.log("Database connection verified");

      // Check if super admin already exists
      console.log('Checking for existing super admin...');
      const existingSuperAdmin = await storage.getUsers({ role: 'super_admin' });
      if (existingSuperAdmin.length > 0) {
        console.log('Super admin already exists, skipping seed...');
        return;
      }
      console.log('No super admin found, proceeding with seed...');

      // Create default customer
      console.log('Creating default customer...');
      const defaultCustomer = await storage.createCustomer({
        name: "Default Organization",
        slug: "default",
        status: "active",
        branding: null,
        settings: null,
      });
      console.log("Created default customer:", defaultCustomer.name);

      // Create admin user
      console.log('Creating super admin user...');
      const hashedPassword = await hashPassword('admin123');
      const adminUser = await storage.createUser({
        customerId: defaultCustomer.id,
        email: "admin@example.com",
        username: "admin",
        password: hashedPassword,
        role: "super_admin",
        firstName: "Admin",
        lastName: "User",
        status: "active",
      });
      console.log("Created admin user:", adminUser.email);

      // Create default LLM providers
      console.log("Creating default LLM providers...");
      const openAIProvider = await storage.createLlmProvider({
        name: "OpenAI",
        type: "openai",
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4",
        isActive: true,
      });
      console.log("Created OpenAI provider");

      const anthropicProvider = await storage.createLlmProvider({
        name: "Anthropic",
        type: "anthropic",
        baseUrl: "https://api.anthropic.com/v1",
        defaultModel: "claude-3-5-sonnet-20241022",
        isActive: true,
      });
      console.log("Created Anthropic provider");

      const openAICompatibleProvider = await storage.createLlmProvider({
        name: "OpenAI Compatible",
        type: "openai-compatible",
        baseUrl: null,
        defaultModel: null,
        isActive: true,
      });
      console.log("Created OpenAI Compatible provider");

      // Create default LLM config for the default customer
      // Note: No API key provided - users should configure this themselves
      console.log("Creating default LLM config for customer...");
      const defaultConfig = await storage.createCustomerLlmConfig({
        customerId: defaultCustomer.id,
        providerId: openAIProvider.id,
        apiKey: process.env.OPENAI_API_KEY || "",
        model: "gpt-4",
        settings: null,
        isDefault: true,
      });
      console.log("Created default LLM config for customer");

      console.log("Database seeding completed!");
      console.log("\nDefault login credentials:");
      console.log("Email: admin@example.com");
      console.log("Password: admin123");
      console.log("\nNote: Configure LLM API keys in the admin panel for AI features");
    })();

    // Race the seed promise against the timeout
    await Promise.race([seedPromise, timeoutPromise]);

    const endTime = Date.now();
    console.log(`Database seeding finished in ${(endTime - startTime) / 1000}s`);
  } catch (error) {
    console.error("Error during database seeding:", error);
    const endTime = Date.now();
    console.error(`Seeding failed after ${(endTime - startTime) / 1000}s`);
    throw error; // Re-throw the error to indicate seeding failure
  }
}