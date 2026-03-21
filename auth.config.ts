import type { NextAuthConfig } from "next-auth"

// Configuração Edge-compatível (sem Prisma, sem bcrypt, sem Node.js-specific)
// Usada pelo middleware e compartilhada com auth.ts completo
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.perfil = (user as { perfil: string }).perfil
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.perfil = token.perfil as "ATENDENTE" | "GERENTE"
      return session
    },
  },
  providers: [], // Providers adicionados em auth.ts (não Edge)
  session: { strategy: "jwt" },
}
