import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, AlertTriangle, CheckCircle, TrendingUp, Lightbulb } from "lucide-react";

export default function MentorEstrategico() {
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("jurisvision_historico") || "[]");
    setHistorico(dados);
  }, []);

  const analise = useMemo(() => {
    if (historico.length === 0) return null;

    // Agrupa desempenho por disciplina
    const disciplinas: Record<string, { total: number; acertos: number }> = {};
    
    historico.forEach(h => {
      const tema = h.disciplina || "Geral";
      if (!disciplinas[tema]) disciplinas[tema] = { total: 0, acertos: 0 };
      disciplinas[tema].total += h.total;
      disciplinas[tema].acertos += h.acertos;
    });

    const ranking = Object.entries(disciplinas).map(([nome, dados]) => ({
      nome,
      percentual: Math.round((dados.acertos / dados.total) * 100)
    })).sort((a, b) => a.percentual - b.percentual);

    return {
      pior: ranking[0],
      melhor: ranking[ranking.length - 1],
      totalSimulados: historico.length
    };
  }, [historico]);

  if (!analise) return null;

  return (
    <Card className="border-l-4 border-l-primary bg-secondary/10 overflow-hidden animate-reveal">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                Parecer do Mentor <span className="text-[10px] bg-primary/20 px-2 py-0.5 rounded text-white italic">IA Analítica</span>
              </h3>
              <p className="text-lg font-medium mt-1">
                Foco sugerido: <span className="text-gradient-gold font-black">{analise.pior.nome}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background/50 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase">Ponto Cego</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Seu aproveitamento em <strong className="text-foreground">{analise.pior.nome}</strong> está em {analise.pior.percentual}%. Esta área pode custar sua aprovação se não for reforçada.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-background/50 border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase">Zona de Conforto</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Você domina <strong className="text-foreground">{analise.melhor.nome}</strong> ({analise.melhor.percentual}%). Mantenha apenas revisões leves aqui e direcione energia para as fraquezas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Lightbulb className="h-4 w-4 text-gold" />
              <p className="text-[11px] italic text-muted-foreground">
                Dica: Realize um simulado de 20 questões focado apenas em {analise.pior.nome} hoje.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}