import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://caleb-oke-portfolio.vercel.app";
const title = "Caleb Oke | AI Automation Builder";
const description = "Caleb Oke builds and tests practical voice AI prototypes, workflow automations, and data pipelines using n8n, Vapi, Make.com, Zapier, Python, and custom APIs.";
const profileSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profile`,
  url: `${SITE_URL}/`,
  name: title,
  description,
  mainEntity: {
    "@type": "Person",
    "@id": `${SITE_URL}/#caleb-oke`,
    name: "Caleb Oke",
    jobTitle: "AI Automation Builder",
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/caleb-portrait.webp`,
    email: "mailto:okecaleb139@gmail.com",
    sameAs: [
      "https://github.com/techcaleb139",
      "https://www.linkedin.com/in/caleb-oke-6464b0216/",
      "https://www.instagram.com/tech_caleb_/",
    ],
    knowsAbout: ["AI automation", "n8n", "Vapi", "Make.com", "Zapier", "Python", "JavaScript", "REST APIs"],
  },
};

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Caleb Oke",
    url: "/",
    title,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Caleb Oke, AI Automation Builder" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geist.variable} ${mono.variable}`}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema).replace(/</g, "\\u003c") }} />{children}</body></html>;
}
