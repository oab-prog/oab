import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EvolucaoAlunos from "@/components/EvolucaoAlunos";
import Conquistas from "@/components/Conquistas";
import MentorEstrategico from "@/components/MentorEstrategico";
import ContagemRegressiva from "@/components/ContagemRegressiva"; // <-- Importado aqui
import { missoes } from "@/data/questoes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { 
  BookOpen, 
  Target, 
  Zap, 
  Scale, 
  ChevronRight, 
  Lightbulb 
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const reveal = useScrollReveal();

  // Sorteia uma missão do dia para incentivar o estudo
  const missaoDoDia = useMemo(() => {
    return missoes[Math.floor(Math.random() * missoes.length)];
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      {/* Cabeçalho de Boas-vindas */}
      <div ref={reveal.ref} style={reveal.style} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            JurisVision <span className="text-gradient-gold">OAB</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Sua jornada para a aprovação começa aqui.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
          <Zap className="h-3 w-3 fill-primary" /> Modo Turbo Ativado
        </div>
      </div>

      {/* SEÇÃO DE URGÊNCIA: CRONÔMETRO (Primeira coisa que o aluno vê) */}
      <section className="animate-reveal" style={{ animationDelay: '50ms' }}>
        <ContagemRegressiva />
      </section>

      {/* MENTOR ESTRATÉGICO (Análise de Pontos Cegos) */}
      <section className="animate-reveal" style={{ animationDelay: '150ms' }}>
        <MentorEstrategico />
      </section>

      {/* SEÇÃO DE EVOLUÇÃO E CONQUISTAS */}
      <div className="space-y-8">
        <section className="animate-reveal" style={{ animationDelay: '250ms' }}>
          <EvolucaoAlunos />
        </section>

        <section className="animate-reveal" style={{ animationDelay: '350ms' }}>
          <Conquistas />
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Navegação Rápida */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Acesso Rápido
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => navigate("/questoes")}
              variant="outline" 
              className="h-28 flex flex-col items-start p-6 gap-2 border-white/5 bg-secondary/10 hover:bg-secondary/20 transition-all group"
            >
              <BookOpen className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold">Treino Livre</p>
                <p className="text-[10px] opacity-60">1.055 questões comentadas</p>
              </div>
            </Button>

            <Button 
              onClick={() => navigate("/simulado")}
              variant="outline" 
              className="h-28 flex flex-col items-start p-6 gap-2 border-white/5 bg-secondary/10 hover:bg-secondary/20 transition-all group"
            >
              <Scale className="h-6 w-6 text-gold group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold">Simulado Realista</p>
                <p className="text-[10px] opacity-60">Cronômetro e modo oficial</p>
              </div>
            </Button>

            <Button 
              onClick={() => navigate("/radar")}
              variant="outline" 
              className="h-28 flex flex-col items-start p-6 gap-2 border-white/5 bg-secondary/10 hover:bg-secondary/20 transition-all group"
            >
              <Target className="h-6 w-6 text-warning group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold">Radar de Clones</p>
                <p className="text-[10px] opacity-60">Padrões de repetição FGV</p>
              </div>
            </Button>

            <Button 
              onClick={() => navigate("/predicao")}
              variant="outline" 
              className="h-28 flex flex-col items-start p-6 gap-2 border-white/5 bg-secondary/10 hover:bg-secondary/20 transition-all group"
            >
              <Zap className="h-6 w-6 text-destructive group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold">Predição 2026</p>
                <p className="text-[10px] opacity-60">IA e Probabilidade estatística</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Lado Direito: Missão e Dica */}
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Sua Meta
          </h2>
          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">Missão do Dia</span>
              </div>
              <p className="text-sm leading-relaxed font-medium italic text-foreground/90">
                "{missaoDoDia}"
              </p>
              <Button 
                onClick={() => navigate("/questoes")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Começar Agora <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-secondary/10 border border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Status do Banco</p>
            <p className="text-sm font-bold">100% Atualizado (45º Exame)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
