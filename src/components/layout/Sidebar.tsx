"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  ClipboardList,
  Users,
  LayoutDashboard,
  BarChart3,
  UserCog,
  Zap,
} from "lucide-react"

const navItems = [
  { href: "/os", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
]

const gerenteItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
]

interface SidebarProps {
  perfil: string
  nome: string
}

export function Sidebar({ perfil, nome }: SidebarProps) {
  const pathname = usePathname()
  const isGerente = perfil === "GERENTE"

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-400" />
          <span className="font-bold text-lg">GS Eletrotécnica</span>
        </div>
        <p className="text-slate-400 text-xs mt-1">Sistema de OS</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        {isGerente && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider px-3">Gerencial</p>
            </div>
            {gerenteItems.map((item) => {
              const Icon = item.icon
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">{nome}</p>
        <p className="text-xs text-slate-500">{perfil}</p>
      </div>
    </aside>
  )
}
