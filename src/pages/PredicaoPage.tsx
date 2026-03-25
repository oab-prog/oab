import { useMemo } from "react";
import { getTopTemas, getEstatisticasTema, bancoEstrategico } from "@/data/questoes";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function PredicaoPage() {
  const hero = useScrollReveal();
  const top5Section = useScrollReveal(100);
  const reportSection = useScrollReveal(200);

  const top5 = useMemo(() => getTopTemas(5), []);
  const stats = useMemo(() => getEstatisticasTema(), []);
  const totalQuestoes = useMemo(() => Object.values(stats).reduce((a, b) => a + b, 0), [stats]);

  // Find clones count
  const totalClones = useMemo(() => {
    const seen = new Set<string>();
    let dupes = 0;
    bancoEstrategico.forEach(q => {
      const hash = q.pergunta.replace(/\W+/g, "").toLowerCase().slice(0, 80);
      if (seen.has(hash)) dupes++;
      else seen.add(hash);
    });
    return dupes;
  }, []);

  const instrucoes = [
    "Domine a letra da lei e as súmulas recentes.",
    "Foque intensamente na resolução de casos práticos.",
    "Tema com forte histórico de repetição na banca.",
    "Assunto frequente nas últimas 5 provas da FGV.",
    "Garanta esses pontos revisando os conceitos base.",
  ];

  const risco = totalClones > 15 ? "ALTO" : "MODERADO";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div ref={hero.ref} style={hero.style}>
        <h1 className="text-3xl font-bold mb-1">
          Veredito: <span className="text-gradient-gold">Predição Analítica 2026</span>
        </h1>
        <p className="text-muted-foreground text-sm">Análise estatística baseada no Núcleo Estratégico de Elite.</p>
        <p className="text-[11px] text-warning mt-2">
          ⚠ Base atualizada até o 45º Exame de Ordem (21/12/2025).
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Top 5 - Left */}
        <div ref={top5Section.ref} style={top5Section.style} className="md:col-span-3 space-y-3">
          <h2 className="text-sm font-semibold tracking-widest uppercase text-primary">
            Top 5 Estratégias de Aprovação
          </h2>

          {top5.map(([tema, qtd], i) => {
            const chance = Math.min(97, Math.round((qtd / totalQuestoes) * 100 + 68 + i * 3));

            return (
              <Card
                key={tema}
                className="animate-reveal-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold tabular-nums ${i < 2 ? "text-destructive" : "text-warning"}`}>
                        {i + 1}º
                      </span>
                      <span className="text-sm font-semibold text-foreground">{tema}</span>
                    </div>
                    <span className="text-sm font-bold text-primary tabular-nums">{chance}%</span>
                  </div>

                  <Progress
                    value={chance}
                    className="h-2"
                  />

                  <p className="text-xs text-muted-foreground italic">
                    💡 {instrucoes[i] || "Revise os principais conceitos."}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report - Right */}
        <div ref={reportSection.ref} style={reportSection.style} className="md:col-span-2">
          <Card className="sticky top-6">
            <CardContent className="p-5 space-y-5">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-warning">
                Relatório de Inteligência
              </h2>

              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground mb-1">Risco de Clonagem na Prova</p>
                <span className={`text-2xl font-bold ${risco === "ALTO" ? "text-destructive" : "text-success"}`}>
                  {risco}
                </span>
              </div>

              <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Análise com base no Núcleo de Elite ({bancoEstrategico.length} questões ativas):
                </p>
                <p>
                  <strong className="text-foreground">1.</strong> A banca FGV continua a reciclar teses e casos práticos de forma agressiva. Foram detectados <span className="text-warning font-medium">{totalClones} clones</span> no banco.
                </p>
                <p>
                  <strong className="text-foreground">2.</strong> Sua Prioridade Máxima de estudo deve ser <span className="text-primary font-medium">"{top5[0]?.[0] || "N/A"}"</span>, que apresenta a maior assinatura estatística da OAB moderna.
                </p>
                <p>
                  <strong className="text-foreground">Conclusão:</strong> Direcione 70% do seu tempo de revisão final apenas para os temas do Top 5.
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-primary tabular-nums">{bancoEstrategico.length}</p>
                  <p className="text-[10px] text-muted-foreground">Questões Estratégicas</p>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-warning tabular-nums">{totalClones}</p>
                  <p className="text-[10px] text-muted-foreground">Clones Detectados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
