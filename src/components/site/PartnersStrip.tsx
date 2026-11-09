const PartnersStrip = () => {
  return (
    <section className="px-4 py-8" aria-label="شركاء التأمين">
      <div className="mx-auto max-w-md rounded-3xl bg-white px-6 py-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center justify-around gap-3">
            <span className="text-base font-bold text-brand-blue lowercase">amana</span>
            <span className="text-lg font-black text-brand-blue">GIG</span>
            <span className="text-sm font-bold text-brand-blue">MEDGULF</span>
          </div>
          <div className="h-12 w-px bg-border" aria-hidden />
          <div className="text-center">
            <div className="text-[10px] text-foreground/60">مصرّح من:</div>
            <div className="mt-1 text-base font-black text-brand-blue">
              IA <span className="text-[9px] font-medium">Insurance Authority</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;
