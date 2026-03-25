import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { bancoCompleto, type Questao, type ErroSessao } from "@/data/questoes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { optionButtonClass, optionCorrectClass, optionWrongClass } from "@/components/AppButton";
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

  // OAB: ~3 min per question
  const getTimeForQuestions = (n: number) => n * 3 * 60; // seconds

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setTimerActive(false);
            setState("result");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const hero = useScrollReveal();

  const questaoAtual = questoes[index];
  const isCorrect = selected ? selected.slice(0, 2) === questaoAtual?.correta.slice(0, 2) : false;

  const iniciar = useCallback(() => {
    const shuffled = [...bancoCompleto].sort(() => Math.random() - 0.5);
    const validas = shuffled.filter(q => q.opcoes.length >= 2).slice(0, numQuestoes);
    setQuestoes(validas);
    setIndex(0);
    setAcertos(0);
    setErros([]);
    setSelected(null);
    setShowFeedback(false);
    setTimeLeft(getTimeForQuestions(numQuestoes));
    setTimerActive(true);
    setState("running");
  }, [numQuestoes]);

  const handleSelect = (opcao: string) => {
    if (showFeedback) return;
    setSelected(opcao);
    setShowFeedback(true);

    const correct = opcao.slice(0, 2) === questaoAtual.correta.slice(0, 2);
    if (correct) {
      setAcertos(a => a + 1);
    } else {
      setErros(e => [...e, { questao: questaoAtual.pergunta, correta: questaoAtual.correta, justificativa: opcao }]);
    }
  };

  const proxima = () => {
    if (index + 1 >= questoes.length) {
      setTimerActive(false);
      setState("result");
    } else {
      setIndex(i => i + 1);
      setSelected(null);
      setShowFeedback(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 16;
    const maxW = pageW - margin * 2;
    let y = 20;

    const addText = (text: string, size: number, bold: boolean = false) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, maxW);
      const lineH = size * 0.45;
      if (y + lines.length * lineH > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, margin, y);
      y += lines.length * lineH + 2;
    };

    const percent = Math.round((acertos / questoes.length) * 100);

    // Header
    doc.setTextColor(40, 40, 40);
    addText("JurisVision OAB - Resultado do Simulado", 16, true);
    addText(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 10);
    y += 4;
    addText(`Acertos: ${acertos} / ${questoes.length}  (${percent}%)`, 12, true);
    addText(percent >= 60 ? "Status: APROVADO" : "Status: REPROVADO (corte: 60%)", 12, true);
    y += 6;

    if (erros.length > 0) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageW - margin, y);
      y += 8;
      addText("QUESTOES ERRADAS", 14, true);
      y += 2;

      erros.forEach((e, i) => {
        addText(`${i + 1}. ${e.questao}`, 10);
        doc.setTextColor(0, 130, 70);
        addText(`   Resposta correta: ${e.correta}`, 10, true);
        doc.setTextColor(180, 50, 50);
        addText(`   Sua resposta: ${e.justificativa}`, 10);
        doc.setTextColor(40, 40, 40);
        y += 4;
      });
    }

    doc.save("simulado-jurisvision.pdf");
  };

  if (state === "idle") {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div ref={hero.ref} style={hero.style}>
          <h1 className="text-3xl font-bold mb-2">Simulado <span className="text-gradient-gold">Real</span></h1>
          <p className="text-muted-foreground text-sm mb-8">Treine com questões reais do banco estratégico OAB.</p>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm font-medium text-foreground">Quantidade de questões</p>
              <div className="flex gap-2">
                {[10, 20, 40, 80].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumQuestoes(n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
                      numQuestoes === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <Clock className="inline h-3 w-3 mr-1" />
                Tempo: {formatTime(getTimeForQuestions(numQuestoes))} (~3 min/questão, padrão OAB)
              </p>
            </CardContent>
          </Card>

          <Button onClick={iniciar} size="lg" className="w-full active:scale-[0.97]">
            <Crosshair className="h-4 w-4 mr-2" /> Iniciar Simulado
          </Button>
        </div>
      </div>
    );
  }

  if (state === "result") {
    const percent = Math.round((acertos / questoes.length) * 100);
    const passed = percent >= 60;

    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="animate-reveal-up text-center space-y-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${passed ? "bg-success/15" : "bg-destructive/15"}`}>
            {passed ? <Trophy className="h-10 w-10 text-success" /> : <XCircle className="h-10 w-10 text-destructive" />}
          </div>

          <h1 className="text-3xl font-bold">Fim do Simulado</h1>
          
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary tabular-nums">{acertos}</p>
              <p className="text-xs text-muted-foreground">Acertos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-destructive tabular-nums">{erros.length}</p>
              <p className="text-xs text-muted-foreground">Erros</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-foreground tabular-nums">{percent}%</p>
              <p className="text-xs text-muted-foreground">Aproveitamento</p>
            </div>
          </div>

          <Progress value={percent} className="h-3 max-w-sm mx-auto" />

          <p className={`text-sm font-medium ${passed ? "text-success" : "text-destructive"}`}>
            {passed ? "Aprovado! Continue assim." : "Não atingiu a nota de corte (60%). Revise os erros."}
          </p>

          {erros.length > 0 && (
            <Card className="text-left mt-6">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-destructive">Questões Erradas</p>
                {erros.map((e, i) => (
                  <div key={i} className="text-xs text-muted-foreground border-b border-border pb-3 last:border-0">
                    <p className="text-foreground text-sm mb-1">{e.questao.slice(0, 150)}...</p>
                    <p className="text-success">Correta: {e.correta}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={exportarPDF} className="active:scale-[0.97]">
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
            <Button onClick={() => setState("idle")} variant="outline" className="active:scale-[0.97]">
              <RotateCcw className="h-4 w-4 mr-2" /> Novo Simulado
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Running state
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      {/* Timer + Progress header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground font-mono">
          Questão {index + 1}/{questoes.length}
        </p>
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground tabular-nums">
            {acertos} acertos · {erros.length} erros
          </p>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs tabular-nums ${
            timeLeft < 300 ? "bg-destructive/15 text-destructive animate-pulse-bar" : "bg-secondary text-foreground"
          }`}>
            <Clock className="h-3 w-3" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>
      <Progress value={((index + 1) / questoes.length) * 100} className="h-1.5 mb-6" />

      {/* Question */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-primary mb-3 bg-primary/10 px-2 py-0.5 rounded">
            {questaoAtual.tema}
          </span>
          <p className="text-sm leading-relaxed text-foreground">{questaoAtual.pergunta}</p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-2 mb-6">
        {questaoAtual.opcoes.map((op) => {
          let cls = optionButtonClass;
          if (showFeedback) {
            const isThis = op === selected;
            const isCorrectOp = op.slice(0, 2) === questaoAtual.correta.slice(0, 2);
            if (isCorrectOp) cls = optionCorrectClass;
            else if (isThis && !isCorrectOp) cls = optionWrongClass;
          }

          return (
            <button
              key={op}
              onClick={() => handleSelect(op)}
              disabled={showFeedback}
              className={cls + " disabled:cursor-default flex items-start gap-3"}
            >
              {showFeedback && op.slice(0, 2) === questaoAtual.correta.slice(0, 2) && (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
              )}
              {showFeedback && op === selected && !isCorrect && op.slice(0, 2) !== questaoAtual.correta.slice(0, 2) && (
                <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              )}
              <span>{op}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className="animate-reveal-up space-y-4">
          <Card className={isCorrect ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}>
            <CardContent className="p-5">
              <p className={`text-sm font-semibold mb-2 ${isCorrect ? "text-success" : "text-destructive"}`}>
                {isCorrect ? "✓ Resposta Correta!" : "✗ Resposta Incorreta"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {questaoAtual.comentario}
              </p>
            </CardContent>
          </Card>
          <Button onClick={proxima} className="w-full active:scale-[0.97]">
            {index + 1 >= questoes.length ? "Ver Resultado" : "Próxima Questão"} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
