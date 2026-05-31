"use client";

import { useEffect, useState } from "react";
import { ReactFlux, useFlux } from "@knguyen1411b/flux";

// Interactive navigation component
function Navigation() {
    const flux = useFlux();

    const handleScrollTo = (selector: string) => {
        flux?.scrollTo(selector);
    };

    return (
        <nav
            aria-label="Main Navigation"
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex gap-6 justify-center items-center shadow-2xl"
        >
            <span className="text-sm font-black tracking-wider bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mr-2">
                FLUX
            </span>
            <button
                onClick={() => handleScrollTo("#hero")}
                aria-label="Scroll to Home"
                className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
                Home
            </button>
            <button
                onClick={() => handleScrollTo("#horizontal")}
                aria-label="Scroll to Horizontal Scroll Showcase"
                className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
                Horizontal
            </button>
            <button
                onClick={() => handleScrollTo("#features")}
                aria-label="Scroll to Features"
                className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
                Features
            </button>
        </nav>
    );
}

// Real-time scrolling telemetry dashboard
function ScrollTelemetry() {
    const flux = useFlux();
    const [telemetry, setTelemetry] = useState({ scroll: 0, progress: 0 });

    useEffect(() => {
        if (!flux) return;

        const handleScroll = (data: { scroll: number; progress: number }) => {
            setTelemetry({
                scroll: Math.round(data.scroll),
                progress: Math.round(data.progress * 100)
            });
        };

        flux.on("scroll", handleScroll);
        return () => {
            flux.off("scroll", handleScroll);
        };
    }, [flux]);

    return (
        <div
            aria-label="Scroll Telemetry Dashboard"
            className="fixed bottom-6 left-6 z-50 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl flex flex-col gap-1 text-xs font-mono shadow-2xl min-w-[140px]"
        >
            <div className="flex justify-between gap-4">
                <span className="text-slate-400">Position:</span>
                <span className="text-purple-400 font-bold">
                    {telemetry.scroll}px
                </span>
            </div>
            <div className="flex justify-between gap-4">
                <span className="text-slate-400">Progress:</span>
                <span className="text-pink-400 font-bold">
                    {telemetry.progress}%
                </span>
            </div>
        </div>
    );
}

export default function Home() {
    return (
        <ReactFlux root options={{ lerp: 0.08, wheelMultiplier: 1.0 }}>
            {/* Navigation */}
            <Navigation />

            {/* Real-time Stats */}
            <ScrollTelemetry />

            <main className="bg-slate-950 text-slate-100 min-h-screen">
                {/* Section 1: Hero */}
                <section
                    id="hero"
                    className="relative h-screen flex flex-col items-center justify-center border-b border-white/5 overflow-hidden"
                >
                    {/* Decorative glow backdrop */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-center bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent px-4">
                        Flux Engine
                    </h1>
                    <p className="mt-6 text-slate-400 text-lg md:text-xl text-center max-w-xl px-4 leading-relaxed font-medium">
                        A performant, lightweight, and frame-rate independent
                        smooth scroll library tailored for Next.js & React.
                    </p>

                    <div className="absolute bottom-10 flex flex-col items-center gap-2 pointer-events-none animate-bounce">
                        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                            Scroll Down
                        </span>
                        <svg
                            className="w-4 h-4 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </section>

                {/* Section 2: Horizontal Scrolling */}
                <section
                    id="horizontal"
                    className="h-screen flex flex-col items-center justify-center border-b border-white/5 bg-slate-900/30 px-6"
                >
                    <div className="max-w-4xl w-full">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight text-center">
                            Horizontal Scroll Container
                        </h2>
                        <p className="mt-2 text-slate-400 text-sm text-center mb-8">
                            Scroll normally inside this container using your
                            vertical scroll wheel.
                        </p>

                        {/* Horizontal scroll container managed by nested ReactFlux */}
                        <ReactFlux
                            root={false}
                            options={{ direction: "horizontal", lerp: 0.1 }}
                            className="w-full h-72 border border-white/10 rounded-2xl bg-slate-900/50 shadow-inner"
                        >
                            <div className="flex gap-6 p-6 h-full w-[1600px] items-center">
                                <div className="flex-shrink-0 w-80 h-full bg-gradient-to-br from-purple-900/40 to-slate-900 border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                                    <span className="text-2xl font-black text-white/10">
                                        01
                                    </span>
                                    <p className="text-slate-300 font-semibold">
                                        Fully modular architecture
                                    </p>
                                </div>
                                <div className="flex-shrink-0 w-80 h-full bg-gradient-to-br from-pink-900/40 to-slate-900 border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                                    <span className="text-2xl font-black text-white/10">
                                        02
                                    </span>
                                    <p className="text-slate-300 font-semibold">
                                        Native LERP physics mapping
                                    </p>
                                </div>
                                <div className="flex-shrink-0 w-80 h-full bg-gradient-to-br from-blue-900/40 to-slate-900 border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                                    <span className="text-2xl font-black text-white/10">
                                        03
                                    </span>
                                    <p className="text-slate-300 font-semibold">
                                        Multi-axis gesture translation
                                    </p>
                                </div>
                                <div className="flex-shrink-0 w-80 h-full bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-white/5 rounded-xl p-6 flex flex-col justify-between">
                                    <span className="text-2xl font-black text-white/10">
                                        04
                                    </span>
                                    <p className="text-slate-300 font-semibold">
                                        Full mobile touch momentum support
                                    </p>
                                </div>
                            </div>
                        </ReactFlux>
                    </div>
                </section>

                {/* Section 3: Features */}
                <section
                    id="features"
                    className="min-h-screen py-24 px-6 flex flex-col items-center justify-center"
                >
                    <div className="max-w-4xl w-full">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight text-center mb-16">
                            Designed for Web Creators
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition duration-300">
                                <h3 className="text-lg font-bold text-white mb-2">
                                    SSR Compatible
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Engineered to be completely safe during
                                    Server-Side Rendering. No document or window
                                    object calls at module load time.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition duration-300">
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Frame-Rate Independent
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Smooth animation LERP values auto-adjust
                                    depending on screen refresh rate, giving
                                    equal experiences on 60Hz and 144Hz+.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition duration-300">
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Accessibility Minded
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Automatically tracks user media query
                                    settings and halts scroll physics when
                                    reduced-motion preferences are checked.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition duration-300">
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Ultra Lightweight
                                </h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Compiled directly into micro ESM and CJS
                                    bundles with zero external dependencies to
                                    keep your vendor bundle size minimal.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </ReactFlux>
    );
}
