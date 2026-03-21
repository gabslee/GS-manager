export const MOCK_SESSION = {
  user: {
    id: "usuario-mock",
    name: "Gerente Mock",
    email: "gerente@gseletrotecnica.com.br",
    perfil: "GERENTE" as "GERENTE" | "ATENDENTE",
    image: null,
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
}
