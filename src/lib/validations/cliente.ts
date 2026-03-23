import { z } from "zod"

export const clienteSchema = z
  .object({
    tipo: z.enum(["PF", "PJ"]),
    documento: z.string().transform((v) => v.replace(/\D/g, "")),
    nome: z.string().min(2, "Nome obrigatório"),
    telefone: z
      .string()
      .min(1, "Telefone obrigatório")
      .transform((v) => v.replace(/\D/g, "")),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const doc = data.documento
    if (data.tipo === "PJ" && doc.length !== 14) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ deve ter 14 dígitos",
        path: ["documento"],
      })
    }
    if (data.tipo === "PF" && doc.length > 0 && doc.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF deve ter 11 dígitos",
        path: ["documento"],
      })
    }
  })

export type ClienteInput = z.infer<typeof clienteSchema>
