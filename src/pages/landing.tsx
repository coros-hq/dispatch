import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Templates } from "@/components/landing/Templates";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { OpenSource } from "@/components/landing/OpenSource";
import { Analytics } from "@vercel/analytics/react";

export function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Analytics />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Templates />
        <HowItWorks />
        <OpenSource />
      </main>
      <Footer />
    </div>
  );
}
