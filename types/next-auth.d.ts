import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      _id: string
      name: string
      email: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    _id: string
    name: string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id: string
    name: string
    email: string
  }
}
