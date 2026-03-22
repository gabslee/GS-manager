"use client"

import { useState, useEffect } from "react"
import { Download, X, ZoomIn } from "lucide-react"

interface FotoEquipamentoProps {
  src: string
}

export function FotoEquipamento({ src }: FotoEquipamentoProps) {
  const [aberta, setAberta] = useState(false)

  useEffect(() => {
    if (!aberta) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberta(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [aberta])

  function handleDownload() {
    const a = document.createElement("a")
    a.href = src
    a.download = "foto-equipamento.jpg"
    a.click()
  }

  return (
    <>
      <div className="relative group cursor-pointer rounded-lg overflow-hidden border" onClick={() => setAberta(true)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Foto do equipamento" className="w-full max-h-64 object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>

      {aberta && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setAberta(false)}
        >
          {/* Botões */}
          <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleDownload}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Baixar foto"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => setAberta(false)}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Imagem */}
          <img
            src={src}
            alt="Foto do equipamento"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
