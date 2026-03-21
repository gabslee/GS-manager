import { z } from "zod"

export const clienteSchema = z.object({
  tipo: z.enum(["PF", "PJ"]),
  documento: z
    .string()
    .min(1, "Documento obrigatório")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11 || v.length === 14, {
      message: "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos",
    }),
  nome: z.string().min(2, "Nome obrigatório"),
  telefone: z
    .string()
    .min(1, "Telefone obrigatório")
    .transform((v) => v.replace(/\D/g, "")),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
})

export type ClienteInput = z.infer<typeof clienteSchema>
