import { IS_MOCK } from "./mock/data"

/**
 * Retorna a sessão do usuário.
 * Em modo mock, retorna uma sessão fake sem tocar no banco.
 * Em modo real, usa NextAuth auth().
 */
export async function getSession() {
  if (IS_MOCK) {
    const { MOCK_SESSION } = await import("./mock/session")
    return MOCK_SESSION
  }
  const { auth } = await import("../../auth")
  return auth()
}
