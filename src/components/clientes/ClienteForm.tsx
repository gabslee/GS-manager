"use client"

import { useState } from "react"
import { criarCliente } from "@/actions/clientes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

type ClienteCriado = {
  id: string
  nome: string
  telefone: string
  tipo: string
  documento: string
}

interface ClienteFormProps {
  onSuccess?: (cliente: ClienteCriado) => void
  onCancel?: () => void
}

export function ClienteForm({ onSuccess, onCancel }: ClienteFormProps) {
  const [tipo, setTipo] = useState<"PF" | "PJ">("PF")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await criarCliente(formData)
    setLoading(false)

    if ("error" in result) {
      const msg = typeof result.error === "string"
        ? result.error
        : "Verifique os campos e tente novamente"
      toast.error(msg)
    } else {
      toast.success("Cliente cadastrado!")
      onSuccess?.({
        id: result.clienteId!,
        nome: result.nome!,
        telefone: result.telefone!,
        tipo: result.tipo!,
        documento: result.documento!,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="tipo" value={tipo} />

      <div className="space-y-1">
        <Label>Tipo de Pessoa</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={tipo === "PF" ? "default" : "outline"}
            size="sm"
            onClick={() => setTipo("PF")}
          >
            Pessoa Física
          </Button>
          <Button
            type="button"
            variant={tipo === "PJ" ? "default" : "outline"}
            size="sm"
            onClick={() => setTipo("PJ")}
          >
            Pessoa Jurídica
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="nome">{tipo === "PF" ? "Nome" : "Razão Social"}</Label>
        <Input id="nome" name="nome" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="documento">{tipo === "PF" ? "CPF" : "CNPJ"}</Label>
        <Input
          id="documento"
          name="documento"
          placeholder={tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="telefone">Telefone / WhatsApp</Label>
        <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">E-mail (opcional)</Label>
        <Input id="email" name="email" type="email" />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar Cliente"}
        </Button>
      </div>
    </form>
  )
}
