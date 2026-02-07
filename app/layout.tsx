import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

export const metadata = {
  title: "Essenza Medical Center - Espaços Clínicos de Alto Padrão",
  description:
    "Espaços clínicos de alto padrão para profissionais de saúde. Consultórios equipados, estúdio de podcast, teatro e hub digital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
