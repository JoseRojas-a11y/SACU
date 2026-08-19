export function Footer() {
  return (
    <footer className="sacu-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-box">
            <img src="/logo-sacu.ico" alt="Logo SACU" />
          </div>
          <div>
            <span className="footer-brand-title">SACU</span>
            <span className="footer-brand-subtitle">Sistema Académico Unificado</span>
          </div>
        </div>

        <p className="footer-copyright">
          © {new Date().getFullYear()} SACU. Sistema Académico Unificado
        </p>
      </div>
    </footer>
  )
}
