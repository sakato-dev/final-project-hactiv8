import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata = {
  title: "Point Juaro",
  description: "Membership Loyalty Apps",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
