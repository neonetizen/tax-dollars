"use client";

import { useState } from "react";

const HERO_IMAGE = "/hero-sd.jpg";

export function HeroHeader() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <header className="relative overflow-hidden">
      {!imgFailed && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden="true"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sd-navy/70 via-sd-blue/60 to-sd-baby/50" />
        </>
      )}

      {imgFailed && (
        <div className="absolute inset-0 bg-gradient-to-br from-sd-blue-bright via-sd-baby to-sd-sky-light" />
      )}

      <div className="relative flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="rounded-2xl bg-sd-navy/60 px-8 py-6 text-center text-white backdrop-blur-sm sm:px-12 sm:py-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">
            My Tax Dollars
          </h1>
          <p className="text-lg text-white/90">
            See exactly where your San Diego property taxes go
          </p>
        </div>
      </div>
    </header>
  );
}
