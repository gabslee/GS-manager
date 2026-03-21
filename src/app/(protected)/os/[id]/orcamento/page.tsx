import { getOSById } from "@/lib/queries/os"
import { notFound } from "next/navigation"
import { OrcamentoForm } from "@/components/os/OrcamentoForm"

export default async function OrcamentoPage({ params }: { params: { id: string } }) {
  const os = await getOSById(params.id)
  if (!os) notFound()
  if (os.status !== "ABERTA") notFound()

  return (
    <OrcamentoForm
      osId={os.id}
      clienteNome={os.cliente.nome}
      clienteTelefone={os.cliente.telefone}
      equipamentoTipo={os.equipamento?.tipo ?? "equipamento"}
      observacoes={os.observacoes}
    />
  )
}
