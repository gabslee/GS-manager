import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("❌ DATABASE_URL não definida")
    process.exit(1)
  }

  console.log("✅ DATABASE_URL encontrada")

  const adapter = new PrismaPg({ connectionString: url })
  const prisma = new PrismaClient({ adapter })

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: "gerente@gseletrotecnica.com.br", ativo: true },
    })

    if (!usuario) {
      console.error("❌ Usuário não encontrado no banco")
      return
    }

    console.log("✅ Usuário encontrado:", usuario.nome, usuario.perfil)
    console.log("   Hash armazenado:", usuario.senha.substring(0, 20) + "...")

    const valid = await bcrypt.compare("gs@2024", usuario.senha)
    console.log(valid ? "✅ Senha correta" : "❌ Senha incorreta — hash não bate")
  } catch (err) {
    console.error("❌ Erro ao conectar no banco:", err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
