"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Download, Upload, CheckCircle, XCircle, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"

type ErroImportacao = {
  linha: number
  nome: string
  motivo: string
}

type Resultado = {
  total: number
  sucesso: number
  erros: ErroImportacao[]
}

export default function ImportarClientesPage() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setArquivo(f)
    setResultado(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!arquivo) return

    setLoading(true)
    const fd = new FormData()
    fd.append("arquivo", arquivo)

    const res = await fetch("/api/clientes/importar", { method: "POST", body: fd })
    setLoading(false)

    if (!res.ok) {
      toast.error("Erro ao processar arquivo")
      return
    }

    const data: Resultado = await res.json()
    setResultado(data)

    if (data.erros.length === 0) {
      toast.success(`${data.sucesso} cliente(s) importado(s) com sucesso!`)
    } else if (data.sucesso > 0) {
      toast.warning(`${data.sucesso} importado(s), ${data.erros.length} com erro`)
    } else {
      toast.error("Nenhum cliente foi importado")
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/clientes">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">Importar Clientes</h1>
      </div>

      {/* Modelo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">1. Baixar modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Preencha a planilha com os dados dos clientes. Colunas: <strong>Nome</strong>,{" "}
            <strong>Tipo</strong> (PF ou PJ), <strong>Documento</strong> (CPF/CNPJ, opcional para PF),{" "}
            <strong>Telefone</strong>.
          </p>
          <a href="/api/clientes/template" download>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar modelo .xlsx
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">2. Enviar planilha preenchida</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="arquivo"
              className={cn(
                "flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors",
                arquivo
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100"
              )}
            >
              <FileSpreadsheet className={cn("h-8 w-8 mb-2", arquivo ? "text-green-600" : "text-slate-400")} />
              {arquivo ? (
                <span className="text-sm font-medium text-slate-700">{arquivo.name}</span>
              ) : (
                <span className="text-sm text-slate-500">Clique para selecionar o arquivo .xlsx</span>
              )}
              <input
                ref={inputRef}
                id="arquivo"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleArquivo}
              />
            </label>

            <Button type="submit" disabled={!arquivo || loading} className="w-full h-11">
              <Upload className="h-4 w-4 mr-2" />
              {loading ? "Importando..." : "Importar clientes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resultado da importação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold">{resultado.total}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total de linhas</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{resultado.sucesso}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Importados</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{resultado.erros.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Com erro</p>
              </div>
            </div>

            {resultado.erros.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">Linhas com erro:</p>
                <div className="rounded-lg border border-red-100 divide-y divide-red-100 overflow-hidden">
                  {resultado.erros.map((e) => (
                    <div key={e.linha} className="flex items-start gap-3 px-4 py-3 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          Linha {e.linha}
                          {e.nome && e.nome !== `(linha ${e.linha})` && (
                            <span className="font-normal text-muted-foreground"> — {e.nome}</span>
                          )}
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">{e.motivo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultado.sucesso > 0 && resultado.erros.length === 0 && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium">Todos os clientes foram importados com sucesso!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
