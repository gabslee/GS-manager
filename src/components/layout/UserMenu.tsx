"use client"

import { useSession } from "next-auth/react"
import { sair } from "@/actions/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

export function UserMenu() {
  const { data: session } = useSession()

  if (!session) return null

  const initials = session.user.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-medium"
        aria-label="Menu do usuário"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{session.user.name}</p>
          <p className="text-xs text-muted-foreground">{session.user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={() => sair()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
