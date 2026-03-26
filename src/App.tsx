import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Index from "@/pages/Index";
import SimuladoPage from "@/pages/SimuladoPage";
import BuscadorPage from "@/pages/BuscadorPage";
import RadarPage from "@/pages/RadarPage";
import PredicaoPage from "@/pages/PredicaoPage";
import EticaFlashcards from "@/pages/EticaFlashcards";
import DicionarioTeses from "@/pages/DicionarioTeses"; // <-- IMPORTAÇÃO DO DICIONÁRIO
import NotFound from "./pages/NotFound";

import { AuthGuard } from "@/components/AuthGuard";
import { MessageCircle } from "lucide-react";

const queryClient = new QueryClient();

const WhatsAppFAB = () => (
  <a
    href="https://wa.me/5511978353047?text=Olá Dra. Adriana, gostaria de saber mais sobre o JurisVision e o JurisAuditor Pro!"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
    aria-label="Contato WhatsApp"
  >
    <MessageCircle className="h-6 w-6" />
    <span className="absolute right-full mr-3 bg-white text-black text-xs font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
      Fale Conosco
    </span>
  </a>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WhatsAppFAB />
      <HashRouter>
        <AuthGuard>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} /> 
              <Route path="/simulado" element={<SimuladoPage />} />
              <Route path="/buscador" element={<BuscadorPage />} />
              <Route path="/radar" element={<RadarPage />} />
              <Route path="/predicao" element={<PredicaoPage />} />
              <Route path="/etica" element={<EticaFlashcards />} />
              <Route path="/teses" element={<DicionarioTeses />} /> {/* <-- NOVA ROTA DE TESES */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthGuard>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;