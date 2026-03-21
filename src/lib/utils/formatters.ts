import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function formatarData(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

export function formatarDataHora(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatarMoeda(valor: number | string): string {
  const n = typeof valor === "string" ? parseFloat(valor) : valor
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n)
}

export function formatarCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "")
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatarCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "")
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

export function formatarDocumento(documento: string, tipo: "PF" | "PJ"): string {
  if (tipo === "PF") return formatarCPF(documento)
  return formatarCNPJ(documento)
}

export function formatarTelefone(tel: string): string {
  const digits = tel.replace(/\D/g, "")
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}
