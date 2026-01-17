import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            customer: true,
            staffProfiles: {
              include: { cafe: true },
              where: { isActive: true },
            },
          },
        })

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          customerId: user.customer?.id,
          staffProfiles: user.staffProfiles,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google sign-in, handle user creation/linking
      if (account?.provider === "google") {
        try {
          const email = user.email || (profile as any)?.email
          if (!email) return true

          const googleName = user.name || (profile as any)?.name || null
          const googleImage = user.image || (profile as any)?.picture || null

          const existingUser = await prisma.user.findUnique({
            where: { email },
            include: {
              accounts: true,
              customer: true,
              staffProfiles: {
                include: { cafe: true },
                where: { isActive: true },
              },
            },
          })

          if (existingUser) {
            if ((!existingUser.name && googleName) || (!existingUser.image && googleImage)) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  ...(!existingUser.name && googleName ? { name: googleName } : {}),
                  ...(!existingUser.image && googleImage ? { image: googleImage } : {}),
                },
              })
            }

            // User exists - check if they need a customer profile
            // (for users signing in as customers who don't have a profile yet)
            if (!existingUser.customer && existingUser.staffProfiles.length === 0) {
              // Create customer profile for existing user without any profile
              await prisma.customer.create({
                data: {
                  userId: existingUser.id,
                },
              })
            }
            return true
          }

          // New user will be created by the adapter
          // We'll create a customer profile after user creation
          if (user.id && (googleName || googleImage)) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                ...(googleName ? { name: googleName } : {}),
                ...(googleImage ? { image: googleImage } : {}),
              },
            })
          }
          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return true
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // On initial sign-in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.customerId = user.customerId
        token.staffProfiles = user.staffProfiles
      }

      // For Google sign-in and any sessions missing an id, fetch user data from database
      if ((account?.provider === "google" || !token.id) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: {
            customer: true,
            staffProfiles: {
              include: { cafe: true },
              where: { isActive: true },
            },
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.customerId = dbUser.customer?.id
          token.staffProfiles = dbUser.staffProfiles
          token.name = token.name || dbUser.name || undefined
          ;(token as any).picture = (token as any).picture || dbUser.image || undefined
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.customerId = token.customerId as string | undefined
        session.user.staffProfiles = token.staffProfiles as any[]
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // For new Google users, create a customer profile by default
      // Cafe owners will set up their cafe via /setup-cafe page
      try {
        await prisma.customer.create({
          data: {
            userId: user.id,
          },
        })
      } catch (error) {
        // Customer profile might already exist or user might become a cafe owner
        console.log("Customer profile creation skipped:", error)
      }
    },
  },
}
