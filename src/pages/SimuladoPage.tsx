import { useState, useMemo, useEffect, useRef } from "react";
import { bancoCompleto, type Questao, type ErroSessao } from "@/data/questoes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { optionButtonClass } from "@/components/AppButton";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight, RotateCcw, Trophy, XCircle, CheckCircle2, Download, Clock, Filter, Cloud } from "lucide-react";
import { jsPDF } from "jspdf";
import { User } from "@supabase/supabase-js";

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
  const [user, setUser] = useState<User | null>(null);

  // --- SINCRONIZAÇÃO HÍBRIDA ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar dados (Supabase exclusivo)
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const { data, error } = await (supabase
          .from("user_progress" as any) as any)
          .select("simulado_data")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao carregar progresso", error);
          return;
        }

        if (data?.simulado_data) {
          const simData = (data as any).simulado_data;
          setState(simData.state || "idle");
          setQuestoes(simData.questoes || []);
          setIndex(simData.index || 0);
          setAcertos(simData.acertos || 0);
          setErros(simData.erros || []);
          setSelected(simData.selected || null);
          setShowFeedback(simData.showFeedback || false);
          setTimeLeft(simData.timeLeft || 0);
          setTimerActive(simData.timerActive || false);
          setFiltroTema(simData.filtroTema || "Todos");
        }
      }
    };

    loadData();
  }, [user]);

  // Salvar dados (Auto-save exclusivo Supabase)
  useEffect(() => {
    if (!user || state === "idle" || state === "result") return;

    const dataToSave = {
      state,
      questoes,
      index,
      acertos,
      erros,
      selected,
      showFeedback,
      timeLeft,
      timerActive,
      filtroTema
    };

    const saveData = async () => {
      const { error } = await (supabase
        .from("user_progress" as any) as any)
        .upsert({ 
          user_id: user.id, 
          simulado_data: dataToSave,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) console.error("Erro ao sincronizar progresso", error);
    };

    const timeout = setTimeout(saveData, 1500); // Aumentado para 1.5s para poupar requisições
    return () => clearTimeout(timeout);
  }, [state, questoes, index, acertos, erros, selected, showFeedback, timeLeft, timerActive, filtroTema, user]);

  const resetSimulado = async () => {
    if (user) {
      await (supabase
        .from("user_progress" as any) as any)
        .update({ simulado_data: null })
        .eq("user_id", user.id);
    }
    
    setState("idle");
    setQuestoes([]);
    setIndex(0);
    setAcertos(0);
    setErros([]);
    setSelected(null);
    setShowFeedback(false);
    setTimeLeft(0);
    setTimerActive(false);
  };
  // ------------------------------

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

      const syncHistory = async () => {
        if (user) {
          // Busca histórico atual do Supabase
          const { data } = await (supabase.from("user_progress" as any) as any)
            .select("historico_data")
            .eq("user_id", user.id)
            .maybeSingle();
          
          const currentHistory = (data as any)?.historico_data || [];
          const updatedHistory = [novoResultado, ...currentHistory].slice(0, 10);

          await (supabase.from("user_progress" as any) as any)
            .upsert({ 
              user_id: user.id, 
              historico_data: updatedHistory,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        }
      };

      syncHistory();
    }
  }, [state, user]);

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
      <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-8 py-6 md:py-10">
        <div ref={hero.ref} style={hero.style} className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">SIMULADO <span className="text-gradient-gold">ESTRATÉGICO</span></h1>
          <p className="text-muted-foreground text-sm md:text-base">Configure o seu treino personalizado para a OAB.</p>
        </div>

        <Card className="bg-secondary/10 border-white/5 p-4 md:p-6">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {[10, 20, 40, 80].map((n) => (
                  <Button key={n} variant="outline" onClick={() => startSimulado(n)} className="h-14 md:h-16 flex flex-col border-white/10 hover:border-primary active:scale-[0.98]">
                    <span className="text-lg md:text-xl font-bold">{n}</span>
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
      <div className="p-4 md:p-6 max-w-2xl mx-auto py-10 space-y-8 animate-reveal">
        <Card className="border-none shadow-2xl bg-secondary/10 overflow-hidden text-center p-6 md:p-8">
           <Trophy className="h-10 w-10 md:h-12 md:w-12 text-gold mx-auto mb-4" />
           <h2 className="text-xl md:text-2xl font-bold">Simulado de {filtroTema}</h2>
           <div className="grid grid-cols-3 gap-2 md:gap-4 my-6">
             <div className="bg-background/40 p-3 rounded-lg"><p className="text-xl md:text-2xl font-black">{acertos}</p><p className="text-[9px] md:text-[10px] uppercase text-muted-foreground">Acertos</p></div>
             <div className="bg-background/40 p-3 rounded-lg"><p className="text-xl md:text-2xl font-black">{questoes.length}</p><p className="text-[9px] md:text-[10px] uppercase text-muted-foreground">Total</p></div>
             <div className="bg-background/40 p-3 rounded-lg"><p className="text-xl md:text-2xl font-black text-primary">{aproveitamento}%</p><p className="text-[9px] md:text-[10px] uppercase text-muted-foreground">Nota</p></div>
           </div>
           <div className="flex flex-col gap-3">
             <Button onClick={() => setState("idle")} className="w-full h-11">Voltar ao Início</Button>
             <Button variant="ghost" onClick={resetSimulado} className="w-full text-xs text-muted-foreground">Novo Simulado</Button>
           </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-10 max-w-4xl mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between py-2 md:py-4 border-b border-white/5 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <span className="font-mono font-bold text-lg md:text-xl tabular-nums">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={resetSimulado} className="text-[10px] uppercase tracking-tighter text-muted-foreground hover:text-destructive md:hidden">
            <RotateCcw className="h-3 w-3 mr-1" /> Reiniciar
          </Button>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase truncate max-w-[150px]">{filtroTema}</span>
            {user && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                <Cloud className="h-2.5 w-2.5" /> NUVEM
              </div>
            )}
          </div>
          <p className="font-bold text-sm md:text-base">{index + 1} <span className="text-muted-foreground font-normal">/ {questoes.length}</span></p>
          <Button variant="ghost" size="sm" onClick={resetSimulado} className="text-[10px] uppercase tracking-tighter text-muted-foreground hover:text-destructive hidden md:flex">
            <RotateCcw className="h-3 w-3 mr-1" /> Reiniciar Simulado
          </Button>
        </div>
      </div>

      <Progress value={progresso} className="h-1" />

      <Card className="border-none bg-secondary/5">
        <CardContent className="p-4 md:p-8 space-y-6">
          <p className="text-sm md:text-lg leading-relaxed font-medium">{questaoAtual.pergunta}</p>
          <div className="grid grid-cols-1 gap-2 md:gap-3">
            {questaoAtual.opcoes.map((op, i) => (
              <button
                key={i}
                disabled={showFeedback}
                onClick={() => handleOptionSelect(op)}
                className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border transition-all text-left
                  ${selected === op ? 'ring-2 ring-primary border-transparent' : 'border-white/5'}
                  ${showFeedback && op.charAt(0) === questaoAtual.correta ? 'bg-success/10 border-success/50' : ''}
                  ${showFeedback && selected === op && op.charAt(0) !== questaoAtual.correta ? 'bg-destructive/10 border-destructive/50' : ''}
                `}
              >
                <span className="h-5 w-5 md:h-6 md:w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0">{op.charAt(0)}</span>
                <span className="text-xs md:text-sm leading-snug">{op.slice(3)}</span>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className="p-4 md:p-5 rounded-xl bg-secondary/20 border border-white/10 animate-reveal-up overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-2 w-2 rounded-full ${selected?.charAt(0) === questaoAtual.correta ? 'bg-success' : 'bg-destructive'}`} />
                <p className="text-[10px] uppercase font-bold tracking-widest">Fundamentação</p>
              </div>
              <p className="text-[11px] md:text-xs text-muted-foreground italic mb-4 leading-relaxed max-h-[200px] overflow-y-auto pr-2">{questaoAtual.comentario}</p>
              <Button onClick={proxima} className="w-full gap-2 h-11 active:scale-[0.98]">
                {index < questoes.length - 1 ? 'Próxima Questão' : 'Ver Resultado'} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}