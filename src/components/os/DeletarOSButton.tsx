"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deletarOS } from "@/actions/os"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface DeletarOSButtonProps {
  osId: string
  osNumero: string
}

export function DeletarOSButton({ osId, osNumero }: DeletarOSButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await deletarOS(osId)
      if ("error" in result) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      setOpen(false)
      toast.success(`OS ${osNumero} excluída`)
      router.push("/os")
    } catch {
      toast.error("Erro ao excluir OS")
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 md:h-auto md:w-auto md:px-3">
          <Trash2 className="h-4 w-4" />
          <span className="hidden md:inline ml-1.5">Excluir</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir OS {osNumero}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é permanente e não pode ser desfeita. Todos os dados desta OS serão removidos,
            incluindo orçamento, avisos e pagamento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
