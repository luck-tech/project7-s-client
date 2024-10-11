import "../main.css";

export const metadata = {
  title: "コピっと！",
  description: "PC スマホ ログイン不要で自由にコピペができます",
  icons: {
    icon: "/assets/icon.ico",
  },
  openGraph: {
    type: "website",
    title: "コピっと！~デバイス間で文字列を簡単に移動できるサイト~",
    description:
      "PC←→スマホ ログイン不要で自由にコピペができます。もうSNSアカウントを一回経由する必要はありません",
    siteName: "コピっと！",
    url: "https://www.copitto.com/",
    images: {
      url: "/assets/ogp.png",
      type: "image/png",
      width: 1200,
      height: 630,
    },
  },
  twitter: {
    type: "website",
    title: "コピっと！~デバイス間で文字列を簡単に移動できるサイト~",
    description:
      "PC←→スマホ ログイン不要で自由にコピペができます。もうSNSアカウントを一回経由する必要はありません",
    siteName: "コピっと！",
    url: "https://www.copitto.com/",
    images: {
      url: "/assets/ogp.png",
      type: "image/png",
      width: 1200,
      height: 630,
    },
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#333] m-0 font-['Hiragino_Kaku_Gothic_ProN']">
        {children}
      </body>
    </html>
  );
}
