"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registrarPagamento } from "@/actions/pagamento"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CurrencyInput } from "@/components/ui/currency-input"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PagamentoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await registrarPagamento(params.id, formData)
    setLoading(false)

    if ("error" in result) {
      toast.error("Verifique os campos e tente novamente")
    } else {
      toast.success("Pagamento registrado! OS encerrada.")
      router.push(`/os/${params.id}`)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/os/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Registrar Pagamento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>Forma de Pagamento</Label>
              <Select name="forma" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="PIX">Pix</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="valor">Valor Pago (R$)</Label>
              <CurrencyInput id="valor" name="valor" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="observacao">Observação (opcional)</Label>
              <Input id="observacao" name="observacao" placeholder="Informações adicionais..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Confirmar Pagamento"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
