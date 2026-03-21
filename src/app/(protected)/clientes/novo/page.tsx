"use client"

import { useRouter } from "next/navigation"
import { ClienteForm } from "@/components/clientes/ClienteForm"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function NovoClientePage() {
  const router = useRouter()

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/clientes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Novo Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm
            onSuccess={(c) => router.push(`/clientes/${c.id}`)}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  )
}
