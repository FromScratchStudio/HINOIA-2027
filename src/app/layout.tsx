import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HINOIA — Creative Studio",
  description:
    "HINOIA is a creative studio for comics and transmedia storytelling. Explore collections, projects, and visual worlds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0c0c0c] text-[#e8e8e8]">
        {children}
      </body>
    </html>
  );
}
