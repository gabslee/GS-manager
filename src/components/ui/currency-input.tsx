"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  name: string
  id?: string
  required?: boolean
  className?: string
  defaultValue?: string
}

export function CurrencyInput({ name, id, required, className, defaultValue }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => {
    if (!defaultValue) return ""
    const num = parseFloat(defaultValue)
    if (isNaN(num)) return ""
    return (num * 100).toFixed(0).padStart(3, "0")
  })

  const formatted = display
    ? (parseInt(display, 10) / 100).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : ""

  const rawValue = display ? (parseInt(display, 10) / 100).toFixed(2) : ""

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "")
    // limit to avoid overflow (max 999.999,99)
    setDisplay(digits.slice(0, 8))
  }

  return (
    <>
      <input type="hidden" name={name} value={rawValue} />
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
          R$
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          placeholder="0,00"
          required={required}
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-lg font-semibold ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
        />
      </div>
    </>
  )
}
