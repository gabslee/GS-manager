import { getSession } from "@/lib/get-session"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { IS_MOCK } from "@/lib/mock/data"
import { Zap } from "lucide-react"
import { sair } from "@/actions/auth"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen">
      {/* Sidebar: desktop only */}
      <Sidebar perfil={session.user.perfil} nome={session.user.name ?? ""} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 bg-white sticky top-0 z-40">
          {/* Mobile: logo (sidebar hidden) */}
          <div className="flex items-center gap-2 md:hidden">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="font-bold text-sm">GS Eletrotécnica</span>
          </div>
          {/* Desktop: spacer */}
          <div className="hidden md:block" />

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{session.user.name}</span>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded hidden sm:inline">
              {session.user.perfil}
            </span>
            {!IS_MOCK && (
              <form action={sair}>
                <button type="submit" className="text-xs text-red-500 hover:underline ml-2">
                  Sair
                </button>
              </form>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 bg-gray-50">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav perfil={session.user.perfil} />
    </div>
  )
}
