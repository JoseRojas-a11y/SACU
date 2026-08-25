import React, { useState } from 'react'
import { useProfesorStore } from '../store/useProfesorStore'
import '../styles/WeightCustomizer.css'
import { Sliders, Sparkles, ChevronDown, ChevronUp, Info, Plus, Minus, CheckCircle, GraduationCap, Award, HelpCircle } from 'lucide-react'

export const WeightCustomizer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true)
  const weights = useProfesorStore((state) => state.weights)
  const setWeight = useProfesorStore((state) => state.setWeight)
  const applyPreset = useProfesorStore((state) => state.applyPreset)

  const wEns = weights.ensenanza || 1
  const wEval = weights.evaluacion || 1
  const wDed = weights.dedicacion || 1
  const totalSum = wEns + wEval + wDed

  // Porcentajes relativos para visualización
  const pctEns = totalSum > 0 ? Math.round((wEns / totalSum) * 100) : 33
  const pctEval = totalSum > 0 ? Math.round((wEval / totalSum) * 100) : 33
  const pctDed = totalSum > 0 ? 100 - pctEns - pctEval : 34

  const handleStep = (key: 'ensenanza' | 'evaluacion' | 'dedicacion', delta: number) => {
    const current = weights[key] || 1
    setWeight(key, Math.max(1, Math.min(10, current + delta)))
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8 transition-all">
      {/* Header / Accordion trigger */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 bg-gradient-to-r from-purple-50/70 via-white to-slate-50 flex items-center justify-between cursor-pointer select-none border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Ponderación Personalizada de Docentes
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-100 text-[var(--theme-primary)] border border-purple-200">
                Suma de Pesos: {totalSum} pts
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Elige qué tanto te importa cada aspecto (del 1 al 10) para calcular tu promedio ponderado en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-medium hidden sm:inline">
            {isExpanded ? 'Ocultar controles' : 'Ajustar relevancia'}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Controls Area */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6 animate-fade-in">
          {/* Visual Distribution Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span>Impacto relativo en tu promedio ponderado</span>
              <span className="text-[11px] font-mono text-slate-400">Total: {totalSum} puntos</span>
            </div>
            <div className="weights-distribution-bar">
              <div
                style={{ width: `${pctEns}%` }}
                className="bg-[var(--theme-primary)] transition-all duration-200"
                title={`Enseñanza: ${pctEns}% (${wEns}/10)`}
              />
              <div
                style={{ width: `${pctEval}%` }}
                className="bg-amber-500 transition-all duration-200"
                title={`Evaluación & Accesibilidad: ${pctEval}% (${wEval}/10)`}
              />
              <div
                style={{ width: `${pctDed}%` }}
                className="bg-emerald-500 transition-all duration-200"
                title={`Dedicación & Soporte: ${pctDed}% (${wDed}/10)`}
              />
            </div>
          </div>

          {/* Interactive Steppers / Sliders 1-10 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Aspecto 1: Enseñanza */}
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-[var(--theme-primary)] flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Enseñanza</span>
                    <span className="text-[10px] text-purple-700 font-medium">Claridad y didáctica</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-[var(--theme-primary)] bg-white px-2 py-0.5 rounded-md border border-purple-200 shadow-xs">
                    {wEns} / 10
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                Metodología de clase, dominio del tema y facilidad para transmitir conocimientos.
              </p>

              {/* Number buttons (1 to 10 selector) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStep('ensenanza', -1)}
                    disabled={wEns <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-purple-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-purple-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Disminuir"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={wEns}
                    onChange={(e) => setWeight('ensenanza', parseInt(e.target.value, 10))}
                    className="weight-slider-input flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => handleStep('ensenanza', 1)}
                    disabled={wEns >= 10}
                    className="w-7 h-7 rounded-lg bg-white border border-purple-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-purple-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Aumentar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>1 (Poco importante)</span>
                  <span className="font-bold text-purple-700">Peso: {pctEns}%</span>
                  <span>10 (Crucial)</span>
                </div>
              </div>
            </div>

            {/* Aspecto 2: Evaluación & Accesibilidad */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Evaluación & Accesibilidad</span>
                    <span className="text-[10px] text-amber-700 font-medium">Justicia en exámenes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-200 shadow-xs">
                    {wEval} / 10
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                Criterios de calificación claros, exámenes acordes a lo enseñado y accesibilidad para aprobar.
              </p>

              {/* Number buttons (1 to 10 selector) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStep('evaluacion', -1)}
                    disabled={wEval <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-amber-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Disminuir"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={wEval}
                    onChange={(e) => setWeight('evaluacion', parseInt(e.target.value, 10))}
                    className="weight-slider-input flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => handleStep('evaluacion', 1)}
                    disabled={wEval >= 10}
                    className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-amber-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Aumentar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>1 (Poco importante)</span>
                  <span className="font-bold text-amber-700">Peso: {pctEval}%</span>
                  <span>10 (Crucial)</span>
                </div>
              </div>
            </div>

            {/* Aspecto 3: Dedicación & Soporte */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Dedicación & Soporte</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Puntualidad y asesoría</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-xs">
                    {wDed} / 10
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                Puntualidad en clases, retroalimentación constructiva y disposición de consulta fuera de aula.
              </p>

              {/* Number buttons (1 to 10 selector) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStep('dedicacion', -1)}
                    disabled={wDed <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-emerald-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-emerald-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Disminuir"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={wDed}
                    onChange={(e) => setWeight('dedicacion', parseInt(e.target.value, 10))}
                    className="weight-slider-input flex-1"
                  />

                  <button
                    type="button"
                    onClick={() => handleStep('dedicacion', 1)}
                    disabled={wDed >= 10}
                    className="w-7 h-7 rounded-lg bg-white border border-emerald-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-emerald-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Aumentar"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>1 (Poco importante)</span>
                  <span className="font-bold text-emerald-700">Peso: {pctDed}%</span>
                  <span>10 (Crucial)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Presets & Formula Explanation */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                Presets rápidos:
              </span>
              <button
                type="button"
                onClick={() => applyPreset('balanced')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-purple-100 hover:text-[var(--theme-primary)] text-slate-700 transition-colors cursor-pointer"
              >
                ⚖️ Equilibrado (10/10/10)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('teaching_first')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-purple-100 hover:text-[var(--theme-primary)] text-slate-700 transition-colors cursor-pointer"
              >
                🎓 Prioridad Enseñanza (10/5/5)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('evaluation_first')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-purple-100 hover:text-[var(--theme-primary)] text-slate-700 transition-colors cursor-pointer"
              >
                🎯 Prioridad Evaluación (5/10/5)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('high_dedication')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-purple-100 hover:text-[var(--theme-primary)] text-slate-700 transition-colors cursor-pointer"
              >
                ⏱️ Alta Dedicación (5/5/10)
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <Info className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              <span>Ponderado = (S₁·W₁ + S₂·W₂ + S₃·W₃) / {totalSum}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
