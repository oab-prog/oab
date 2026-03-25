import { getTopTemas, bancoEstrategico } from "@/data/questoes";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportarQuestoesPDF } from "@/lib/pdf-export";

export default function RadarPage() {
  const hero = useScrollReveal();
  const chart = useScrollReveal(100);
  const clones = useScrollReveal(200);

  const topTemas = useMemo(() => getTopTemas(7), []);
  const chartData = useMemo(
    () => topTemas.map(([tema, count]) => ({ tema, count })),
    [topTemas]
  );

  // Find clones (questions with very similar text)
  const clonesDetectados = useMemo(() => {
    const seen = new Map<string, number>();
    const dupes: typeof bancoEstrategico = [];
    bancoEstrategico.forEach(q => {
      const hash = q.pergunta.replace(/\W+/g, "").toLowerCase().slice(0, 80);
      if (seen.has(hash)) {
        dupes.push(q);
      } else {
        seen.set(hash, q.id);
      }
    });
    return dupes;
  }, []);

  const barColors = ["hsl(38, 92%, 50%)", "hsl(38, 80%, 55%)", "hsl(38, 70%, 60%)", "hsl(220, 14%, 35%)", "hsl(220, 14%, 30%)", "hsl(220, 14%, 28%)", "hsl(220, 14%, 25%)"];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div ref={hero.ref} style={hero.style}>
        <h1 className="text-3xl font-bold mb-1">
          Radar de <span className="text-gradient-gold">Recorrência</span>
        </h1>
        <p className="text-muted-foreground text-sm">Núcleo Estratégico — Temas mais cobrados pela FGV de 2020 a 2025.</p>
        <p className="text-[11px] text-warning mt-2">
          ⚠ Base atualizada até o 45º Exame de Ordem (21/12/2025). Estatísticas recalibradas periodicamente.
        </p>
      </div>

      {/* Chart */}
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

      {/* Clones */}
      <div ref={clones.ref} style={clones.style}>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">Questões Repetidas (Clones)</h2>
          <span className="text-xs bg-warning/15 text-warning px-2 py-0.5 rounded-full font-medium tabular-nums">
            {clonesDetectados.length} detectados
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
          <div className="space-y-2">
            {clonesDetectados.slice(0, 10).map((c, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0 mt-0.5">
                    {c.tema}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {c.pergunta.slice(0, 120)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Nenhum clone detectado no banco atual.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
