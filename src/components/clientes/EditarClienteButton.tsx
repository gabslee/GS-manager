"use client"

import { useState } from "react"
import { atualizarCliente } from "@/actions/clientes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Pencil, X } from "lucide-react"

type ClienteData = {
  id: string
  tipo: string
  documento: string | null
  nome: string
  telefone: string
  email: string | null
}

export function EditarClienteButton({ cliente }: { cliente: ClienteData }) {
  const [editando, setEditando] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState<"PF" | "PJ">(cliente.tipo as "PF" | "PJ")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await atualizarCliente(cliente.id, formData)
    setLoading(false)

    if ("error" in result) {
      toast.error(typeof result.error === "string" ? result.error : "Verifique os campos")
    } else {
      toast.success("Cliente atualizado!")
      setEditando(false)
    }
  }

  if (!editando) {
    return (
      <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
        <Pencil className="h-3.5 w-3.5 mr-1.5" />
        Editar
      </Button>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Editar Cliente</CardTitle>
          <button onClick={() => setEditando(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="tipo" value={tipo} />

          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={tipo === "PF" ? "default" : "outline"} onClick={() => setTipo("PF")}>
                Pessoa Física
              </Button>
              <Button type="button" size="sm" variant={tipo === "PJ" ? "default" : "outline"} onClick={() => setTipo("PJ")}>
                Pessoa Jurídica
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-nome" className="text-xs">{tipo === "PF" ? "Nome" : "Razão Social"}</Label>
            <Input id="edit-nome" name="nome" defaultValue={cliente.nome} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-documento" className="text-xs">
              {tipo === "PF" ? "CPF" : "CNPJ"}
              {tipo === "PF" && <span className="text-muted-foreground font-normal"> (opcional)</span>}
            </Label>
            <Input
              id="edit-documento"
              name="documento"
              defaultValue={cliente.documento ?? ""}
              required={tipo === "PJ"}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-telefone" className="text-xs">Telefone / WhatsApp</Label>
            <Input id="edit-telefone" name="telefone" defaultValue={cliente.telefone} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-email" className="text-xs">E-mail (opcional)</Label>
            <Input id="edit-email" name="email" type="email" defaultValue={cliente.email ?? ""} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
