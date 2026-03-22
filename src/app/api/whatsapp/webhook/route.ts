import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.ARARA_WEBHOOK_SECRET
  if (!secret) return false
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")
  return expected === signature
}

type AraraEvent =
  | { event: "message.received"; data: { from: string; to: string; body: string; type: string; media_url?: string; sender_name: string } }
  | { event: "message.status_updated"; data: { messageId: string; status: string; errorDetails?: { code: string; whatHappened: string; howToAct: string } } }
  | { event: "template.updated"; data: { templateId: string; status: "APPROVED" | "REJECTED" } }

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-arara-signature") ?? ""

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: AraraEvent
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (payload.event === "message.received") {
    // Future: handle inbound customer replies
    console.log("[Arara] Mensagem recebida de", payload.data.from, ":", payload.data.body)
  }

  if (payload.event === "message.status_updated") {
    const { messageId, status, errorDetails } = payload.data
    console.log("[Arara] Status atualizado:", messageId, "→", status)
    if (errorDetails) {
      console.error("[Arara] Erro:", errorDetails.code, errorDetails.howToAct)
    }
  }

  if (payload.event === "template.updated") {
    console.log("[Arara] Template atualizado:", payload.data.templateId, "→", payload.data.status)
  }

  return NextResponse.json({ ok: true })
}
