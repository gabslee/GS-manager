import { getOSById } from "@/lib/queries/os"
import { notFound } from "next/navigation"
import { ProntaForm } from "@/components/os/ProntaForm"

export default async function ProntaPage({ params }: { params: { id: string } }) {
  const os = await getOSById(params.id)
  if (!os) notFound()
  if (os.status !== "APROVADA") notFound()

  return (
    <ProntaForm
      osId={os.id}
      clienteNome={os.cliente.nome}
      clienteTelefone={os.cliente.telefone}
      equipamentoTipo={os.equipamento?.tipo ?? "equipamento"}
    />
  )
}
