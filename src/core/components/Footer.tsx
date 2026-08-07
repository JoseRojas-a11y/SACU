export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shadow-xs"
            style={{ background: 'linear-gradient(135deg, #4f73ff, #818cf8)', color: 'white' }}
          >
            P
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900">SACU</span>
            <span className="text-xs text-gray-400 ml-2">Sistema Académico Unificado</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 font-medium text-center sm:text-right">
          © {new Date().getFullYear()} SACU. Todos los derechos reservados. Desarrollado con FastAPI + React + PostgreSQL.
        </p>
      </div>
    </footer>
  )
}
