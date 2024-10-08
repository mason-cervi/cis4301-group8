import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Header from './components/Header';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dollartrend",
  description: "Analyzing economic trends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
