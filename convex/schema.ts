import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Auth schemas
export const userSchema = {
  email: v.string(),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
};

export const sessionSchema = {
  userId: v.id("users"),
  expires: v.float64(),
  sessionToken: v.string(),
};

export const accountSchema = {
  userId: v.id("users"),
  type: v.union(
    v.literal("email"),
    v.literal("oidc"),
    v.literal("oauth"),
    v.literal("webauthn")
  ),
  provider: v.string(),
  providerAccountId: v.string(),
  access_token: v.optional(v.string()),
  expires_at: v.optional(v.float64()),
  id_token: v.optional(v.string()),
  scope: v.optional(v.string()),
  token_type: v.optional(v.string()),
};

export const authenticatorSchema = {
  credentialID: v.string(),
  userId: v.id("users"),
  providerAccountId: v.string(),
  credentialPublicKey: v.string(),
  counter: v.number(),
  credentialDeviceType: v.string(),
  credentialBackedUp: v.boolean(),
  transports: v.optional(v.string()),
};

export const verificationTokenSchema = {
  identifier: v.string(),
  token: v.string(),
  expires: v.float64(),
};

export default defineSchema({
  accounts: defineTable({
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.float64()),
    id_token: v.optional(v.string()),
    provider: v.string(),
    providerAccountId: v.string(),
    scope: v.optional(v.string()),
    token_type: v.optional(v.string()),
    type: v.union(
      v.literal("email"),
      v.literal("oidc"),
      v.literal("oauth"),
      v.literal("webauthn")
    ),
    userId: v.id("users"),
  })
    .index("userId", ["userId"])
    .index("providerAndAccountId", ["provider", "providerAccountId"]),

  labels: defineTable({
    name: v.string(),
    type: v.union(v.literal("user"), v.literal("system")),
    userId: v.union(v.id("users"), v.null()),
  }),

  sessions: defineTable({
    expires: v.float64(),
    sessionToken: v.string(),
    userId: v.id("users"),
  })
    .index("sessionToken", ["sessionToken"])
    .index("userId", ["userId"]),

  users: defineTable({
    email: v.string(),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
  }).index("email", ["email"]),

  projects: defineTable({
    userId: v.union(v.id("users"), v.null()),
    name: v.string(),
    type: v.union(v.literal("user"), v.literal("system")),
  }),

  todos: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    taskName: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.optional(v.float64()),
    isCompleted: v.boolean(),
    embedding: v.optional(v.array(v.float64())),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["userId"],
  }),

  subTodos: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    labelId: v.id("labels"),
    parentId: v.id("todos"),
    taskName: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    priority: v.optional(v.float64()),
    isCompleted: v.boolean(),
    embedding: v.optional(v.array(v.float64())),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
    filterFields: ["userId"],
  }),

  authenticators: defineTable({
    credentialID: v.string(),
    userId: v.id("users"),
    providerAccountId: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    credentialDeviceType: v.string(),
    credentialBackedUp: v.boolean(),
    transports: v.optional(v.string()),
  })
    .index("credentialID", ["credentialID"])
    .index("userId", ["userId"]),

  verificationTokens: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.float64(),
  }).index("identifierToken", ["identifier", "token"]),
});
