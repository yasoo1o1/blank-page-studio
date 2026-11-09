import Header from "@/components/site/Header";
import HeroSection from "@/components/site/HeroSection";
import PartnersStrip from "@/components/site/PartnersStrip";
import SafePathSection from "@/components/site/SafePathSection";
import WhyBcareSection from "@/components/site/WhyBcareSection";
import SiteFooter from "@/components/site/SiteFooter";
import FloatingButtons from "@/components/site/FloatingButtons";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <PartnersStrip />
      <SafePathSection />
      <WhyBcareSection />
      <SiteFooter />
      <FloatingButtons />
    </main>
  );
};

export default Index;
