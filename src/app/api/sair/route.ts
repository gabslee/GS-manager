import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const response = NextResponse.redirect(new URL("/login", url.origin))

  // NextAuth v5 usa nomes diferentes conforme o protocolo
  const cookieNames = [
    "authjs.session-token",         // HTTP (desenvolvimento)
    "__Secure-authjs.session-token", // HTTPS (produção)
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
  ]

  for (const name of cookieNames) {
    response.cookies.delete(name)
  }

  return response
}
