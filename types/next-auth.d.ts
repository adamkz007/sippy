import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      customerId?: string
      staffProfiles?: {
        id: string
        cafeId: string
        role: string
        cafe: {
          id: string
          name: string
          slug: string
        }
      }[]
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    customerId?: string
    staffProfiles?: any[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    customerId?: string
    staffProfiles?: any[]
  }
}

