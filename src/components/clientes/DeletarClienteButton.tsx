"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deletarCliente } from "@/actions/clientes"
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

interface DeletarClienteButtonProps {
  clienteId: string
  clienteNome: string
}

export function DeletarClienteButton({ clienteId, clienteNome }: DeletarClienteButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      const result = await deletarCliente(clienteId)
      if ("error" in result) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      setOpen(false)
      toast.success(`Cliente ${clienteNome} excluído`)
      router.push("/clientes")
    } catch {
      toast.error("Erro ao excluir cliente")
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 md:h-auto md:w-auto md:px-3">
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:inline ml-1.5">Excluir</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir <strong>{clienteNome}</strong>? Esta ação é permanente.
            Clientes com ordens de serviço não podem ser excluídos.
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
