import "./globals.css";
import { Sen } from "next/font/google";

const sen = Sen({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sen.className}>
        {children}
      </body>
    </html>
  );
}