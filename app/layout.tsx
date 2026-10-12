import type { Metadata } from "next";
import { Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});


export const metadata: Metadata = {
  title: "Bukka Online | Digital Menus & Online Ordering for Food Businesses",
  description:
    "Take your food business online with Bukka. Create beautiful digital menus, showcase your meals, receive customer orders, manage your business, and share your menu link or QR code across WhatsApp and social media. No website or app required.",
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", manrope.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
