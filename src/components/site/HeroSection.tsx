import { useState } from "react";
import InsuranceTabs, { TabKey } from "./InsuranceTabs";
import QuoteForm from "./QuoteForm";
import banner from "@/assets/genesis-banner.jpg.asset.json";
import { useDesktopSite } from "@/hooks/use-desktop-site";

const DESKTOP_FRAME_WIDTH = 1120;

const HeroSection = () => {
  const [tab, setTab] = useState<TabKey>("car");
  const { isDesktopSite, scale } = useDesktopSite();

  if (isDesktopSite) {
    return (
      <section className="relative overflow-hidden bg-background">
        <div className="px-1 pb-6">
          <div className="mx-auto w-[1120px]" style={{ zoom: scale }}>
            <img src={banner.url} alt="أمّن وادخل السحب على 3 سيارات جينيسيس وكاش باك 100%" className="block w-full" />

            <div>
              <div className="mx-auto max-w-[1120px] bg-transparent pt-0 shadow-none">
                <InsuranceTabs active={tab} onChange={setTab} desktopSite />
              </div>
            </div>

            <div className="bg-white px-0 pb-6 pt-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="mx-auto max-w-[1100px]">
                <QuoteForm desktopSite />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative lg:bg-muted/30">
      <img src={banner.url} alt="أمّن وادخل السحب على 3 سيارات جينيسيس وكاش باك 100%" className="mx-auto block w-full max-w-[420px] lg:max-w-[1120px]" />

      {/* Tabs strip — sits flush below hero on desktop, right-aligned, no card */}
      <div className="-mt-4 relative px-5 lg:mt-0 lg:px-0">
        <div className="mx-auto max-w-[420px] rounded-t-[24px] bg-white pt-2 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] lg:max-w-[1120px] lg:rounded-none lg:bg-transparent lg:pt-0 lg:shadow-none">
          <InsuranceTabs active={tab} onChange={setTab} />
        </div>
        <div className="mx-auto h-2 max-w-[380px] bg-muted/40 lg:hidden" />
      </div>

      {/* Form — flat bar on desktop, no card border */}
      <div className="bg-muted/40 px-5 pb-6 pt-0 lg:bg-white lg:px-0 lg:pb-6 lg:pt-1 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-[420px] lg:max-w-[1100px]">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
