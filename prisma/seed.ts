import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const senhaHash = await bcrypt.hash("gs@2024", 12)

  await prisma.usuario.upsert({
    where: { email: "gerente@gseletrotecnica.com.br" },
    update: {},
    create: {
      nome: "Gerente GS",
      email: "gerente@gseletrotecnica.com.br",
      senha: senhaHash,
      perfil: "GERENTE",
    },
  })

  await prisma.usuario.upsert({
    where: { email: "atendente@gseletrotecnica.com.br" },
    update: {},
    create: {
      nome: "Atendente GS",
      email: "atendente@gseletrotecnica.com.br",
      senha: senhaHash,
      perfil: "ATENDENTE",
    },
  })

  console.log("Seed concluído.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
