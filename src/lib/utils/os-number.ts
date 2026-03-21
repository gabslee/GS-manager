import { PrismaClient } from "@prisma/client"

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

export async function gerarNumeroOS(tx: TxClient): Promise<string> {
  const ano = new Date().getFullYear()

  await tx.$executeRaw`
    INSERT INTO os_counter (ano, ultimo)
    VALUES (${ano}, 0)
    ON CONFLICT (ano) DO NOTHING
  `

  await tx.$executeRaw`
    UPDATE os_counter
    SET ultimo = ultimo + 1
    WHERE ano = ${ano}
  `

  const row = await tx.oSCounter.findUniqueOrThrow({ where: { ano } })
  const sequencial = String(row.ultimo).padStart(4, "0")
  return `OS-${ano}-${sequencial}`
}
