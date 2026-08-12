const FAQ_ITEMS = [
  {
    q: "Apa itu SKKNI dan mengapa penting?",
    a: "SKKNI (Standar Kompetensi Kerja Nasional Indonesia) adalah rumusan kemampuan kerja yang mencakup aspek pengetahuan, keterampilan, dan/atau keahlian serta sikap kerja yang relevan dengan pelaksanaan tugas dan syarat jabatan. Cerah AI menyelaraskan profil Anda dengan standar ini agar kompetensi Anda diakui secara nasional oleh industri.",
    open: true,
  },
  {
    q: "Bagaimana cara kerja 5 Multi-Agent AI?",
    a: "Sistem kami tidak mengandalkan satu model generik. Kami mendelegasikan tugas spesifik (analisis CV, riset pasar, pemetaan skill, pencarian kerja, valuasi gaji) ke agen AI yang dilatih khusus untuk tugas tersebut. Mereka kemudian 'berdiskusi' secara internal untuk merumuskan satu laporan Roadmap Karir yang komprehensif dan akurat untuk Anda.",
  },
  {
    q: "Apakah data CV saya aman?",
    a: "Sangat aman. Kami menerapkan enkripsi end-to-end standar industri. Data Anda hanya digunakan untuk keperluan analisis pemetaan karir Anda sendiri dan tidak pernah dijual kepada pihak ketiga tanpa persetujuan eksplisit Anda (misalnya saat Anda ingin profil Anda dilihat oleh rekruter).",
  },
  {
    q: "Apakah saya bisa membatalkan langganan kapan saja?",
    a: "Tentu saja. Anda dapat meningkatkan, menurunkan, atau membatalkan langganan paket Pro Anda kapan saja melalui halaman pengaturan akun. Tidak ada kontrak jangka panjang.",
  },
  {
    q: "Berapa lama waktu yang dibutuhkan untuk menghasilkan roadmap karir?",
    a: "Sistem AI kami bekerja secara real-time. Setelah Anda mengunggah CV atau menghubungkan profil LinkedIn, proses analisis komprehensif oleh ke-5 agen AI biasanya memakan waktu kurang dari 3 menit. Anda dapat melihat log eksekusinya secara langsung di Agent Lab.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="px-md md:px-xl max-w-3xl mx-auto mb-xl scroll-mt-24">
      <div className="text-center mb-lg">
        <h2 className="font-headline-md text-headline-md md:font-display-lg-mobile md:text-display-lg-mobile text-primary mb-xs">Pertanyaan Populer</h2>
      </div>
      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group border-b border-outline-variant/30 pb-4 cursor-pointer" open={item.open}>
            <summary className="flex justify-between items-center font-headline-sm text-headline-sm text-primary list-none [&::-webkit-details-marker]:hidden p-sm rounded-lg group-hover:bg-[#F0FDFF] group-open:bg-[#F0FDFF] transition-colors">
              {item.q}
              <span className="material-symbols-outlined text-primary transform group-open:rotate-180 transition-transform duration-300">expand_more</span>
            </summary>
            <div className="px-sm pt-sm font-body-md text-body-md text-on-surface-variant">{item.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
