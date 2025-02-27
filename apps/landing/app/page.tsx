"use client";

import Features from "@/components/Features";
import Hero from "@/components/Hero";
import FAQ from "@/components/FAQ/Content";
import Tutors from "@/components/Tutors";
import { AtlasProvider } from "@litespace/headless/atlas";

export default async function Home() {
  return (
    <AtlasProvider>
      <main>
        <Hero />
        <Features />
        <Tutors />
        <FAQ />
      </main>
    </AtlasProvider>
  );
}
