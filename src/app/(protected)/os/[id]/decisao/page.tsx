"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registrarDecisao } from "@/actions/decisao"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react"
import Link from "next/link"

export default function DecisaoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aprovado, setAprovado] = useState<boolean | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (aprovado === null) {
      toast.error("Selecione aprovado ou reprovado")
      return
    }
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("aprovado", String(aprovado))
    const result = await registrarDecisao(params.id, formData)
    setLoading(false)

    if ("error" in result) {
      toast.error("Verifique os campos e tente novamente")
    } else {
      toast.success(aprovado ? "Orçamento aprovado!" : "Orçamento reprovado.")
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
        <h1 className="text-xl font-bold">Registrar Decisão do Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decisão sobre o Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Decisão</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={aprovado === true ? "default" : "outline"}
                  className={aprovado === true ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setAprovado(true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Aprovado
                </Button>
                <Button
                  type="button"
                  variant={aprovado === false ? "destructive" : "outline"}
                  onClick={() => setAprovado(false)}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reprovado
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="dataDecisao">Data da Decisão</Label>
              <Input
                id="dataDecisao"
                name="dataDecisao"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {aprovado === false && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                Atenção: ao reprovar, a OS será encerrada e o cliente deverá retirar o equipamento.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || aprovado === null}>
                {loading ? "Salvando..." : "Confirmar Decisão"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
