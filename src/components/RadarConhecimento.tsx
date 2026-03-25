import { useState, useEffect, useMemo } from "react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function RadarConhecimento() {
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("jurisvision_historico") || "[]");
    setHistorico(dados);
  }, []);

  const dataRadar = useMemo(() => {
    if (historico.length === 0) return [];

    // Agrupar médias por disciplina
    const disciplinas: Record<string, { total: number; soma: number }> = {};
    
    historico.forEach(h => {
      const tema = h.disciplina || "Geral";
      if (!disciplinas[tema]) disciplinas[tema] = { total: 0, soma: 0 };
      disciplinas[tema].total += 1;
      disciplinas[tema].soma += h.percentual;
    });

    // Formatar para o Recharts
    return Object.entries(disciplinas).map(([subject, stats]) => ({
      subject,
      A: Math.round(stats.soma / stats.total),
      fullMark: 100,
    }));
  }, [historico]);

  if (dataRadar.length < 3) return null; // Só mostra se tiver pelo menos 3 matérias treinadas

  return (
    <Card className="bg-secondary/10 border-white/5 overflow-hidden animate-reveal">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" /> Equilíbrio de Conhecimento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex justify-center items-center">
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dataRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: "#888", fontSize: 10, fontWeight: "bold" }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={false} 
                axisLine={false} 
              />
              <Radar
                name="Desempenho"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}