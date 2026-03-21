import { Badge } from "@/components/ui/badge"
import { StatusOS } from "@prisma/client"
import { STATUS_LABELS } from "@/lib/utils/status-machine"

const STATUS_COLOR: Record<StatusOS, string> = {
  ABERTA: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  AGUARDANDO_APROVACAO: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  APROVADA: "bg-green-100 text-green-800 hover:bg-green-100",
  PRONTA: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  PAGA: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  REPROVADA: "bg-red-100 text-red-800 hover:bg-red-100",
}

interface OSStatusBadgeProps {
  status: StatusOS
}

export function OSStatusBadge({ status }: OSStatusBadgeProps) {
  return (
    <Badge className={STATUS_COLOR[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}
