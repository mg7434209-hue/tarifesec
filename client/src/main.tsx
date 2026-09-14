import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 }, // 5 dk cache
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
      DIŞ hata sınırı: Layout (header, footer, ziyaretçi sayacı) App.tsx'teki
      iç sınırın DIŞINDA kalıyor; orada çıkan bir hata tüm ağacı söküp sayfayı
      bembeyaz bırakırdı. İç sınır sayfa hatalarını izole eder (header/footer
      ayakta kalır), dış sınır ise son güvenlik ağıdır.
    */}
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
