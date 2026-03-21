"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { abrirOS } from "@/actions/os"
import { ClienteSearch } from "@/components/clientes/ClienteSearch"
import { ClienteForm } from "@/components/clientes/ClienteForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  CheckCircle,
  UserPlus,
  Camera,
  X,
  ArrowLeft,
  Settings2,
  Zap,
  Droplets,
  Package,
} from "lucide-react"
import Link from "next/link"

type ClienteSelecionado = {
  id: string
  nome: string
  documento: string
  tipo: string
  telefone: string
}

const EQUIPAMENTOS = [
  { value: "MAQUINA", label: "Máquina", icon: Settings2 },
  { value: "MOTOR", label: "Motor", icon: Zap },
  { value: "BOMBA_SUBMERSA", label: "Bomba Submersa", icon: Droplets },
  { value: "OUTROS", label: "Outros", icon: Package },
]

export default function NovaOSPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteSelecionado | null>(null)
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false)
  const [tipoEquipamento, setTipoEquipamento] = useState("")
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFotoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!clienteSelecionado) {
      toast.error("Selecione um cliente")
      return
    }
    if (!tipoEquipamento) {
      toast.error("Selecione o tipo de equipamento")
      return
    }
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("clienteId", clienteSelecionado.id)
    formData.set("equipamento.tipo", tipoEquipamento)

    const result = await abrirOS(formData)
    setLoading(false)

    if ("error" in result) {
      toast.error("Verifique os campos e tente novamente")
      return
    }

    toast.success("OS aberta! Abrindo WhatsApp...")

    const telefoneDigitos = clienteSelecionado.telefone.replace(/\D/g, "")
    const telefoneWA = telefoneDigitos.startsWith("55") ? telefoneDigitos : `55${telefoneDigitos}`

    const tipoFormatado = tipoEquipamento
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase())

    const problemaRelatado = formData.get("equipamento.problemaRelatado") as string
    const observacoes = formData.get("observacoes") as string
    const prazo = formData.get("prazoPrometido") as string

    const linhas = [
      `Olá, ${clienteSelecionado.nome}! Recebemos o seu *${tipoFormatado}* para manutenção.`,
      ``,
      `*OS:* ${result.numero}`,
      `*Problema relatado:* ${problemaRelatado}`,
    ]
    if (observacoes) linhas.push(`*Obs:* ${observacoes}`)
    if (prazo) {
      const [ano, mes, dia] = prazo.split("-")
      linhas.push(`*Prazo estimado:* ${dia}/${mes}/${ano}`)
    }
    linhas.push(``, `Em breve entraremos em contato com o orçamento.`)

    const url = `https://wa.me/${telefoneWA}?text=${encodeURIComponent(linhas.join("\n"))}`
    window.open(url, "_blank", "noopener,noreferrer")

    router.push(`/os/${result.osId}`)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/os">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">Nova Ordem de Serviço</h1>
      </div>

      {/* Etapa 1: Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">1</span>
            Identificar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clienteSelecionado ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{clienteSelecionado.nome}</p>
                  <p className="text-sm text-muted-foreground">{clienteSelecionado.documento}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setClienteSelecionado(null)}
              >
                Trocar
              </Button>
            </div>
          ) : (
            <>
              {!mostrarFormCliente ? (
                <div className="space-y-4">
                  <ClienteSearch onSelect={(c) => setClienteSelecionado({ id: c.id, nome: c.nome, documento: c.documento, tipo: c.tipo, telefone: c.telefone })} />
                  <Separator />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => setMostrarFormCliente(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar novo cliente
                  </Button>
                </div>
              ) : (
                <ClienteForm
                  onSuccess={(c) => {
                    setClienteSelecionado({ id: c.id, nome: c.nome, documento: c.documento, tipo: c.tipo, telefone: c.telefone })
                    setMostrarFormCliente(false)
                  }}
                  onCancel={() => setMostrarFormCliente(false)}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Etapa 2: OS + Equipamento */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">2</span>
              Equipamento e Problema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Tipo de equipamento: big tap buttons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de Equipamento</Label>
              <div className="grid grid-cols-2 gap-3">
                {EQUIPAMENTOS.map((eq) => {
                  const Icon = eq.icon
                  const selected = tipoEquipamento === eq.value
                  return (
                    <button
                      key={eq.value}
                      type="button"
                      onClick={() => setTipoEquipamento(eq.value)}
                      className={cn(
                        "flex flex-col items-center justify-center h-20 rounded-xl border-2 text-sm font-medium transition-all gap-1.5",
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 active:bg-slate-50"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      {eq.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Problema */}
            <div className="space-y-2">
              <Label htmlFor="problemaRelatado" className="text-sm font-medium">
                Problema Relatado
              </Label>
              <textarea
                id="problemaRelatado"
                name="equipamento.problemaRelatado"
                required
                className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-base md:text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Descreva o problema do equipamento..."
              />
            </div>

            {/* Foto (opcional) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Foto do Equipamento{" "}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              {fotoPreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoPreview}
                    alt="Foto do equipamento"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoPreview(null)}
                    className="absolute top-2 right-2 h-8 w-8 bg-black/60 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="foto"
                  className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 active:bg-slate-100 transition-colors"
                >
                  <Camera className="h-8 w-8 text-slate-400" />
                  <span className="text-sm text-slate-500 mt-2">Tirar foto / escolher arquivo</span>
                </label>
              )}
              <input
                id="foto"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFoto}
              />
            </div>

            <Separator />

            {/* Campos opcionais */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="marca" className="text-sm">Marca (opcional)</Label>
                <Input id="marca" name="equipamento.marca" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="modelo" className="text-sm">Modelo (opcional)</Label>
                <Input id="modelo" name="equipamento.modelo" className="h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prazoPrometido" className="text-sm">Prazo Prometido</Label>
              <Input
                id="prazoPrometido"
                name="prazoPrometido"
                type="date"
                required
                className="h-11"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observacoes" className="text-sm">Observações (opcional)</Label>
              <Input
                id="observacoes"
                name="observacoes"
                placeholder="Informações adicionais..."
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !clienteSelecionado || !tipoEquipamento}
              className="w-full h-12 text-base"
            >
              {loading ? "Abrindo OS..." : "Abrir Ordem de Serviço"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
