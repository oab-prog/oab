import { useState, useMemo, useEffect, useRef } from "react";
import { bancoCompleto, type Questao, type ErroSessao } from "@/data/questoes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { optionButtonClass } from "@/components/AppButton";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, RotateCcw, Trophy, XCircle, CheckCircle2, Download, Clock, Filter } from "lucide-react";
import { jsPDF } from "jspdf";

type SimuladoState = "idle" | "running" | "feedback" | "result";

export default function SimuladoPage() {
  const [state, setState] = useState<SimuladoState>("idle");
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [index, setIndex] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState<ErroSessao[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [filtroTema, setFiltroTema] = useState<string>("Todos");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hero = useScrollReveal();

  // Extrai temas únicos para o filtro
  const temasDisponiveis = useMemo(() => {
    const temas = bancoCompleto.map(q => q.tema.split(';')[0].trim());
    return ["Todos", ...Array.from(new Set(temas))].sort();
  }, []);

  useEffect(() => {
    if (state === "result") {
      const novoResultado = {
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        acertos,
        total: questoes.length,
        percentual: Math.round((acertos / questoes.length) * 100),
        disciplina: filtroTema
      };
      const historico = JSON.parse(localStorage.getItem("jurisvision_historico") || "[]");
      localStorage.setItem("jurisvision_historico", JSON.stringify([novoResultado, ...historico].slice(0, 10)));
    }
  }, [state]);

  const startSimulado = (n: number) => {
    let base = [...bancoCompleto];
    if (filtroTema !== "Todos") {
      base = base.filter(q => q.tema.includes(filtroTema));
    }
    
    const shuffled = base.sort(() => 0.5 - Math.random());
    const selecionadas = shuffled.slice(0, Math.min(n, base.length));
    
    if (selecionadas.length === 0) {
      alert("Nenhuma questão encontrada para este tema.");
      return;
    }

    setQuestoes(selecionadas);
    setIndex(0);
    setAcertos(0);
    setErros([]);
    setState("running");
    setSelected(null);
    setShowFeedback(false);
    setTimeLeft(selecionadas.length * 180);
    setTimerActive(true);
  };

  // ... (Lógica de Timer, FormatTime, handleOptionSelect e Proxima permanecem iguais ao anterior)
  // [Mantendo as funções internas por brevidade, mas o código completo deve incluí-las]

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setState("result");
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    setSelected(option);
    setShowFeedback(true);
    const correta = questoes[index].correta;
    if (option.charAt(0) === correta) {
      setAcertos(prev => prev + 1);
    } else {
      setErros(prev => [...prev, {
        questao: questoes[index].pergunta,
        correta: correta,
        justificativa: questoes[index].comentario
      }]);
    }
  };

  const proxima = () => {
    if (index < questoes.length - 1) {
      setIndex(prev => prev + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      setTimerActive(false);
      setState("result");
    }
  };

  if (state === "idle") {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 py-10">
        <div ref={hero.ref} style={hero.style} className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tight">SIMULADO <span className="text-gradient-gold">ESTRATÉGICO</span></h1>
          <p className="text-muted-foreground">Configure o seu treino personalizado.</p>
        </div>

        <Card className="bg-secondary/10 border-white/5 p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Filter className="h-3 w-3" /> Selecionar Disciplina
              </label>
              <select 
                value={filtroTema}
                onChange={(e) => setFiltroTema(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-lg p-3 text-sm focus:ring-2 ring-primary outline-none"
              >
                {temasDisponiveis.map(tema => (
                  <option key={tema} value={tema}>{tema}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-primary">Quantidade de Questões</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[10, 20, 40, 80].map((n) => (
                  <Button key={n} variant="outline" onClick={() => startSimulado(n)} className="h-16 flex flex-col border-white/10 hover:border-primary">
                    <span className="text-xl font-bold">{n}</span>
                    <span className="text-[9px] uppercase opacity-50">Itens</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Renderização do simulado (mesma estrutura visual do anterior)
  const questaoAtual = questoes[index];
  const progresso = ((index + 1) / questoes.length) * 100;

  if (state === "result") {
    const aproveitamento = Math.round((acertos / questoes.length) * 100);
    return (
      <div className="p-6 max-w-2xl mx-auto py-10 space-y-8 animate-reveal">
        <Card className="border-none shadow-2xl bg-secondary/10 overflow-hidden text-center p-8">
           <Trophy className="h-12 w-12 text-gold mx-auto mb-4" />
           <h2 className="text-2xl font-bold">Simulado de {filtroTema}</h2>
           <div className="grid grid-cols-3 gap-4 my-6">
             <div><p className="text-2xl font-black">{acertos}</p><p className="text-[10px] uppercase text-muted-foreground">Acertos</p></div>
             <div><p className="text-2xl font-black">{questoes.length}</p><p className="text-[10px] uppercase text-muted-foreground">Total</p></div>
             <div><p className="text-2xl font-black text-primary">{aproveitamento}%</p><p className="text-[10px] uppercase text-muted-foreground">Nota</p></div>
           </div>
           <Button onClick={() => setState("idle")} className="w-full">Voltar ao Início</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-mono font-bold text-xl">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase">{filtroTema}</span>
          <p className="font-bold">{index + 1} / {questoes.length}</p>
        </div>
      </div>

      <Progress value={progresso} className="h-1" />

      <Card className="border-none bg-secondary/5">
        <CardContent className="p-6 md:p-8 space-y-6">
          <p className="text-base md:text-lg leading-relaxed font-medium">{questaoAtual.pergunta}</p>
          <div className="grid grid-cols-1 gap-3">
            {questaoAtual.opcoes.map((op, i) => (
              <button
                key={i}
                disabled={showFeedback}
                onClick={() => handleOptionSelect(op)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all text-left
                  ${selected === op ? 'ring-2 ring-primary border-transparent' : 'border-white/5'}
                  ${showFeedback && op.charAt(0) === questaoAtual.correta ? 'bg-success/10 border-success/50' : ''}
                  ${showFeedback && selected === op && op.charAt(0) !== questaoAtual.correta ? 'bg-destructive/10 border-destructive/50' : ''}
                `}
              >
                <span className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">{op.charAt(0)}</span>
                <span className="text-sm leading-snug">{op.slice(3)}</span>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className="p-5 rounded-xl bg-secondary/20 border border-white/10 animate-reveal-up">
              <p className="text-xs text-muted-foreground italic mb-4">{questaoAtual.comentario}</p>
              <Button onClick={proxima} className="w-full gap-2">Próxima Questão <ArrowRight className="h-4 w-4" /></Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
