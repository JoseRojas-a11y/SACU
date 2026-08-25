import React, { useState, useRef, useEffect } from 'react'
import {
  CalendarRange,
  ExternalLink,
  Sparkles,
  X,
  ChevronUp,
  GraduationCap,
  Layers
} from 'lucide-react'

export interface ScheduleLinkOption {
  id: string
  name: string
  subtitle: string
  url: string
  badgeText: string
  gradient: string
  icon: string
}

import LogoSiga from '@/features/profesor/public/logo-siga.png'
import LogoIndex from '@/features/profesor/public/logo-index.png'

/**
 * Enlaces hardcodeados para los generadores de horarios disponibles.
 * Puedes añadir, quitar o modificar opciones directamente en este arreglo.
 */
const HARDCODED_SCHEDULE_LINKS: ScheduleLinkOption[] = [
  {
    id: 'siga',
    name: 'Portal SIGA (UNI)',
    subtitle: 'Generador de horarios del Portal SIGA',
    url: 'https://harrypc2023.github.io/portal-siga/horarios/generador.html',
    badgeText: 'SIGA',
    gradient: '',
    icon: LogoSiga
  },
  {
    id: 'index',
    name: 'Index UNI',
    subtitle: 'Simulador interactivo de matrícula',
    url: 'https://www.indexuni.site/dashboard',
    badgeText: 'INDEX',
    gradient: '',
    icon: LogoIndex
  }
]

export function ScheduleGeneratorWidget() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar el menú al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end font-sans select-none">
      {/* ========================================================================= */}
      {/* MENÚ DESPLEGABLE HACIA ARRIBA CON OPCIONES                                */}
      {/* ========================================================================= */}
      {!isMinimized && isOpen && (
        <div className="absolute bottom-full mb-3 right-0 w-80 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 text-white shadow-2xl shadow-purple-950/80 p-4 space-y-3 animate-fade-in transition-all z-50 overflow-hidden">
          {/* Resplandor ambiental de fondo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-pink-600/30 blur-lg pointer-events-none" />

          {/* Encabezado del Menú */}
          <div className="relative flex items-center justify-between pb-2.5 border-b border-purple-500/20">
            <div className="flex items-center gap-2">
              <div>
                <h4 className="text-xs font-black tracking-wide text-white">Selecciona el portal de tu preferencia</h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de enlaces hardcodeados con Nombre y Logo/Ícono */}
          <div className="relative space-y-2 max-h-72 overflow-y-auto pr-0.5">
            {HARDCODED_SCHEDULE_LINKS.map((item, index) => {
              const isFirst = index === 0
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenLink(item.url)}
                  className={`w-full group/item flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 cursor-pointer text-left relative overflow-hidden ${isFirst
                      ? 'bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-purple-900/60 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:border-purple-300'
                      : 'bg-slate-900/80 hover:bg-purple-950/70 border border-white/5 hover:border-purple-400/50'
                    }`}
                >
                  {/* Efecto de brillo de barrido (Shine Beam) para el primer item */}
                  {isFirst && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/15 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                  )}

                  {/* Borde sutil acentuado */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 transition-opacity ${isFirst
                        ? 'bg-gradient-to-b from-amber-400 via-purple-400 to-pink-500 opacity-100'
                        : 'bg-gradient-to-b from-purple-400 to-pink-500 opacity-0 group-hover/item:opacity-100'
                      }`}
                  />

                  {/* Logo / Insignia con gradiente propio */}
                  <div
                    className={`relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br ${item.gradient || 'from-purple-800 to-slate-900'
                      } shadow-md shrink-0 group-hover/item:scale-105 transition-transform ${isFirst ? 'ring-1 ring-purple-400/50' : ''
                      }`}
                  >
                    <img src={item.icon} alt={item.name} className="w-7 h-7 object-contain rounded-sm" />
                    <span className="absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded bg-slate-950 text-purple-200 border border-purple-400/30">
                      {item.badgeText}
                    </span>
                  </div>

                  {/* Información del enlace (Nombre y Subtítulo) */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold truncate ${isFirst ? 'text-white' : 'text-slate-100 group-hover/item:text-white'
                          }`}
                      >
                        {item.name}
                      </span>
                      {isFirst && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/30 text-amber-300 border border-amber-400/40 flex items-center gap-0.5 shrink-0 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 group-hover/item:text-purple-200/90 truncate">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Ícono de enlace externo */}
                  <ExternalLink
                    className={`w-3.5 h-3.5 group-hover/item:translate-x-0.5 transition-all shrink-0 ${isFirst
                        ? 'text-purple-300 group-hover/item:text-white'
                        : 'text-purple-400/70 group-hover/item:text-purple-200'
                      }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Nota al pie */}
          <div className="relative pt-2 border-t border-purple-500/20 text-[10px] text-center text-purple-300/60 font-medium">
            Servicios externos de generación de horarios
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRA O BOTÓN PRINCIPAL FLOTANTE                                          */}
      {/* ========================================================================= */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false)
            setIsOpen(true)
          }}
          title="Abrir Generadores de Horarios"
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 text-white shadow-xl shadow-purple-950/60 border border-white/20 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500" />
          </span>
          <CalendarRange className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
        </button>
      ) : (
        /* Widget principal con click para desplegar hacia arriba */
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative flex items-center gap-3 p-3 pl-3.5 pr-3.5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border text-white shadow-2xl shadow-purple-950/70 transition-all duration-300 cursor-pointer group/card ${isOpen ? 'border-purple-400/80 ring-2 ring-purple-500/40' : 'border-purple-500/30 hover:border-purple-400/60'
            }`}
        >
          {/* Resplandor ambiental de fondo */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl blur-sm opacity-35 group-hover/card:opacity-60 transition duration-500 pointer-events-none" />

          {/* Mini Logo / Ícono Badge Principal */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 text-white shadow-md shadow-purple-500/30 group-hover/card:scale-105 transition-transform duration-300 shrink-0">
            <CalendarRange className="w-5 h-5 text-white" />
            <Sparkles className="w-3 h-3 text-pink-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          {/* Leyenda y texto descriptivo */}
          <div className="relative flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wide bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent">
                Generador de Horarios
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Ver opciones" />
            </div>
            <span className="text-[10px] text-purple-200/80 font-medium flex items-center gap-1">
              Ver {HARDCODED_SCHEDULE_LINKS.length} opciones disponibles{' '}
            </span>
          </div>

          {/* Botón de despliegue hacia arriba */}
          <div
            className={`relative ml-0.5 p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 border border-purple-400/30 transition-all ${isOpen ? 'bg-purple-500/40 text-white' : ''
              }`}
          >
            <ChevronUp className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Botón de minimizar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(true)
              setIsOpen(false)
            }}
            className="relative -mr-1 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Minimizar widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
