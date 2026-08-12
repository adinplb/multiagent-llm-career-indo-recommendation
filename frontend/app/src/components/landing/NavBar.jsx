import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center px-md md:px-xl py-4 max-w-container-max mx-auto">
        <div className="font-headline-md text-headline-md font-bold text-primary tracking-tight flex items-center gap-xs">
          <span className="material-symbols-outlined text-secondary-container fill-icon text-3xl">auto_awesome</span>Cerah AI
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <a className="text-on-surface-variant hover:text-secondary transition-colors pb-1" href="#features">Fitur</a>
          <a className="text-on-surface-variant hover:text-secondary transition-colors pb-1" href="#agents">Agen</a>
          <a className="text-on-surface-variant hover:text-secondary transition-colors pb-1" href="#pricing">Harga</a>
          <a className="text-on-surface-variant hover:text-secondary transition-colors pb-1" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center">
          <Link
            to="/consent"
            className="inline-block bg-primary text-on-primary font-body-sm text-body-sm px-md py-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm"
          >
            Mulai Sekarang
          </Link>
        </div>
      </div>
    </header>
  );
}
