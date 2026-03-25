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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
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
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
