import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Intrusion Prevention Program (IPP) Blueprint | Enterprise Cyber Defense",
  description:
    "Production-grade interactive blueprint for architecting, deploying, operationalizing, and assessing an enterprise-grade Intrusion Prevention Program across hybrid cloud, data center, and perimeter fabrics.",
  keywords: [
    "Intrusion Prevention System",
    "IPS",
    "NIST SP 800-94",
    "NIST CSF 2.0",
    "CIS Controls v8",
    "MITRE ATT&CK",
    "Zero Trust",
    "SOC Playbooks",
    "Network Security Architecture"
  ],
  authors: [{ name: "Enterprise Security Architecture" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Persistent Sidebar */}
            <div className="hidden md:block shrink-0">
              <Sidebar />
            </div>

            {/* Main Application Column */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Navbar />

              {/* Scrollable Page Content Canvas */}
              <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 bg-slate-950/90 text-slate-100">
                <div className="max-w-7xl mx-auto space-y-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
