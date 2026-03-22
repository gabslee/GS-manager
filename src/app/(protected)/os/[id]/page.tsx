import { getOSById } from "@/lib/queries/os"
import { notFound } from "next/navigation"
import { OSStatusBadge } from "@/components/os/OSStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatarData,
  formatarDataHora,
  formatarMoeda,
  formatarDocumento,
  formatarTelefone,
} from "@/lib/utils/formatters"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle, Banknote, CheckSquare } from "lucide-react"

const TIPO_EQUIPAMENTO_LABEL: Record<string, string> = {
  MAQUINA: "Máquina",
  MOTOR: "Motor",
  BOMBA_SUBMERSA: "Bomba Submersa",
  OUTROS: "Outros",
}

const CANAL_LABEL: Record<string, string> = {
  LIGACAO: "Ligação",
  MENSAGEM: "Mensagem",
  WHATSAPP: "WhatsApp",
  TELEFONE: "Telefone",
  EMAIL: "E-mail",
}

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  DINHEIRO: "Dinheiro",
  PIX: "Pix",
  CHEQUE: "Cheque",
}

export default async function OSDetailPage({ params }: { params: { id: string } }) {
  const os = await getOSById(params.id)
  if (!os) notFound()

  return (
    <div className="max-w-3xl space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/os">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 md:h-auto md:w-auto md:px-3">
            <ArrowLeft className="h-5 w-5 md:h-4 md:w-4" />
            <span className="hidden md:inline ml-1">Voltar</span>
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold font-mono">{os.numero}</h1>
            <OSStatusBadge status={os.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatarDataHora(os.createdAt)} · {os.usuario.nome}
          </p>
        </div>
      </div>

      {/* Ação conforme status */}
      {os.status === "ABERTA" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="font-semibold text-blue-800">Próximo passo: Lançar Orçamento</p>
            <p className="text-sm text-blue-600 mt-0.5">Descreva o serviço e informe o valor ao cliente</p>
          </div>
          <Link href={`/os/${os.id}/orcamento`} className="block">
            <Button className="w-full md:w-auto h-11 md:h-9">
              <FileText className="h-4 w-4 mr-2" />
              Lançar Orçamento
            </Button>
          </Link>
        </div>
      )}

      {os.status === "AGUARDANDO_APROVACAO" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="font-semibold text-yellow-800">Aguardando decisão do cliente</p>
            <p className="text-sm text-yellow-600 mt-0.5">Registre a aprovação ou reprovação do orçamento</p>
          </div>
          <Link href={`/os/${os.id}/decisao`} className="block">
            <Button variant="outline" className="w-full md:w-auto h-11 md:h-9 border-yellow-400 text-yellow-800 hover:bg-yellow-100">
              <CheckCircle className="h-4 w-4 mr-2" />
              Registrar Decisão
            </Button>
          </Link>
        </div>
      )}

      {os.status === "APROVADA" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="font-semibold text-green-800">Serviço aprovado — marcar como pronto</p>
            <p className="text-sm text-green-600 mt-0.5">Quando o serviço estiver concluído, avise o cliente</p>
          </div>
          <Link href={`/os/${os.id}/pronta`} className="block">
            <Button className="w-full md:w-auto h-11 md:h-9">
              <CheckSquare className="h-4 w-4 mr-2" />
              Marcar como Pronta
            </Button>
          </Link>
        </div>
      )}

      {os.status === "PRONTA" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="font-semibold text-purple-800">Aguardando retirada e pagamento</p>
            <p className="text-sm text-purple-600 mt-0.5">Registre o pagamento para encerrar a OS</p>
          </div>
          <Link href={`/os/${os.id}/pagamento`} className="block">
            <Button className="w-full md:w-auto h-11 md:h-9">
              <Banknote className="h-4 w-4 mr-2" />
              Registrar Pagamento
            </Button>
          </Link>
        </div>
      )}

      {os.status === "REPROVADA" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-semibold text-red-800">OS Reprovada</p>
          <p className="text-sm text-red-600 mt-0.5">O cliente reprovou o orçamento. O equipamento deve ser retirado.</p>
        </div>
      )}

      {os.status === "PAGA" && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="font-semibold text-gray-800">OS Encerrada</p>
          <p className="text-sm text-gray-600 mt-0.5">Serviço concluído e pagamento registrado.</p>
        </div>
      )}

      {/* Cards: Cliente + Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold text-base">{os.cliente.nome}</p>
            <p className="text-sm text-muted-foreground">
              {formatarDocumento(os.cliente.documento, os.cliente.tipo as "PF" | "PJ")}
            </p>
            <p className="text-sm font-medium">{formatarTelefone(os.cliente.telefone)}</p>
            {os.cliente.email && (
              <p className="text-sm text-muted-foreground">{os.cliente.email}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Prazo prometido</span>
              <span className="font-medium">
                {os.prazoPrometido ? formatarData(os.prazoPrometido) : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Status</span>
              <OSStatusBadge status={os.status} />
            </div>
            {os.observacoes && (
              <div className="pt-1 border-t">
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm leading-relaxed">{os.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Equipamento */}
      {os.equipamento && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Equipamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="font-semibold">
                {TIPO_EQUIPAMENTO_LABEL[os.equipamento.tipo] ?? os.equipamento.tipo}
              </span>
              {os.equipamento.marca && (
                <span className="text-muted-foreground">{os.equipamento.marca}</span>
              )}
              {os.equipamento.modelo && (
                <span className="text-muted-foreground">{os.equipamento.modelo}</span>
              )}
            </div>
            <p className="text-sm leading-relaxed">{os.equipamento.problemaRelatado}</p>
            {os.equipamento.fotoBase64 && (
              <div className="pt-2">
                <img
                  src={os.equipamento.fotoBase64}
                  alt="Foto do equipamento"
                  className="rounded-lg w-full max-h-64 object-cover border"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Orçamento */}
      {os.orcamento && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm leading-relaxed">{os.orcamento.descricaoManutencao}</p>
            <p className="text-2xl font-bold">{formatarMoeda(Number(os.orcamento.valor))}</p>
            {os.orcamento.canalComunicacao && (
              <p className="text-sm text-muted-foreground">
                Comunicado via {CANAL_LABEL[os.orcamento.canalComunicacao] ?? os.orcamento.canalComunicacao}
              </p>
            )}
            {os.orcamento.dataDecisao && (
              <p className="text-sm text-muted-foreground">
                Decisão em {formatarData(os.orcamento.dataDecisao)} ·{" "}
                <span className={os.orcamento.aprovado ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {os.orcamento.aprovado ? "Aprovado" : "Reprovado"}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Avisos */}
      {os.avisos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Avisos ao Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {os.avisos.map((aviso) => (
              <div key={aviso.id} className="text-sm flex flex-wrap gap-2 items-start">
                <span className="text-muted-foreground text-xs">{formatarData(aviso.dataAviso)}</span>
                <span className="font-medium">{CANAL_LABEL[aviso.canal] ?? aviso.canal}</span>
                {aviso.observacao && (
                  <span className="text-muted-foreground">{aviso.observacao}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pagamento */}
      {os.pagamento && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-2xl font-bold">{formatarMoeda(Number(os.pagamento.valor))}</p>
            <p className="text-sm text-muted-foreground">
              {FORMA_PAGAMENTO_LABEL[os.pagamento.forma] ?? os.pagamento.forma} ·{" "}
              {formatarData(os.pagamento.dataPagamento)}
            </p>
            {os.pagamento.observacao && (
              <p className="text-sm">{os.pagamento.observacao}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
