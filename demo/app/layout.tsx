import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"]
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"]
});

export const metadata: Metadata = {
    title: "Flux | Ultra-smooth & Frame-rate Independent Scroll Engine",
    description:
        "Experience modern smooth scrolling with Flux. Light, zero-dependencies, SSR-safe, and fully customizable for React and Next.js.",
    keywords: [
        "smooth scrolling",
        "flux",
        "react smooth scroll",
        "nextjs smooth scroll",
        "web animations",
        "gsap scrolltrigger"
    ],
    authors: [{ name: "knguyen1411b" }],
    openGraph: {
        title: "Flux | Ultra-smooth Scroll Engine",
        description:
            "Modern, lightweight, and frame-rate independent smooth scrolling library for React and Vanilla JS.",
        type: "website"
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col select-none">
                {children}
            </body>
        </html>
    );
}
