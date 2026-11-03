import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "./prisma.ts";
import { Resend } from "resend";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

if (!githubClientId || !githubClientSecret) {
  throw new Error(
    "Missing required GitHub OAuth environment variables: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET",
  );
}

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing required Google OAuth environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
  );
}

if (!resendApiKey) {
  console.warn(
    "RESEND_API_KEY is not set; password reset and verification emails will fail to send.",
  );
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  account: {
    accountLinking: {
      enabled: true, // allow linking multiple providers
      trustedProviders: ["github", "google"], // providers you trust
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Reset your password",
        html: `Click <a href="${url}">here</a> to reset your password.`,
      });
      if (error) {
        console.error("RESEND ERROR (reset):", error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log("Verification callback triggered:", user.email);

      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verify your email",
        html: `<a href="${url}">Verify your email</a>`,
      });

      if (error) {
        console.error("RESEND ERROR (verify):", error);
        return;
      }

      console.log("RESEND SUCCESS:", data?.id);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  socialProviders: {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
  },
  trustedOrigins: ["http://localhost:3000"],
});