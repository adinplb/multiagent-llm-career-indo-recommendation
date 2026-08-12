export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-primary text-on-primary font-body-sm text-body-sm opacity-90 hover:opacity-100 transition-opacity">
      <div className="flex flex-col md:flex-row justify-between items-start px-md md:px-xl py-lg gap-md max-w-container-max mx-auto">
        <div className="flex flex-col gap-sm max-w-xs">
          <div className="font-headline-sm text-headline-sm font-bold text-on-primary flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary-container fill-icon">auto_awesome</span>
            Cerah AI
          </div>
          <p className="text-on-primary-container">
            © 2024 Cerah AI. Terhubung dengan Standar Kompetensi Kerja Nasional Indonesia (SKKNI).
          </p>
        </div>
        <div className="flex flex-wrap gap-md md:gap-lg">
          <a className="text-on-primary-container hover:text-secondary-container transition-colors" href="#">Tentang Kami</a>
          <a className="text-on-primary-container hover:text-secondary-container transition-colors" href="#">Kebijakan Privasi</a>
          <a className="text-on-primary-container hover:text-secondary-container transition-colors" href="#">Syarat &amp; Ketentuan</a>
          <a className="text-on-primary-container hover:text-secondary-container transition-colors" href="#">Kemitraan Kemnaker</a>
        </div>
      </div>
    </footer>
  );
}
