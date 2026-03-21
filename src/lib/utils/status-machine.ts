import { StatusOS } from "@prisma/client"

type Transicao = {
  de: StatusOS[]
  para: StatusOS
}

const TRANSICOES: Transicao[] = [
  { de: ["ABERTA"], para: "AGUARDANDO_APROVACAO" },
  { de: ["AGUARDANDO_APROVACAO"], para: "APROVADA" },
  { de: ["AGUARDANDO_APROVACAO"], para: "REPROVADA" },
  { de: ["APROVADA"], para: "PRONTA" },
  { de: ["PRONTA"], para: "PAGA" },
]

export function podeTransicionar(atual: StatusOS, destino: StatusOS): boolean {
  return TRANSICOES.some((t) => t.de.includes(atual) && t.para === destino)
}

export function assertTransicao(atual: StatusOS, destino: StatusOS): void {
  if (!podeTransicionar(atual, destino)) {
    throw new Error(`Transição inválida: ${atual} → ${destino}`)
  }
}

export const STATUS_TERMINAIS: StatusOS[] = ["PAGA", "REPROVADA"]

export function isTerminal(status: StatusOS): boolean {
  return STATUS_TERMINAIS.includes(status)
}

export const STATUS_LABELS: Record<StatusOS, string> = {
  ABERTA: "Aberta",
  AGUARDANDO_APROVACAO: "Aguardando Aprovação",
  APROVADA: "Aprovada",
  PRONTA: "Pronta",
  PAGA: "Paga",
  REPROVADA: "Reprovada",
}
