import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <section id="pricing" className="px-md md:px-xl max-w-container-max mx-auto mb-xl scroll-mt-24">
      <div className="text-center mb-lg">
        <h2 className="font-headline-md text-headline-md md:font-display-lg-mobile md:text-display-lg-mobile text-primary mb-xs">Pilihan Paket Harga</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Investasi terbaik untuk masa depan karir Anda yang lebih terarah.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface border border-outline-variant/50 rounded-xl p-md flex flex-col hover:border-outline-variant transition-colors">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">Starter</h3>
          <div className="font-display-lg-mobile text-display-lg-mobile text-primary mb-sm">Gratis</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md border-b border-outline-variant/20 pb-sm">Cocok untuk pemula yang ingin mencoba sistem pemetaan dasar.</p>
          <ul className="space-y-sm flex-grow mb-lg font-body-sm text-body-sm text-on-surface">
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> 1x Pemetaan SKKNI Dasar</li>
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> Analisis CV Terbatas</li>
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-outline text-sm">remove</span> Roadmap Karir Detail</li>
          </ul>
          <Link to="/consent" className="block text-center bg-surface-container-high text-primary font-headline-sm text-headline-sm px-md py-sm rounded-lg hover:bg-surface-container-highest transition-colors w-full">
            Mulai Gratis
          </Link>
        </div>
        <div className="bg-primary border border-primary-container rounded-xl p-md flex flex-col relative transform md:-translate-y-2 shadow-lg">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary-container text-primary font-label-caps text-label-caps px-sm py-xs rounded-full uppercase tracking-wider">
            Paling Populer
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-primary mb-xs">Pro</h3>
          <div className="font-display-lg-mobile text-display-lg-mobile text-on-primary mb-sm">
            Rp 99.000<span className="text-body-md font-body-md text-on-primary-container">/bln</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-primary-container mb-md border-b border-primary-container pb-sm">Akses penuh ke semua 5 agen AI untuk perencanaan karir matang.</p>
          <ul className="space-y-sm flex-grow mb-lg font-body-sm text-body-sm text-on-primary">
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> Pemetaan SKKNI Komprehensif</li>
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> Analisis &amp; Optimasi CV Unlimited</li>
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> Roadmap Karir Interaktif</li>
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> Live Job Scouting</li>
          </ul>
          <Link to="/consent" className="block text-center bg-secondary-container text-primary font-headline-sm text-headline-sm px-md py-sm rounded-lg hover:bg-secondary-fixed-dim transition-colors w-full">
            Berlangganan Pro
          </Link>
        </div>
        <div className="bg-surface border border-outline-variant/50 rounded-xl p-md flex flex-col hover:border-outline-variant transition-colors">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">Institusi</h3>
          <div className="font-display-lg-mobile text-display-lg-mobile text-primary mb-sm">Kustom</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-md border-b border-outline-variant/20 pb-sm">Untuk universitas dan LPK yang ingin mengelola ratusan talenta.</p>
          <ul className="space-y-sm flex-grow mb-lg font-body-sm text-body-sm text-on-surface">
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> Dashboard Analytics Organisasi</li>
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> API Integration</li>
            <li className="flex items-center gap-sm"><span className="material-symbols-outlined text-secondary-container text-sm">check_circle</span> Dedicated Support Account</li>
          </ul>
          <a href="#contact" className="block text-center bg-surface-container-high text-primary font-headline-sm text-headline-sm px-md py-sm rounded-lg hover:bg-surface-container-highest transition-colors w-full">
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
}
