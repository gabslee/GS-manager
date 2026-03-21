"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ClipboardList, Plus, Users, LayoutDashboard } from "lucide-react"

interface MobileBottomNavProps {
  perfil: string
}

export function MobileBottomNav({ perfil }: MobileBottomNavProps) {
  const pathname = usePathname()
  const isGerente = perfil === "GERENTE"

  const sideItems = [
    { href: "/os", label: "Ordens", icon: ClipboardList },
    { href: "/clientes", label: "Clientes", icon: Users },
  ]

  if (isGerente) {
    sideItems.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard })
  }

  const left = sideItems.slice(0, Math.ceil(sideItems.length / 2))
  const right = sideItems.slice(Math.ceil(sideItems.length / 2))

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t z-50">
      <div className="flex items-end h-16">
        {/* Left items */}
        {left.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center h-full gap-0.5">
              <Icon className={cn("h-5 w-5", active ? "text-slate-900" : "text-slate-400")} />
              <span className={cn("text-xs", active ? "text-slate-900 font-medium" : "text-slate-400")}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Center: Nova OS (raised CTA) */}
        <Link href="/os/nova" className="flex-1 flex flex-col items-center justify-end pb-2 gap-0.5">
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center shadow-lg -mt-4">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs text-slate-500">Nova OS</span>
        </Link>

        {/* Right items */}
        {right.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center h-full gap-0.5">
              <Icon className={cn("h-5 w-5", active ? "text-slate-900" : "text-slate-400")} />
              <span className={cn("text-xs", active ? "text-slate-900 font-medium" : "text-slate-400")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
