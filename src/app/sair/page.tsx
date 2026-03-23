import { signOut } from "../../../auth"

// Página server-side de logout.
// O middleware permite acesso (usuário está logado),
// a página chama signOut que apaga o cookie e redireciona para /login.
export default async function SairPage() {
  await signOut({ redirectTo: "/login" })
}
