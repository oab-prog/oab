import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { bancoCompleto, bancoEstrategico, missoes } from "@/data/questoes";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Crosshair, BookOpen, BarChart3, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const missaoHoje = useMemo(() => missoes[Math.floor(Math.random() * missoes.length)], []);
  const hero = useScrollReveal(0);
  const mission = useScrollReveal(100);
  const stats = useScrollReveal(200);
  const method = useScrollReveal(300);

  const quickActions = [
    { title: "Simulado Real", icon: Crosshair, path: "/simulado", desc: "80 questões aleatórias" },
    { title: "Buscador", icon: BookOpen, path: "/buscador", desc: "Pesquise no banco completo" },
    { title: "Radar", icon: BarChart3, path: "/radar", desc: "Temas mais recorrentes" },
    { title: "Predição", icon: Scale, path: "/predicao", desc: "Análise para 2026" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div ref={hero.ref} style={hero.style}>
        <h1 className="text-3xl md:text-4xl font-bold">
          Portal <span className="text-gradient-gold">JurisVision</span> OAB
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl">
          Plataforma inteligente de preparação para o Exame de Ordem com análise preditiva e banco estratégico.
        </p>
      </div>

      {/* Daily Mission */}
      <Card ref={mission.ref} style={mission.style} className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">Missão do Dia</p>
          <p className="text-foreground text-sm md:text-base leading-relaxed">{missaoHoje}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div ref={stats.ref} style={stats.style} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Questões Totais", value: bancoCompleto.length },
          { label: "Núcleo Estratégico", value: bancoEstrategico.length },
          { label: "Temas Mapeados", value: "14" },
          { label: "Exames Cobertos", value: "2020–2025" },
        ].map((s) => (
          <Card key={s.label} className="bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div ref={method.ref} style={method.style} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <button
            key={a.title}
            onClick={() => navigate(a.path)}
            className="group flex flex-col items-start p-4 rounded-lg bg-secondary border border-border hover:border-primary/30 transition-all duration-200 active:scale-[0.97] text-left"
          >
            <a.icon className="h-5 w-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-foreground">{a.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Methodology */}
      <Card ref={method.ref} style={method.style}>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-warning mb-3">
            Por que focamos de 2020 até os dias atuais?
          </h2>
          <div className="text-xs md:text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              <strong className="text-foreground">1. O Risco da Lei Morta</strong> — A legislação brasileira é extremamente volátil. Questões anteriores a 2019 podem induzir erro em temas como Reforma Trabalhista (2017), CPC (2015) e Pacote Anticrime (2019).
            </p>
            <p>
              <strong className="text-foreground">2. Evolução do Perfil da FGV</strong> — Desde 2020, a banca consolidou casos práticos complexos e foco em Ética Digital.
            </p>
            <p>
              <strong className="text-foreground">3. Módulo Legado</strong> — Banco Geral ({bancoCompleto.length} questões) para treino de exaustão. Núcleo Estratégico ({bancoEstrategico.length} questões) para clones e predições 2026.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground italic pb-8">
        "O sucesso é a soma de pequenos esforços repetidos dia após dia."
      </p>
    </div>
  );
}
