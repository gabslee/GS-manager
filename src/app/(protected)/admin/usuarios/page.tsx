"use client"

import { useState, useEffect } from "react"
import { criarUsuario, toggleUsuarioAtivo } from "@/actions/usuarios"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type Usuario = {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [perfil, setPerfil] = useState<string | null>("")

  async function carregarUsuarios() {
    const res = await fetch("/api/usuarios")
    if (res.ok) {
      const data = await res.json()
      setUsuarios(data)
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function handleCriar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await criarUsuario(formData)
    setLoading(false)

    if ("error" in result) {
      const msg = typeof result.error === "string" ? result.error : "Verifique os campos"
      toast.error(msg)
    } else {
      toast.success("Usuário criado!")
      ;(e.target as HTMLFormElement).reset()
      carregarUsuarios()
    }
  }

  async function handleToggle(id: string) {
    await toggleUsuarioAtivo(id)
    carregarUsuarios()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Usuários</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCriar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" name="senha" type="password" required minLength={6} />
              </div>
              <div className="space-y-1">
                <Label>Perfil</Label>
                <Select name="perfil" required onValueChange={(v) => setPerfil(v as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATENDENTE">Atendente</SelectItem>
                    <SelectItem value="GERENTE">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.perfil === "GERENTE" ? "default" : "secondary"}>
                    {u.perfil}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.ativo ? "outline" : "destructive"}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(u.id)}
                  >
                    {u.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
