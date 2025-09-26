import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { UserService } from "@/services"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        isRegister: { label: "Is Register", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("❌ Missing credentials")
            return null
          }

          // Séparer la logique login/register
          if (credentials.isRegister === "true") {
            return await handleRegister(credentials.name, credentials.email, credentials.password)
          } else {
            return await handleLogin(credentials.email, credentials.password)
          }
        } catch (err) {
          console.error("❌ Error in authorize:", err)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Logique spécifique pour Google Provider
      if (account?.provider === "google") {
        try {
          const email = user.email || profile?.email
          const name = user.name || profile?.name

          if (!email) {
            console.log("❌ No email provided by Google")
            return false
          }

          // Vérifier si l'utilisateur existe déjà
          const existingUserResponse = await UserService.findByEmail(email)
          
          if (existingUserResponse.success && existingUserResponse.data) {
            // Utilisateur existe déjà - LOGIN
            console.log("✅ Google user exists, logging in:", email)
            
            // Mettre à jour les données de l'utilisateur avec les infos Google
            user.id = existingUserResponse.data._id?.toString() ?? ""
            user._id = existingUserResponse.data._id?.toString() ?? ""
            user.name = existingUserResponse.data.name
            user.email = existingUserResponse.data.email
            
            return true
          } else {
            // Utilisateur n'existe pas - REGISTER
            console.log("🆕 Google user doesn't exist, registering:", email)
            
            const registerResult = await handleGoogleRegister(name || "Google User", email)
            
            if (registerResult) {
              // Mise à jour des données utilisateur après inscription
              user.id = registerResult._id
              user._id = registerResult._id
              user.name = registerResult.name
              user.email = registerResult.email
              
              return true
            } else {
              console.log("❌ Failed to register Google user")
              return false
            }
          }
        } catch (error) {
          console.error("❌ Error in Google signIn callback:", error)
          return false
        }
      }
      
      // Pour les autres providers (Credentials), toujours autoriser
      return true
    },
    async jwt({ token, user }) {
      // Lors du premier login, user contient les données de authorize()
      if (user) {
        token._id = user._id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    
    async session({ session, token }) {
      // Ajouter les données personnalisées à la session
      if (token) {
        session.user = {
          ...session.user,
          _id: token._id as string,
          name: token.name as string,
          email: token.email as string,
        }
      }
      return session
    }
  },
  secret: process.env.AUTH_SECRET,
})

// Fonction séparée pour gérer le login
async function handleLogin(email: string, password: string) {
  const response = await UserService.findByEmail(email)
  const user = response.data

  if (!user) {
    console.log("❌ User not found:", email)
    return null
  }

  const passwordCorrect = await compare(password, user.password || "")
  if (!passwordCorrect) {
    console.log("❌ Invalid password for user:", email)
    return null
  }

  console.log("✅ User logged in:", user)
  // IMPORTANT : NextAuth attend un 'id' ET on peut ajouter '_id'
  return {
    id: user._id?.toString() ?? "", // Requis par NextAuth
    _id: user._id?.toString() ?? "", // Pour notre usage personnalisé
    name: user.name,
    email: user.email,
  }
}

// Fonction séparée pour gérer l'inscription
async function handleRegister(name:string, email: string, password: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL
    if (!baseUrl) {
      console.log("❌ Missing NEXTAUTH_URL env variable")
      return null
    }

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, provider: "credentials" }),
    })

    if (!res.ok) {
      console.log("❌ Failed to register new user:", res.status)
      return null
    }

    const registerResponse = await UserService.findByEmail(email)
    if (!registerResponse.success || !registerResponse.data) {
      return null
    }

    const newUser = registerResponse.data
    console.log("✅ New user registered:", newUser)

    // IMPORTANT : NextAuth attend un 'id' ET on peut ajouter '_id'
    return {
      id: newUser._id?.toString() ?? "", // Requis par NextAuth
      _id: newUser._id?.toString() ?? "", // Pour notre usage personnalisé
      name: newUser.name,
      email: newUser.email,
    }
  } catch (error) {
    console.error("❌ Registration error:", error)
    return null
  }
}

async function handleGoogleRegister(name: string, email: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL
    if (!baseUrl) {
      console.log("❌ Missing NEXTAUTH_URL env variable")
      return null
    }

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name, 
        email, 
        provider: "google" // Flag pour identifier les utilisateurs Google
      }),
    })

    if (!res.ok) {
      console.log("❌ Failed to register Google user:", res.status)
      return null
    }

    const registerResponse = await UserService.findByEmail(email)
    if (!registerResponse.success || !registerResponse.data) {
      return null
    }

    const newUser = registerResponse.data
    console.log("✅ New Google user registered:", newUser)

    return {
      _id: newUser._id?.toString() ?? "",
      name: newUser.name,
      email: newUser.email,
    }
  } catch (error) {
    console.error("❌ Google registration error:", error)
    return null
  }
}

export { handler as GET, handler as POST }
