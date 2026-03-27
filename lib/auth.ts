import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators/auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "development" ? "payme-dev-only-secret-change-in-production" : undefined),
  session: {
    // Credentials auth in NextAuth v4 requires JWT strategy.
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Apply credential attempt throttling in front of this endpoint for production deployments.
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email }
        });

        if (!user) {
          return null;
        }

        const validPassword = await compare(parsed.data.password, user.hashedPassword);
        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email
        };
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
      }
      return session;
    }
  }
};

export function auth() {
  return getServerSession(authOptions);
}
