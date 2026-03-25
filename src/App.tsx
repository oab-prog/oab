import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Index from "@/pages/Index"; // <-- IMPORTAMOS O NOVO INDEX AQUI
import SimuladoPage from "@/pages/SimuladoPage";
import BuscadorPage from "@/pages/BuscadorPage";
import RadarPage from "@/pages/RadarPage";
import PredicaoPage from "@/pages/PredicaoPage";
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
            {/* AGORA O "/" APONTA PARA O INDEX (NOSSA DASHBOARD) */}
            <Route path="/" element={<Index />} /> 
            <Route path="/simulado" element={<SimuladoPage />} />
            <Route path="/buscador" element={<BuscadorPage />} />
            <Route path="/radar" element={<RadarPage />} />
            <Route path="/predicao" element={<PredicaoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
