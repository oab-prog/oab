import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import SimuladoPage from "@/pages/SimuladoPage";
import BuscadorPage from "@/pages/BuscadorPage";
import RadarPage from "@/pages/RadarPage";
import RadarRecorrenciaPage from "@/pages/RadarRecorrenciaPage";
import PredicaoPage from "@/pages/PredicaoPage";
import EticaFlashcards from "@/pages/EticaFlashcards";
import DicionarioTeses from "@/pages/DicionarioTeses"; // <-- IMPORTAÇÃO DO DICIONÁRIO
import TreinoPecaPage from "@/pages/TreinoPecaPage"; // <-- IMPORTAÇÃO DA 2ª FASE
import TreinoDiscursivasPage from "@/pages/TreinoDiscursivasPage";
import BuscadorEspelhosPage from "@/pages/BuscadorEspelhosPage";
import ConstrutorEsqueletosPage from "@/pages/ConstrutorEsqueletosPage";
import CalculadoraPrazosPage from "@/pages/CalculadoraPrazosPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import NotFound from "./pages/NotFound";

import { AuthGuard } from "@/components/AuthGuard";
import { SecondPhaseGuard } from "@/components/SecondPhaseGuard";
import { MessageCircle } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/termos" element={<TermsPage />} />
          <Route path="/privacidade" element={<PrivacyPage />} />
          <Route path="/*" element={
            <AuthGuard>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} /> 
                  <Route path="/simulado-primeira-fase" element={<SimuladoPage />} />
                  <Route path="/buscador" element={<BuscadorPage />} />
                  <Route path="/radar" element={<RadarPage />} />
                  <Route path="/radar-recorrencia" element={<RadarRecorrenciaPage />} />
                  <Route path="/predicao" element={<PredicaoPage />} />
                  <Route path="/etica" element={<EticaFlashcards />} />
                  <Route path="/dicionario-teses" element={<SecondPhaseGuard><DicionarioTeses /></SecondPhaseGuard>} /> {/* <-- NOVA ROTA DE TESES */}
                  <Route path="/treino-peca" element={<SecondPhaseGuard><TreinoPecaPage /></SecondPhaseGuard>} /> {/* <-- NOVA ROTA 2ª FASE */}
                  <Route path="/treino-discursivas" element={<SecondPhaseGuard><TreinoDiscursivasPage /></SecondPhaseGuard>} />
                  <Route path="/buscador-espelhos" element={<SecondPhaseGuard><BuscadorEspelhosPage /></SecondPhaseGuard>} />
                  <Route path="/construtor-esqueletos" element={<SecondPhaseGuard><ConstrutorEsqueletosPage /></SecondPhaseGuard>} />
                  <Route path="/calculadora-prazos" element={<CalculadoraPrazosPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </AuthGuard>
          } />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
