import {
  clientes,
  ordens,
  equipamentos,
  orcamentos,
  avisos,
  pagamentos,
  proximoNumeroOS,
  cuid,
  type MockOS,
} from "./data"
import { assertTransicao } from "@/lib/utils/status-machine"
import { StatusOS, TipoEquipamento, CanalComunicacao, FormaPagamento } from "@prisma/client"

// ── criarCliente ──────────────────────────────────────────────────────────────
export async function mockCriarCliente(formData: FormData) {
  const documento = (formData.get("documento") as string).replace(/\D/g, "")
  const existing = clientes.find((c) => c.documento === documento)
  if (existing) return { error: "Documento já cadastrado" }

  const id = cuid()
  clientes.push({
    id,
    tipo: formData.get("tipo") as string,
    documento,
    nome: formData.get("nome") as string,
    telefone: (formData.get("telefone") as string).replace(/\D/g, ""),
    email: (formData.get("email") as string) || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const novoCliente = clientes[clientes.length - 1]
  return {
    success: true,
    clienteId: id,
    nome: novoCliente.nome,
    telefone: novoCliente.telefone,
    tipo: novoCliente.tipo,
    documento: novoCliente.documento,
  }
}

// ── atualizarCliente ──────────────────────────────────────────────────────────
export async function mockAtualizarCliente(id: string, formData: FormData) {
  const idx = clientes.findIndex((c) => c.id === id)
  if (idx === -1) return { error: "Cliente não encontrado" }

  clientes[idx] = {
    ...clientes[idx],
    tipo: formData.get("tipo") as string,
    documento: (formData.get("documento") as string).replace(/\D/g, ""),
    nome: formData.get("nome") as string,
    telefone: (formData.get("telefone") as string).replace(/\D/g, ""),
    email: (formData.get("email") as string) || null,
    updatedAt: new Date(),
  }

  return { success: true }
}

// ── abrirOS ───────────────────────────────────────────────────────────────────
export async function mockAbrirOS(formData: FormData) {
  const clienteId = formData.get("clienteId") as string
  if (!clienteId) return { error: "Cliente obrigatório" }

  const prazoStr = formData.get("prazoPrometido") as string
  if (!prazoStr) return { error: "Prazo obrigatório" }

  const osId = cuid()
  const numero = proximoNumeroOS()

  const novaOS: MockOS = {
    id: osId,
    numero,
    status: "ABERTA",
    prazoPrometido: new Date(prazoStr),
    observacoes: (formData.get("observacoes") as string) || null,
    clienteId,
    usuarioId: "usuario-mock",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  ordens.unshift(novaOS)

  equipamentos.push({
    id: cuid(),
    osId,
    tipo: formData.get("equipamento.tipo") as TipoEquipamento,
    marca: (formData.get("equipamento.marca") as string) || null,
    modelo: (formData.get("equipamento.modelo") as string) || null,
    problemaRelatado: formData.get("equipamento.problemaRelatado") as string,
    createdAt: new Date(),
  })

  return { success: true, osId, numero }
}

// ── lancarOrcamento ───────────────────────────────────────────────────────────
export async function mockLancarOrcamento(osId: string, formData: FormData) {
  const idx = ordens.findIndex((o) => o.id === osId)
  if (idx === -1) return { error: "OS não encontrada" }

  assertTransicao(ordens[idx].status, "AGUARDANDO_APROVACAO")

  orcamentos.push({
    id: cuid(),
    osId,
    descricaoManutencao: formData.get("descricaoManutencao") as string,
    valor: parseFloat((formData.get("valor") as string).replace(",", ".")),
    aprovado: null,
    dataDecisao: null,
    canalComunicacao: formData.get("canalComunicacao") as CanalComunicacao,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  ordens[idx] = { ...ordens[idx], status: "AGUARDANDO_APROVACAO", updatedAt: new Date() }

  return { success: true }
}

// ── registrarDecisao ──────────────────────────────────────────────────────────
export async function mockRegistrarDecisao(osId: string, formData: FormData) {
  const idx = ordens.findIndex((o) => o.id === osId)
  if (idx === -1) return { error: "OS não encontrada" }

  const aprovado = formData.get("aprovado") === "true"
  const novoStatus: StatusOS = aprovado ? "APROVADA" : "REPROVADA"

  assertTransicao(ordens[idx].status, novoStatus)

  const orcIdx = orcamentos.findIndex((o) => o.osId === osId)
  if (orcIdx !== -1) {
    orcamentos[orcIdx] = {
      ...orcamentos[orcIdx],
      aprovado,
      dataDecisao: new Date(formData.get("dataDecisao") as string),
      updatedAt: new Date(),
    }
  }

  ordens[idx] = { ...ordens[idx], status: novoStatus, updatedAt: new Date() }

  return { success: true }
}

// ── marcarPronta ──────────────────────────────────────────────────────────────
export async function mockMarcarPronta(osId: string, formData: FormData) {
  const idx = ordens.findIndex((o) => o.id === osId)
  if (idx === -1) return { error: "OS não encontrada" }

  assertTransicao(ordens[idx].status, "PRONTA")

  avisos.push({
    id: cuid(),
    osId,
    canal: formData.get("canal") as CanalComunicacao,
    dataAviso: new Date(formData.get("dataAviso") as string),
    observacao: (formData.get("observacao") as string) || null,
    createdAt: new Date(),
  })

  ordens[idx] = { ...ordens[idx], status: "PRONTA", updatedAt: new Date() }

  return { success: true }
}

// ── registrarPagamento ────────────────────────────────────────────────────────
export async function mockRegistrarPagamento(osId: string, formData: FormData) {
  const idx = ordens.findIndex((o) => o.id === osId)
  if (idx === -1) return { error: "OS não encontrada" }

  assertTransicao(ordens[idx].status, "PAGA")

  pagamentos.push({
    id: cuid(),
    osId,
    forma: formData.get("forma") as FormaPagamento,
    valor: parseFloat((formData.get("valor") as string).replace(",", ".")),
    dataPagamento: new Date(),
    observacao: (formData.get("observacao") as string) || null,
    createdAt: new Date(),
  })

  ordens[idx] = { ...ordens[idx], status: "PAGA", updatedAt: new Date() }

  return { success: true }
}
