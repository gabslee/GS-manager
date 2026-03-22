import { z } from "zod"
import { TipoEquipamento } from "@prisma/client"

export const equipamentoSchema = z.object({
  tipo: z.nativeEnum(TipoEquipamento),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  problemaRelatado: z.string().min(5, "Descreva o problema relatado"),
  foto: z.string().optional(),
})

export const novaOSSchema = z.object({
  clienteId: z.string().min(1, "Cliente obrigatório"),
  prazoPrometido: z.string().min(1, "Prazo prometido obrigatório"),
  observacoes: z.string().optional(),
  equipamento: equipamentoSchema,
})

export type NovaOSInput = z.infer<typeof novaOSSchema>
