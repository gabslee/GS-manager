import { NextRequest, NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "../auth.config"

const IS_MOCK = process.env.MOCK_DB === "true"
const GERENTE_ONLY = ["/dashboard", "/relatorios", "/admin"]

// Middleware Edge-compatível: usa só authConfig (sem Prisma)
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Modo mock: sem autenticação real, apenas redireciona /login
  if (IS_MOCK) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/os", req.url))
    }
    return NextResponse.next()
  }

  const isLoggedIn = !!req.auth

  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/os", req.url))
  }

  const isGerenteRoute = GERENTE_ONLY.some((p) => pathname.startsWith(p))
  if (isGerenteRoute && req.auth?.user?.perfil !== "GERENTE") {
    return NextResponse.redirect(new URL("/os", req.url))
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
