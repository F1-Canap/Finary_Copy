import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Pages publiques (non protégées)
  const publicPaths = ["/login", "/register", "/landing"]
  const isPublic = publicPaths.some((path) => pathname.startsWith(path))

  // 🔓 Autoriser si c'est une page publique
  if (isPublic) {
    return NextResponse.next()
  }

  // 🔒 Vérifier le token seulement pour les pages protégées
  const token = await getToken({ req })
  console.log("MIDDLEWARE - Token pour:", pathname, "Token:", token)

  // 🔒 Si pas de token => redirige vers /login
  if (!token) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // ✅ Sinon laisser passer
  return NextResponse.next()
}

// ✅ Matcher ultra-optimisé qui exclut automatiquement toutes les ressources statiques
export const config = {
  matcher: [
    /*
     * Matcher optimisé qui exclut :
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, robots.txt, sitemap.xml (fichiers metadata)
     * - tous les fichiers avec extension (.png, .jpg, .css, .js, .svg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'
  ],
}
