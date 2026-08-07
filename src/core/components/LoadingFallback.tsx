import React from 'react'

export const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-25"></div>
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-slate-600 font-medium animate-pulse">Cargando módulo de la aplicación...</p>
    </div>
  )
}
