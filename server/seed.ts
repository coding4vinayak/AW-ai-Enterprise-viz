import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if we already have customers
  const existingCustomers = await storage.getCustomers();
  if (existingCustomers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  // Create default customer
  const defaultCustomer = await storage.createCustomer({
    name: "Default Organization",
    slug: "default",
    status: "active",
    branding: null,
    settings: null,
  });
  console.log("Created default customer:", defaultCustomer.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await storage.createUser({
    customerId: defaultCustomer.id,
    email: "admin@example.com",
    username: "admin",
    password: hashedPassword,
    role: "admin",
    firstName: "Admin",
    lastName: "User",
    status: "active",
  });
  console.log("Created admin user:", adminUser.email);

  // Create default LLM providers
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
}