"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { marcarPronta } from "@/actions/os"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Phone, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const CANAIS = [
  { value: "LIGACAO", label: "Ligação", icon: Phone },
  { value: "MENSAGEM", label: "Mensagem / WhatsApp", icon: MessageCircle },
]

interface ProntaFormProps {
  osId: string
  clienteNome: string
  clienteTelefone: string
  equipamentoTipo: string
}

export function ProntaForm({ osId, clienteNome, clienteTelefone, equipamentoTipo }: ProntaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [canal, setCanal] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await marcarPronta(osId, formData)
    setLoading(false)

    if ("error" in result) {
      toast.error(typeof result.error === "string" ? result.error : "Verifique os campos")
      return
    }

    toast.success("OS marcada como pronta! Abrindo WhatsApp...")

    const telefoneDigitos = clienteTelefone.replace(/\D/g, "")
    const telefoneWA = telefoneDigitos.startsWith("55") ? telefoneDigitos : `55${telefoneDigitos}`

    const tipoFormatado = equipamentoTipo
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())

    const linhas = [
      `Olá, ${clienteNome}! O seu *${tipoFormatado}* está pronto para retirada.`,
      ``,
      `Pode vir buscar quando quiser.`,
    ]

    const url = `https://wa.me/${telefoneWA}?text=${encodeURIComponent(linhas.join("\n"))}`
    window.open(url, "_blank", "noopener,noreferrer")

    router.push(`/os/${osId}`)
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/os/${osId}`}>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:h-auto md:w-auto md:px-3">
            <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden md:inline ml-1">Voltar</span>
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Marcar como Pronta</h1>
      </div>

      <div className="bg-slate-50 border rounded-xl px-4 py-3 text-sm text-slate-600 space-y-0.5">
        <p>
          <span className="text-slate-400">Cliente:</span>{" "}
          <span className="font-medium text-slate-900">{clienteNome}</span>
        </p>
        <p>
          <span className="text-slate-400">Equipamento:</span>{" "}
          <span className="font-medium text-slate-900 capitalize">
            {equipamentoTipo.replace(/_/g, " ").toLowerCase()}
          </span>
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aviso ao Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Como o cliente foi avisado?</Label>
              <div className="grid grid-cols-2 gap-3">
                {CANAIS.map((c) => {
                  const Icon = c.icon
                  const selected = canal === c.value
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCanal(c.value)}
                      className={cn(
                        "flex flex-col items-center justify-center h-16 rounded-xl border-2 text-sm font-medium transition-all gap-1.5",
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {c.label}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" name="canal" value={canal} />
            </div>

            <input
              type="hidden"
              name="dataAviso"
              value={new Date().toISOString().split("T")[0]}
            />

            <div className="space-y-2">
              <Label htmlFor="observacao" className="text-sm font-medium">
                Observação <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="observacao"
                name="observacao"
                placeholder="Informações adicionais..."
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !canal}
              className="w-full h-12 text-base"
            >
              {loading ? "Salvando..." : "Confirmar e enviar WhatsApp"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
