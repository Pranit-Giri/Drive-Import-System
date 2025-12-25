import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container-page">{children}</div>
      </body>
    </html>
  );
}
