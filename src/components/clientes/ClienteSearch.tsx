"use client"

import { useState, useEffect, useRef } from "react"
import { buscarClientes } from "@/actions/clientes"
import { Input } from "@/components/ui/input"
import { formatarDocumento } from "@/lib/utils/formatters"

type Cliente = {
  id: string
  nome: string
  documento: string
  tipo: string
  telefone: string
  email: string | null
}

interface ClienteSearchProps {
  onSelect: (cliente: Cliente) => void
}

export function ClienteSearch({ onSelect }: ClienteSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      const data = await buscarClientes(query)
      setResults(data as Cliente[])
      setOpen(true)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(c: Cliente) {
    setQuery("")
    setResults([])
    setOpen(false)
    onSelect(c)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite o nome ou CPF/CNPJ do cliente..."
        className="h-11"
        autoComplete="off"
      />
      {loading && (
        <p className="text-xs text-muted-foreground mt-1 px-1">Buscando...</p>
      )}
      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-md px-4 py-3">
          <p className="text-sm text-muted-foreground">Nenhum cliente encontrado para &quot;{query}&quot;</p>
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-md divide-y overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(c)}
            >
              <p className="font-medium">{c.nome}</p>
              <p className="text-sm text-muted-foreground">
                {formatarDocumento(c.documento, c.tipo as "PF" | "PJ")} · {c.telefone}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
