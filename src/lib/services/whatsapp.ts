const ARARA_API_URL = "https://api.ararahq.com/api/v1"

function normalizePhone(telefone: string): string {
  const digits = telefone.replace(/\D/g, "")
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`
  return `whatsapp:+${withCountry}`
}

export async function enviarMensagemOSPronta(params: {
  telefone: string
  clienteNome: string
  equipamentoTipo: string
  osNumero: string
}): Promise<{ messageId: string } | { error: string }> {
  if (process.env.ARARA_ENABLED !== "true") {
    return { error: "Integração Arara desativada" }
  }

  const apiKey = process.env.ARARA_API_KEY
  if (!apiKey) return { error: "ARARA_API_KEY não configurada" }

  const { telefone, clienteNome, equipamentoTipo, osNumero } = params
  const templateName = process.env.ARARA_TEMPLATE_OS_PRONTA ?? "os_pronta"
  const receiver = normalizePhone(telefone)

  const tipoFormatado = equipamentoTipo
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())

  let response: Response
  try {
    response = await fetch(`${ARARA_API_URL}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiver,
        templateName,
        variables: [clienteNome, tipoFormatado, osNumero],
      }),
    })
  } catch (err) {
    return { error: `Erro de rede: ${err instanceof Error ? err.message : err}` }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    return { error: (body as { message?: string }).message ?? `Erro HTTP ${response.status}` }
  }

  const data = (await response.json()) as { id: string }
  return { messageId: data.id }
}
