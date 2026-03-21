import { z } from "zod"
import { FormaPagamento, CanalComunicacao } from "@prisma/client"

export const pagamentoSchema = z.object({
  forma: z.nativeEnum(FormaPagamento),
  valor: z
    .string()
    .min(1, "Valor obrigatório")
    .transform((v) => v.replace(",", "."))
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Valor deve ser positivo",
    }),
  observacao: z.string().optional(),
})

export const avisoSchema = z.object({
  canal: z.nativeEnum(CanalComunicacao),
  dataAviso: z.string().min(1, "Data do aviso obrigatória"),
  observacao: z.string().optional(),
})

export type PagamentoInput = z.infer<typeof pagamentoSchema>
export type AvisoInput = z.infer<typeof avisoSchema>
