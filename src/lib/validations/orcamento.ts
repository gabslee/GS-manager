import { z } from "zod"
import { CanalComunicacao } from "@prisma/client"

export const orcamentoSchema = z.object({
  descricaoManutencao: z.string().min(5, "Descrição obrigatória"),
  valor: z
    .string()
    .min(1, "Valor obrigatório")
    .transform((v) => v.replace(",", "."))
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Valor deve ser positivo",
    }),
  canalComunicacao: z.nativeEnum(CanalComunicacao),
})

export const decisaoSchema = z.object({
  aprovado: z.enum(["true", "false"]),
  dataDecisao: z.string().min(1, "Data da decisão obrigatória"),
})

export type OrcamentoInput = z.infer<typeof orcamentoSchema>
export type DecisaoInput = z.infer<typeof decisaoSchema>
