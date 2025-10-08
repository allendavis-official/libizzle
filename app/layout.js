import "./globals.css";

export const metadata = {
  title: "Liberian Pulse - Music Analytics",
  description: "Track Liberian artists on Audiomack",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
