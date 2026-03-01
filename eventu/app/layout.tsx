import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MobileNav } from "@/components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventU",
  description: "",
};

const navItems = [
  { href: "/profile/", label: "Edit Profile" },
  { href: "/logged-out", label: "Logout" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <html>
        <div className="absolute top-4 right-4">
          <MobileNav items={navItems} />
        </div>
        <body>
          <main className="flex-1 p-6">{children}</main>
        </body>
      </html>
    </main>
  );
}
