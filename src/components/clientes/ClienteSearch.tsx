"use client"

import { useState, useTransition } from "react"
import { buscarClientes } from "@/actions/clientes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  const [isPending, startTransition] = useTransition()

  function handleSearch() {
    startTransition(async () => {
      const data = await buscarClientes(query)
      setResults(data as Cliente[])
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Buscar por nome ou CPF/CNPJ..."
        />
        <Button type="button" variant="secondary" onClick={handleSearch} disabled={isPending}>
          {isPending ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="border rounded-lg divide-y">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              onClick={() => onSelect(c)}
            >
              <p className="font-medium">{c.nome}</p>
              <p className="text-sm text-muted-foreground">
                {formatarDocumento(c.documento, c.tipo as "PF" | "PJ")} · {c.telefone}
              </p>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && query && (
        <p className="text-sm text-muted-foreground">Nenhum cliente encontrado para &quot;{query}&quot;</p>
      )}
    </div>
  )
}
