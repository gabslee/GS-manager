"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { lancarOrcamento } from "@/actions/orcamento"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Phone, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const CANAIS = [
  { value: "LIGACAO", label: "Ligação", icon: Phone },
  { value: "MENSAGEM", label: "Mensagem / WhatsApp", icon: MessageCircle },
]

interface OrcamentoFormProps {
  osId: string
  clienteNome: string
  clienteTelefone: string
  equipamentoTipo: string
  observacoes?: string | null
}

function formatarValorWhatsApp(raw: string): string {
  const num = parseFloat(raw.replace(",", "."))
  if (isNaN(num)) return raw
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function OrcamentoForm({
  osId,
  clienteNome,
  clienteTelefone,
  equipamentoTipo,
  observacoes,
}: OrcamentoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [canal, setCanal] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const valor = formData.get("valor") as string
    const descricao = formData.get("descricaoManutencao") as string

    const result = await lancarOrcamento(osId, formData)
    setLoading(false)

    if ("error" in result) {
      toast.error("Verifique os campos e tente novamente")
      return
    }

    toast.success("Orçamento lançado! Abrindo WhatsApp...")

    const telefoneDigitos = clienteTelefone.replace(/\D/g, "")
    const telefoneWA = telefoneDigitos.startsWith("55") ? telefoneDigitos : `55${telefoneDigitos}`

    const valorFormatado = formatarValorWhatsApp(valor)
    const tipoFormatado = equipamentoTipo
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())

    const linhas = [
      `Olá, ${clienteNome}! O orçamento do *${tipoFormatado}* está pronto.`,
      ``,
      `*Valor:* ${valorFormatado}`,
      `*Serviço:* ${descricao}`,
    ]
    if (observacoes) linhas.push(`*Obs:* ${observacoes}`)
    linhas.push(``, `Confirme para darmos início ao reparo.`)

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
        <h1 className="text-xl font-bold">Lançar Orçamento</h1>
      </div>

      {/* Resumo do cliente */}
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
          <CardTitle className="text-base">Detalhes do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="descricaoManutencao" className="text-sm font-medium">
                Descrição da Manutenção
              </Label>
              <textarea
                id="descricaoManutencao"
                name="descricaoManutencao"
                required
                className="w-full min-h-[120px] rounded-xl border border-input bg-background px-4 py-3 text-base md:text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Descreva o serviço realizado..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-medium">
                Valor (R$)
              </Label>
              <CurrencyInput id="valor" name="valor" required />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Como o orçamento foi comunicado?</Label>
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
              <input type="hidden" name="canalComunicacao" value={canal} />
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
