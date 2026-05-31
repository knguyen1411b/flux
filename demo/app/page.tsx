"use client";

import { useEffect, useState } from "react";
import { ReactFlux, useFlux } from "@knguyen1411b/flux";
import { Copy, Check, Terminal, Code, Cpu, Sparkles } from "lucide-react";

// Token-based regex syntax highlighter for clean, zero-bloat code rendering
function highlightCode(code: string, lang: string) {
    const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    if (lang === "bash" || lang === "sh") {
        return escaped
            .replace(
                /(pnpm add|npm install|yarn add|pnpm i|npm i)/g,
                '<span class="text-emerald-400 font-bold">$1</span>'
            )
            .replace(
                /(@knguyen1411b\/flux)/g,
                '<span class="text-purple-400">$1</span>'
            );
    }

    return (
        escaped
            // Comments
            .replace(
                /(\/\/.*)/g,
                '<span class="text-slate-500 font-normal">$1</span>'
            )
            // Keywords
            .replace(
                /\b(import|from|export|default|function|const|return|let|new|typeof|if|else|interface|private|public|get|set|class|extends)\b/g,
                '<span class="text-pink-400 font-semibold">$1</span>'
            )
            // JSX Components & Tags
            .replace(
                /(&lt;\/?[A-Z][a-zA-Z0-9]*|&lt;\/?[a-z][a-zA-Z0-9]*)/g,
                '<span class="text-purple-400 font-semibold">$1</span>'
            )
            .replace(
                /(&gt;)/g,
                '<span class="text-purple-400 font-semibold">$1</span>'
            )
            // Function calls / React Hooks
            .replace(
                /\b(useFlux|useState|useEffect|scrollTo|destroy|ReactFlux|Flux|connectedCallback)\b/g,
                '<span class="text-blue-400 font-medium">$1</span>'
            )
            // String literals
            .replace(
                /(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g,
                '<span class="text-emerald-400">$1</span>'
            )
    );
}

// Copyable custom code block component
function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative border border-white/10 rounded-xl bg-slate-900/60 backdrop-blur-md overflow-hidden text-sm font-mono my-4 shadow-xl">
            <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-slate-950/40 text-xs text-slate-400">
                <span className="font-semibold text-slate-500">
                    {language.toUpperCase()}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 hover:text-white transition cursor-pointer text-slate-400"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed">
                <code
                    dangerouslySetInnerHTML={{
                        __html: highlightCode(code, language)
                    }}
                />
            </pre>
        </div>
    );
}

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
                onClick={() => handleScrollTo("#docs")}
                aria-label="Scroll to Documentation"
                className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
                Documentation
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
    const [activeTab, setActiveTab] = useState<
        "install" | "react" | "vanilla" | "gsap"
    >("install");

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

                {/* Section 3: Documentation */}
                <section
                    id="docs"
                    className="min-h-screen py-24 px-6 border-b border-white/5 flex flex-col items-center justify-center bg-slate-900/10"
                >
                    <div className="max-w-4xl w-full">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight text-center">
                            Documentation & Guides
                        </h2>
                        <p className="mt-2 text-slate-400 text-sm text-center mb-12">
                            Setup and usage instructions for React/Next.js and
                            Vanilla JS.
                        </p>

                        {/* Tab buttons */}
                        <div className="flex border-b border-white/10 gap-2 mb-8 overflow-x-auto pb-px">
                            <button
                                onClick={() => setActiveTab("install")}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                                    activeTab === "install"
                                        ? "border-purple-500 text-white"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Terminal className="w-4 h-4" />
                                Installation
                            </button>
                            <button
                                onClick={() => setActiveTab("react")}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                                    activeTab === "react"
                                        ? "border-purple-500 text-white"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Code className="w-4 h-4" />
                                React / Next.js
                            </button>
                            <button
                                onClick={() => setActiveTab("vanilla")}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                                    activeTab === "vanilla"
                                        ? "border-purple-500 text-white"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Cpu className="w-4 h-4" />
                                Vanilla / Custom Element
                            </button>
                            <button
                                onClick={() => setActiveTab("gsap")}
                                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
                                    activeTab === "gsap"
                                        ? "border-purple-500 text-white"
                                        : "border-transparent text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                GSAP ScrollTrigger
                            </button>
                        </div>

                        {/* Tab panels */}
                        <div className="min-h-[400px]">
                            {activeTab === "install" && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Install Package
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Add the package to your React, Next.js,
                                        or HTML static project.
                                    </p>
                                    <CodeBlock
                                        code="pnpm add @knguyen1411b/flux"
                                        language="bash"
                                    />
                                    <CodeBlock
                                        code="npm install @knguyen1411b/flux"
                                        language="bash"
                                    />
                                </div>
                            )}

                            {activeTab === "react" && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        React & Next.js Integration
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Wrap your layout using `ReactFlux`. You
                                        can read the active instance using the
                                        `useFlux` hook.
                                    </p>
                                    <h4 className="text-sm font-bold text-purple-400 mb-2">
                                        1. Layout Setup (`layout.tsx`)
                                    </h4>
                                    <CodeBlock
                                        code={`"use client";\n\nimport { ReactFlux } from "@knguyen1411b/flux";\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="en">\n      <body>\n        <ReactFlux root options={{ lerp: 0.08 }}>\n          {children}\n        </ReactFlux>\n      </body>\n    </html>\n  );\n}`}
                                        language="tsx"
                                    />
                                    <h4 className="text-sm font-bold text-purple-400 mt-6 mb-2">
                                        2. Controlling Scroll inside components
                                        (`useFlux`)
                                    </h4>
                                    <CodeBlock
                                        code={`"use client";\n\nimport { useFlux } from "@knguyen1411b/flux";\n\nexport default function ScrollButton() {\n  const flux = useFlux();\n\n  return (\n    <button onClick={() => flux?.scrollTo("#dest")}>\n      Scroll to Destination\n    </button>\n  );\n}`}
                                        language="tsx"
                                    />
                                </div>
                            )}

                            {activeTab === "vanilla" && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Vanilla JS & Custom Elements
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Use our lightweight custom element{" "}
                                        <code className="text-slate-300">
                                            {"<flux-root>"}
                                        </code>{" "}
                                        directly inside your static HTML files.
                                    </p>
                                    <h4 className="text-sm font-bold text-purple-400 mb-2">
                                        1. Setup Web Component
                                    </h4>
                                    <CodeBlock
                                        code={`<flux-root lerp="0.08" wheel-multiplier="1.0">\n  <div id="content">\n    <!-- Your smooth-scrolled page layout goes here -->\n  </div>\n</flux-root>`}
                                        language="html"
                                    />
                                    <h4 className="text-sm font-bold text-purple-400 mt-6 mb-2">
                                        2. Direct API Control
                                    </h4>
                                    <CodeBlock
                                        code={`import { Flux } from "@knguyen1411b/flux";\n\nconst flux = new Flux({\n  lerp: 0.08,\n  wrapper: window,\n  content: document.querySelector("#content")\n});\n\nflux.on("scroll", (e) => {\n  console.log("Scroll position:", e.scroll);\n});`}
                                        language="javascript"
                                    />
                                </div>
                            )}

                            {activeTab === "gsap" && (
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        GSAP ScrollTrigger Syncing
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-6">
                                        Register a proxy ScrollTrigger
                                        configuration to synchronize GSAP
                                        animations with Flux scroll.
                                    </p>
                                    <CodeBlock
                                        code={`import gsap from "gsap";\nimport { ScrollTrigger } from "gsap/ScrollTrigger";\n\ngsap.registerPlugin(ScrollTrigger);\n\n// Sync GSAP with Flux custom scrolling\nScrollTrigger.scrollerProxy(document.body, {\n  scrollTop(value) {\n    if (arguments.length) {\n      flux.scroll = value; // Setter updates position\n    }\n    return flux.scroll; // Getter retrieves position\n  },\n  getBoundingClientRect() {\n    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };\n  }\n});\n\n// Update ScrollTrigger on scroll ticks\nflux.on("scroll", () => {\n  ScrollTrigger.update();\n});`}
                                        language="javascript"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Section 4: Features */}
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
