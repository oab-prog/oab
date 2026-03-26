import { getTopTemas, bancoCompleto } from "@/data/questoes"; // Alterado para bancoCompleto
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { exportarQuestoesPDF } from "@/lib/pdf-export";
import { useIsMobile } from "@/hooks/use-mobile";

export default function RadarPage() {
  const hero = useScrollReveal();
  const chart = useScrollReveal(100);
  const clones = useScrollReveal(200);
  const isMobile = useIsMobile();

  const [visibleCount, setVisibleCount] = useState(5); // Reduzido para 5 conforme solicitado
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const topTemas = useMemo(() => getTopTemas(7), []);
  const chartData = useMemo(
    () => topTemas.map(([tema, count]) => ({ tema, count })),
    [topTemas]
  );

  // Lógica de Detecção de Clones varrendo o banco de 1055 questões
  const clonesDetectados = useMemo(() => {
    const seen = new Map<string, number>();
    const dupes: any[] = []; 
    
    bancoCompleto.forEach(q => {
      // Cria um resumo da pergunta (limpa espaços e caracteres especiais)
      const hash = q.pergunta.replace(/\W+/g, "").toLowerCase().slice(0, 85);
      
      if (seen.has(hash)) {
        dupes.push(q);
      } else {
        seen.set(hash, q.id);
      }
    });
    return dupes;
  }, []);

  const barColors = ["hsl(38, 92%, 50%)", "hsl(38, 80%, 55%)", "hsl(38, 70%, 60%)", "hsl(220, 14%, 35%)", "hsl(220, 14%, 30%)", "hsl(220, 14%, 28%)", "hsl(220, 14%, 25%)"];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 relative z-10 block">
      <div ref={hero.ref} style={hero.style}>
        <h1 className="text-3xl font-bold mb-1">
          Radar de <span className="text-gradient-gold">Recorrência</span>
        </h1>
        <p className="text-muted-foreground text-sm">Núcleo Estratégico — Temas mais cobrados pela FGV de 2020 a 2025.</p>
        <p className="text-[11px] text-warning mt-2">
          ⚠ Base atualizada com as 1055 questões (Exames 2020-2025). Estatísticas recalibradas.
        </p>
      </div>

      {/* Gráfico de Temas */}
      <Card ref={chart.ref} style={chart.style}>
        <CardContent className="p-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Top 7 Temas Estratégicos</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <XAxis type="number" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="tema"
                  width={160}
                  tick={{ fill: "hsl(40, 10%, 80%)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 18%, 10%)",
                    border: "1px solid hsl(220, 14%, 18%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(40, 10%, 90%)",
                  }}
                  formatter={(value: number) => [`${value} questões`, "Frequência"]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={barColors[i] || barColors[barColors.length - 1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Clones */}
      <div ref={clones.ref} style={clones.style}>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Questões Repetidas (Clones)</h2>
          <span className="text-xs bg-warning/15 text-warning px-2 py-0.5 rounded-full font-medium tabular-nums">
            {clonesDetectados.length} padrões detectados
          </span>
          {clonesDetectados.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto active:scale-[0.97]"
              onClick={() => exportarQuestoesPDF(clonesDetectados, "Clones Detectados - JurisVision", "clones-jurisvision.pdf")}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
            </Button>
          )}
        </div>

        {clonesDetectados.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[400px] min-h-[200px] pr-2 custom-scrollbar">
              {clonesDetectados.slice(0, visibleCount).map((c) => {
                const isExpanded = expandedId === c.id;
                return (
                  <Card 
                    key={c.id} 
                    className={`border-l-4 border-l-warning/50 cursor-pointer transition-all duration-200 select-none ${
                      !isExpanded && !isMobile ? "hover:bg-warning/5" : ""
                    } ${isExpanded ? "bg-warning/5 border-warning" : ""}`}
                    onClick={() => toggleExpand(c.id)}
                  >
                    <CardContent className="p-4 flex items-start gap-4 min-h-[44px]">
                      <div className="flex flex-col gap-1 shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase text-center">
                          {c.tema.split(';')[0]} 
                        </span>
                        <span className="text-[9px] text-center text-warning font-bold uppercase tracking-tighter">Clone</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className={`text-xs leading-relaxed ${isExpanded ? "text-foreground" : "text-muted-foreground line-clamp-2"}`}>
                          {c.pergunta}
                        </p>
                        {isExpanded && (
                          <div className="pt-2 mt-2 border-t border-warning/10 animate-reveal">
                            <p className="text-[10px] font-bold text-warning uppercase mb-2">Comentário Estratégico:</p>
                            <p className="text-xs text-muted-foreground leading-relaxed italic bg-black/20 p-3 rounded-lg border border-white/5">
                              {c.comentario || "Análise em processamento para este padrão de repetição."}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 self-center">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-warning" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {clonesDetectados.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">Nenhuma questão encontrada</p>
              )}
            </div>
            {visibleCount < clonesDetectados.length && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-all py-6 border border-dashed border-white/5 bg-secondary/5"
                onClick={() => setVisibleCount(prev => prev + 5)}
              >
                Ver mais {clonesDetectados.length - visibleCount} padrões detectados
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma questão encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
