import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { bancoCompleto, type Questao, type ErroSessao } from "@/data/questoes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { optionButtonClass } from "@/components/AppButton";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, RotateCcw, Trophy, XCircle, CheckCircle2, Crosshair, Download, Clock } from "lucide-react";
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
  const [numQuestoes, setNumQuestoes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hero = useScrollReveal();

  // Lógica da Memória do Aluno: Salva o resultado automaticamente ao finalizar
  useEffect(() => {
    if (state === "result") {
      const novoResultado = {
        id: Date.now(),
        data: new Date().toLocaleDateString('pt-BR'),
        acertos: acertos,
        total: questoes.length,
        percentual: Math.round((acertos / questoes.length) * 100)
      };

      const historicoAntigo = JSON.parse(localStorage.getItem("jurisvision_historico") || "[]");
      const novoHistorico = [novoResultado, ...historicoAntigo].slice(0, 10); // Mantém os últimos 10 simulados
      localStorage.setItem("jurisvision_historico", JSON.stringify(novoHistorico));
    }
  }, [state, acertos, questoes.length]);

  const startSimulado = (n: number) => {
    const shuffled = [...bancoCompleto].sort(() => 0.5 - Math.random());
    setQuestoes(shuffled.slice(0, n));
    setIndex(0);
    setAcertos(0);
    setErros([]);
    setState("running");
    setSelected(null);
    setShowFeedback(false);
    
    // Tempo proporcional: 3 min por questão
    setTimeLeft(n * 180);
    setTimerActive(true);
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      if (state === "running" || state === "feedback") setState("result");
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft, state]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    setSelected(option);
    setShowFeedback(true);
    
    const isCorrect = option.charAt(0) === questaoAtual.correta;
    if (isCorrect) {
      setAcertos(prev => prev + 1);
    } else {
      setErros(prev => [...prev, {
        questao: questaoAtual.pergunta,
        correta: questaoAtual.correta,
        justificativa: questaoAtual.comentario
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

  const exportarErrosPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("JurisVision - Relatório de Revisão", 20, 20);
    doc.setFontSize(12);
    doc.text(`Desempenho: ${acertos}/${questoes.length}`, 20, 30);
    
    let y = 45;
    erros.forEach((err, i) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. Enunciado:`, 20, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      const text = doc.splitTextToSize(err.questao, 170);
      doc.text(text, 20, y);
      y += text.length * 5 + 5;
      doc.text(`Correta: ${err.correta}`, 20, y);
      y += 7;
      const com = doc.splitTextToSize(`Comentário: ${err.justificativa}`, 170);
      doc.text(com, 20, y);
      y += com.length * 5 + 15;
    });
    doc.save("revisao-jurisvision.pdf");
  };

  if (state === "idle") {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 py-20 text-center">
        <div ref={hero.ref} style={hero.style} className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            MODO <span className="text-gradient-gold">SIMULADO</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Treine sob pressão, identifique seus erros e salve sua evolução histórica.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[10, 20, 40, 80].map((n) => (
            <Button
              key={n}
              variant="outline"
              className="h-24 flex flex-col gap-1 hover:border-primary/50 transition-all active:scale-95"
              onClick={() => startSimulado(n)}
            >
              <span className="text-2xl font-bold">{n}</span>
              <span className="text-[10px] uppercase opacity-60">Questões</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const questaoAtual = questoes[index];
  const progresso = ((index + 1) / questoes.length) * 100;

  if (state === "result") {
    const aproveitamento = Math.round((acertos / questoes.length) * 100);
    return (
      <div className="p-6 max-w-2xl mx-auto py-10 space-y-8 animate-reveal">
        <Card className="border-none shadow-2xl bg-secondary/10 overflow-hidden">
          <div className="h-2 bg-gradient-gold" />
          <CardContent className="p-8 text-center space-y-6">
            <Trophy className="h-16 w-16 text-gold mx-auto animate-bounce" />
            <div>
              <h2 className="text-3xl font-bold">Simulado Concluído</h2>
              <p className="text-muted-foreground">O resultado foi salvo no seu histórico.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
              <div>
                <p className="text-3xl font-black text-primary">{acertos}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Acertos</p>
              </div>
              <div>
                <p className="text-3xl font-black">{questoes.length}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Total</p>
              </div>
              <div>
                <p className={`text-3xl font-black ${aproveitamento >= 50 ? 'text-success' : 'text-destructive'}`}>
                  {aproveitamento}%
                </p>
                <p className="text-[10px] uppercase text-muted-foreground">Nota</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setState("idle")} className="w-full gap-2">
                <RotateCcw className="h-4 w-4" /> Novo Simulado
              </Button>
              {erros.length > 0 && (
                <Button variant="outline" onClick={exportarErrosPDF} className="w-full gap-2 border-primary/20">
                  <Download className="h-4 w-4" /> Baixar Caderno de Erros (PDF)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCorrect = selected?.charAt(0) === questaoAtual.correta;

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Clock className={`h-5 w-5 ${timeLeft < 300 ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className="font-mono font-bold text-xl">{formatTime(timeLeft)}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase">Progresso</span>
          <p className="font-bold">{index + 1} / {questoes.length}</p>
        </div>
      </div>

      <Progress value={progresso} className="h-1" />

      <Card className="border-none shadow-xl bg-secondary/5">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded uppercase tracking-wider">
              {questaoAtual.tema.split(';')[0]}
            </span>
            <p className="text-base md:text-lg leading-relaxed font-medium">
              {questaoAtual.pergunta}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {questaoAtual.opcoes.map((op, i) => {
              const letra = op.charAt(0);
              const isSelected = selected === op;
              const isRight = showFeedback && letra === questaoAtual.correta;
              const isWrong = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={i}
                  disabled={showFeedback}
                  onClick={() => handleOptionSelect(op)}
                  className={`${optionButtonClass} flex items-start gap-4 p-4 rounded-xl border transition-all text-left
                    ${isSelected ? 'ring-2 ring-primary border-transparent' : 'border-white/5'}
                    ${isRight ? 'bg-success/10 border-success/50' : ''}
                    ${isWrong ? 'bg-destructive/10 border-destructive/50' : ''}
                  `}
                >
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${isRight ? 'bg-success text-white' : isWrong ? 'bg-destructive text-white' : isSelected ? 'bg-primary text-black' : 'bg-secondary'}
                  `}>
                    {letra}
                  </span>
                  <span className="text-sm leading-snug">{op.slice(3)}</span>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className="animate-reveal-up pt-4">
              <div className={`p-5 rounded-xl border ${isCorrect ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {isCorrect ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                  <span className={`font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                    {isCorrect ? 'Parabéns, você acertou!' : `Incorreto. A resposta é a letra ${questaoAtual.correta}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {questaoAtual.comentario}
                </p>
                <Button onClick={proxima} className="w-full mt-6 gap-2">
                  Próxima Questão <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
