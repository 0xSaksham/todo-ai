import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { FunctionArgs, FunctionReference } from "convex/server";
import { api } from "../convex/_generated/api";
import { Doc, Id } from "../convex/_generated/dataModel";

type User = AdapterUser & { id: Id<"users"> };
type Session = AdapterSession & { userId: Id<"users"> };
type Account = AdapterAccount & { userId: Id<"users"> };
type Authenticator = AdapterAuthenticator & { userId: Id<"users"> };

export const ConvexAdapter: Adapter = {
  async createAuthenticator(authenticator: Authenticator) {
    const { transports, ...rest } = authenticator;
    await callMutation(api.authAdapter.createAuthenticator, {
      authenticator: {
        ...rest,
        transports: transports ?? undefined,
      },
    });
    return authenticator;
  },
  async createSession(session: Session) {
    const id = await callMutation(api.authAdapter.createSession, {
      session: toDB(session),
    });
    return { ...session, id };
  },
  async createUser({ id: _, ...user }: User) {
    const id = await callMutation(api.authAdapter.createUser, {
      user: toDB(user),
    });
    return { ...user, id };
  },
  async createVerificationToken(verificationToken: VerificationToken) {
    await callMutation(api.authAdapter.createVerificationToken, {
      verificationToken: toDB(verificationToken),
    });
    return verificationToken;
  },
  async deleteSession(sessionToken) {
    return maybeSessionFromDB(
      await callMutation(api.authAdapter.deleteSession, {
        sessionToken,
      })
    );
  },
  async deleteUser(id: Id<"users">) {
    return maybeUserFromDB(
      await callMutation(api.authAdapter.deleteUser, { id })
    );
  },
  async getAccount(providerAccountId, provider) {
    const account = await callQuery(api.authAdapter.getAccount, {
      provider,
      providerAccountId,
    });
    return account as AdapterAccount | null;
  },
  async getAuthenticator(credentialID) {
    const authenticator = await callQuery(api.authAdapter.getAuthenticator, {
      credentialID,
    });
    return authenticator as AdapterAuthenticator | null;
  },
  async getSessionAndUser(sessionToken) {
    const result = await callQuery(api.authAdapter.getSessionAndUser, {
      sessionToken,
    });
    if (result === null) {
      return null;
    }
    const { user, session } = result;
    return { user: userFromDB(user), session: sessionFromDB(session) };
  },
  async getUser(id: Id<"users">) {
    return maybeUserFromDB(await callQuery(api.authAdapter.getUser, { id }));
  },
  async getUserByAccount({ provider, providerAccountId }) {
    return maybeUserFromDB(
      await callQuery(api.authAdapter.getUserByAccount, {
        provider,
        providerAccountId,
      })
    );
  },
  async getUserByEmail(email) {
    return maybeUserFromDB(
      await callQuery(api.authAdapter.getUserByEmail, { email })
    );
  },
  async linkAccount(account: Account) {
    await callMutation(api.authAdapter.linkAccount, { account });
  },
  async listAuthenticatorsByUserId(userId: string) {
    const authenticators = await callQuery(
      api.authAdapter.listAuthenticatorsByUserId,
      {
        userId: userId as Id<"users">,
      }
    );
    // Handle the authenticator type correctly
    return authenticators
      .filter((auth) => "credentialID" in auth)
      .map((auth) => ({
        id: auth._id,
        userId: userId,
        providerAccountId: (auth as any).providerAccountId,
        credentialID: (auth as any).credentialID,
        credentialPublicKey: (auth as any).credentialPublicKey,
        counter: (auth as any).counter,
        credentialDeviceType: (auth as any).credentialDeviceType,
        credentialBackedUp: (auth as any).credentialBackedUp,
        transports: (auth as any).transports,
      })) as AdapterAuthenticator[];
  },
  async unlinkAccount({ provider, providerAccountId }) {
    await callMutation(api.authAdapter.unlinkAccount, {
      provider,
      providerAccountId,
    });
  },
  async updateAuthenticatorCounter(credentialID, newCounter) {
    const auth = await callMutation(
      api.authAdapter.updateAuthenticatorCounter,
      {
        credentialID,
        newCounter,
      }
    );
    // Handle the authenticator type correctly
    return {
      id: auth._id,
      userId: (auth as any).userId,
      providerAccountId: (auth as any).providerAccountId,
      credentialID: (auth as any).credentialID,
      credentialPublicKey: (auth as any).credentialPublicKey,
      counter: (auth as any).counter,
      credentialDeviceType: (auth as any).credentialDeviceType,
      credentialBackedUp: (auth as any).credentialBackedUp,
      transports: (auth as any).transports,
    } as AdapterAuthenticator;
  },
  async updateSession(
    session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
  ) {
    const sessionToUpdate = {
      sessionToken: session.sessionToken,
      expires: session.expires?.getTime() ?? Date.now() + 24 * 60 * 60 * 1000, // Default to 24 hours from now if no expiry provided
    };
    const updated = await callMutation(api.authAdapter.updateSession, {
      session: sessionToUpdate,
    });
    return updated ? sessionFromDB(updated) : null;
  },
  async updateUser(user: User) {
    await callMutation(api.authAdapter.updateUser, { user: toDB(user) });
    return user;
  },
  async useVerificationToken({ identifier, token }) {
    return (await callMutation(api.authAdapter.useVerificationToken, {
      identifier,
      token,
    })) as VerificationToken | null;
  },
};

/// Helpers

function callQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Omit<FunctionArgs<Query>, "secret">
) {
  return fetchQuery(query, addSecret(args) as any);
}

function callMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: Omit<FunctionArgs<Mutation>, "secret">
) {
  return fetchMutation(mutation, addSecret(args) as any);
}

if (process.env.CONVEX_AUTH_ADAPTER_SECRET === undefined) {
  throw new Error("Missing CONVEX_AUTH_ADAPTER_SECRET environment variable");
}

function addSecret(args: Record<string, any>) {
  return { ...args, secret: process.env.CONVEX_AUTH_ADAPTER_SECRET! };
}

function maybeUserFromDB(user: Doc<"users"> | null) {
  if (user === null) {
    return null;
  }
  return userFromDB(user);
}

function userFromDB(user: Doc<"users">) {
  return {
    ...user,
    id: user._id,
    emailVerified: null, // Add this field since it's required by AdapterUser
  };
}

function maybeSessionFromDB(session: Doc<"sessions"> | null) {
  if (session === null) {
    return null;
  }
  return sessionFromDB(session);
}

function sessionFromDB(session: Doc<"sessions">) {
  return { ...session, id: session._id, expires: new Date(session.expires) };
}

function toDB<T extends object>(
  obj: T
): {
  [K in keyof T]: T[K] extends Date
    ? number
    : null extends T[K]
      ? undefined
      : T[K];
} {
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    result[key] =
      value instanceof Date
        ? value.getTime()
        : value === null
          ? undefined
          : value;
  }
  return result;
}
