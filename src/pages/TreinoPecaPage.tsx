import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, Info, Maximize2, Minimize2, Play, Pause, RotateCcw, Eye, Clock, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfile } from "@/hooks/use-profile";
import { exportarPecaPDF } from "@/lib/pdf-export";

const MATERIAS = [
  { id: "penal", label: "Direito Penal" },
  { id: "civil", label: "Direito Civil" },
  { id: "trabalhista", label: "Direito do Trabalho" },
  { id: "tributario", label: "Direito Tributário" },
  { id: "administrativo", label: "Direito Administrativo" },
  { id: "constitucional", label: "Direito Constitucional" },
  { id: "empresarial", label: "Direito Empresarial" },
];

const CASOS_PRATICOS: Record<string, string> = {
  penal: "Enunciado: Tício, primário e de bons antecedentes, foi denunciado pela prática do crime de furto qualificado pelo rompimento de obstáculo (Art. 155, §4º, I, do CP). Durante a instrução, a única prova do rompimento de obstáculo foi o depoimento da vítima, não tendo sido realizado exame pericial, apesar de os vestígios ainda existirem à época dos fatos. Em sede de alegações finais, a defesa deve buscar a desclassificação para furto simples.",
  civil: "Enunciado: João celebrou contrato de compra e venda de um veículo com a concessionária X. Após 45 dias de uso, o motor fundiu devido a um defeito de fabricação preexistente. A concessionária se recusa a realizar o conserto em garantia, alegando que o prazo de 30 dias para vícios aparentes já expirou. Redija a peça cabível para defender os interesses de João.",
  trabalhista: "Enunciado: A empresa 'Alfa Ltda' dispensou o funcionário 'Beto' sem justa causa. Beto trabalhava em ambiente com ruído acima dos limites de tolerância sem o uso de EPIs adequados, mas nunca recebeu adicional de insalubridade. Além disso, cumpria jornada de 10 horas diárias sem o pagamento de horas extras. Elabore a petição inicial.",
  tributario: "Enunciado: A empresa 'Beta S/A' recebeu notificação de lançamento de IPTU sobre imóvel que goza de imunidade tributária por ser templo de qualquer culto. A autoridade administrativa manteve o lançamento alegando que parte do imóvel é usada para residência do zelador. Redija a peça cabível para anular o débito.",
  administrativo: "Enunciado: O Município 'Y' instaurou processo administrativo disciplinar contra o servidor estável 'Carlos', resultando em sua demissão. Ocorre que a comissão processante foi composta por servidores temporários, violando o estatuto local e a jurisprudência dos tribunais superiores. Elabore a peça para reverter a demissão.",
  constitucional: "Enunciado: Lei do Estado 'Z' estabelece normas sobre proteção de dados pessoais em âmbito estadual, prevendo sanções administrativas severas. O partido político 'Alfa' entende que a lei padece de vício de inconstitucionalidade formal por invadir competência privativa da União. Proponha a ação direta cabível.",
  empresarial: "Enunciado: A sociedade 'Ômega Ltda', em grave crise econômico-financeira, mas com viabilidade de soerguimento, pretende ingressar com pedido de recuperação judicial. Os sócios divergem sobre a inclusão de créditos com garantia fiduciária no plano. Redija a petição inicial de recuperação.",
};

const INSTRUCOES_MOTORES: Record<string, string> = {
  penal: "Especialista em Direito Penal e Processo Penal. Foque em teses de nulidade, mérito e dosimetria. RIGOR: Alegações Finais, Apelação e HC.",
  civil: "Especialista em Direito Civil e Processo Civil. Foque em pressupostos processuais, mérito e pedidos. RIGOR: Petição Inicial, Contestação e Agravo.",
  trabalhista: "Especialista em Direito do Trabalho e Processo do Trabalho. Foque em verbas rescisórias, jornada e insalubridade. RIGOR: Reclamação Trabalhista e Recurso Ordinário.",
  tributario: "Auditor Forense Especialista em Direito Tributário. RIGOR MÁXIMO para Mandado de Segurança, Agravo, Apelação e Repetição de Indébito. Validar CTN e CF/88. PROIBIDO inventar lançamentos ou CDAs.",
  administrativo: "Especialista em Direito Administrativo. Foque em licitações, processos disciplinares e atos de improbidade. Validar Leis 8.112, 8.429, 9.784, 14.133. RIGOR: Apelação e MS.",
  constitucional: "Auditor Forense Especialista em Direito Constitucional. Foque em Mandado de Segurança, ADI e Ação Popular. TRAVA LEGISLATIVA: CF/88.",
  empresarial: "Especialista em Direito Empresarial. Foque em Direito Societário, Falência e Recuperação Judicial. Validar Código Civil, Lei 11.101, Lei 6.404.",
};

export default function TreinoPecaPage() {
  const { profile, loading } = useProfile();
  const isAssinante = profile?.assinante_2_fase === true;
  const [materia, setMateria] = useState(() => {
    return localStorage.getItem("selectedSubject") || "penal";
  });

  const handleMateriaChange = (value: string) => {
    setMateria(value);
    localStorage.setItem("selectedSubject", value);
  };
  const [textoAluno, setTextoAluno] = useState("");
  const [corrigindo, setCorrigindo] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { toast } = useToast();

  // v1.9.5: Cronômetro
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // v1.9.5: Modo Foco
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showEnunciadoFloating, setShowEnunciadoFloating] = useState(false);

  // v1.9.5: Lógica de Linhas OAB (estimada)
  const [linhasCount, setLinhasCount] = useState(0);

  useEffect(() => {
    // Restaurar auto-save local ao carregar
    const savedDraft = localStorage.getItem(`draft_peca_${materia}`);
    if (savedDraft) {
      setTextoAluno(savedDraft);
      toast({
        title: "Rascunho Restaurado",
        description: "Seu trabalho anterior foi carregado automaticamente.",
      });
    }
  }, [materia]);

  // Cronômetro Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  // Auto-save Logic (30 seconds)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (textoAluno.trim()) {
        localStorage.setItem(`draft_peca_${materia}`, textoAluno);
        // Toast discreto removido para não poluir, ou usar algo rápido
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [textoAluno, materia]);

  // Contador de Linhas (Simulação Jurídica)
  useEffect(() => {
    // Estimativa OAB: ~70 caracteres por linha no papel padrão OAB
    // Ou simplesmente contar quebras de linha + wrap
    const lines = textoAluno.split("\n");
    let count = 0;
    lines.forEach(line => {
      // Se a linha for vazia mas existir, conta como 1
      // Se for muito longa, conta como múltiplas linhas (wrap)
      const wraps = Math.max(1, Math.ceil(line.length / 80)); 
      count += wraps;
    });
    setLinhasCount(count);
  }, [textoAluno]);

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFocusMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const handleCorrigir = async () => {
    if (!textoAluno.trim()) {
      toast({
        title: "Campo Vazio",
        description: "Escreva sua peça antes de solicitar a correção.",
        variant: "destructive",
      });
      return;
    }

    setCorrigindo(true);
    setFeedback(null);

    try {
      let apiKey = "";
      let model = "";
      let requestBody = {};
      let url = "";
      let alertasRegex = "";

      try {
        apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
        model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
        
        // ESCUDO ANTI-ALUCINAÇÃO (Regex do Inspetor_Geral_v2.py adaptado para TS)
        const padroesJulgados = [
          { regex: /HC\s+n[º°]?\s*[\d.]+\s?\/[A-Z]{2}/gi, tipo: "Habeas Corpus" },
          { regex: /REsp\s+[\d.]+\s?\/[A-Z]{2}/gi, tipo: "Recurso Especial" },
          { regex: /RHC\s+[\d.]+\s?\/[A-Z]{2}/gi, tipo: "RHC" },
          { regex: /AgRg\s+no\s+HC\s+[\d.]+\s?\/[A-Z]{2}/gi, tipo: "AgRg no HC" },
        ];

        padroesJulgados.forEach(p => {
          const matches = textoAluno.match(p.regex);
          if (matches) {
            matches.forEach(m => {
              alertasRegex += `\n⚠️ [${p.tipo}] ${m} detectado. O Inspetor recomenda validar a numeração no site do STJ/JusBrasil.`;
            });
          }
        });

        const instrucaoMotor = INSTRUCOES_MOTORES[materia] || "Especialista em Direito.";
        const instrucaoCorregedor = `Você é o M.A CORREGEDOR GERAL do JurisVision 2ª Fase.
Sua única missão é destruir e apontar erros em documentos gerados por alunos ou outras IAs.
DIRETRIZ ESPECÍFICA DO MOTOR: ${instrucaoMotor}

Gere o LAUDO DE INSPEÇÃO com 4 seções:

1. ALUCINAÇÕES FÁTICAS: Liste invenções de fatos que não constam no enunciado.
2. ERROS DE FUNDAMENTAÇÃO E ARTIGOS: Liste ausência de artigos obrigatórios ou citações erradas.
3. AVISOS DE SEGURANÇA: O documento cita jurisprudência real ou inventada?
4. VEREDITO FINAL: APROVADO ou REPROVADO - RISCO GRAVE.

Seja frio, direto e rigoroso. Não use introduções cordiais.`;

        const enunciadoOriginal = CASOS_PRATICOS[materia] || "Considere um caso complexo da matéria selecionada.";
        const textoAlunoOriginal = textoAluno;

        const promptFinal = `${instrucaoCorregedor}\n\nENUNCIADO DO CASO PRÁTICO:\n${enunciadoOriginal}\n\nPEÇA DO ALUNO PARA INSPEÇÃO:\n${textoAlunoOriginal}\n\nEmita seu LAUDO DE INSPEÇÃO agora.`;

        requestBody = {
          contents: [{ 
            role: "user",
            parts: [{ text: promptFinal }] 
          }]
        };

        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        if (!apiKey) {
          alert('Configuração Pendente: Insira a nova API Key');
          setCorrigindo(false);
          return;
        }
      } catch (error) {
        console.error('Erro na preparação do envio:', error);
        throw error;
      }

      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok && model === 'gemini-2.5-flash') {
        console.warn('Falha no gemini-2.5-flash, tentando fallback para gemini-1.5-flash');
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        response = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
      }

      if (!response.ok) {
        throw new Error("Conexão em manutenção. Por favor, tente em instantes.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Conexão em manutenção. Por favor, tente em instantes.");
      }

      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        if (alertasRegex) {
          text = `--- ALERTAS DE SEGURANÇA (CAMADA 1) ---\n${alertasRegex}\n\n--- LAUDO DE IA (CAMADA 2) ---\n${text}`;
        }
        setFeedback(text);
      } else {
        throw new Error("Falha ao obter resposta da IA.");
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro na Correção",
        description: error.message || "Conexão em manutenção. Por favor, tente em instantes.",
        variant: "destructive",
      });
    } finally {
      setCorrigindo(false);
    }
  };

  const handleExportPDF = () => {
    if (!textoAluno.trim()) {
      toast({
        title: "Campo Vazio",
        description: "Escreva sua peça antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    const materiaLabel = MATERIAS.find(m => m.id === materia)?.label || materia;
    const nomeAluno = profile?.full_name || "Aluno JurisVision";
    
    exportarPecaPDF(
      textoAluno,
      materiaLabel,
      nomeAluno,
      `Peça_${materia}_${new Date().toISOString().slice(0, 10)}.pdf`
    );

    toast({
      title: "PDF Gerado",
      description: "Sua peça foi exportada com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAssinante) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-6">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-primary" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-3xl font-black tracking-tight">ÁREA EXCLUSIVA: 2ª FASE</h1>
          <p className="text-muted-foreground">
            O módulo de Treinamento de Peças com IA está disponível apenas para assinantes do plano JurisVision 2ª Fase.
          </p>
        </div>
        <Button size="lg" className="font-bold gap-2" onClick={() => window.open("https://wa.me/5511978353047", "_blank")}>
          <Sparkles className="h-4 w-4" /> QUERO SER ASSINANTE 2ª FASE
        </Button>
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-3.5rem)] flex flex-col ${isFocusMode ? "fixed inset-0 z-50 bg-background h-screen" : ""}`}>
      {/* CABEÇALHO COM CRONÔMETRO v1.9.5 */}
      <div className="border-b bg-card p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {!isFocusMode && (
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> JurisVision 2ª Fase
            </h1>
          )}
          <Select value={materia} onValueChange={handleMateriaChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione a matéria" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* TIMER COMPONENT */}
          <div className="flex items-center gap-3 px-4 py-1.5 bg-muted/40 rounded-full border border-border/50">
            <Clock className={`h-4 w-4 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <span className="font-mono font-bold text-sm tracking-tighter w-16">{formatTime(seconds)}</span>
            <div className="flex items-center gap-1 border-l ml-1 pl-2">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsActive(!isActive)}>
                {isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleResetTimer}>
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isFocusMode && (
            <Button 
              variant="outline" 
              size="sm" 
              className="font-bold gap-2" 
              onClick={() => setShowEnunciadoFloating(!showEnunciadoFloating)}
            >
              <Eye className="h-4 w-4" /> {showEnunciadoFloating ? "OCULTAR" : "VER"} ENUNCIADO
            </Button>
          )}
          <Button 
            variant="outline"
            className="font-bold gap-2"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4" /> EXPORTAR PDF
          </Button>
          <Button 
            onClick={handleCorrigir} 
            disabled={corrigindo}
            className="bg-primary hover:bg-primary/90 text-white font-bold gap-2"
          >
            {corrigindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
            CORRIGIR PEÇA COM INSPETOR
          </Button>
          {isFocusMode && (
            <Button variant="ghost" size="icon" onClick={toggleFocusMode}>
              <Minimize2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Floating Enunciado in Focus Mode */}
        {isFocusMode && showEnunciadoFloating && (
          <div className="absolute left-8 top-8 z-50 w-1/3 max-h-[70vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <Card className="border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
              <CardHeader className="py-3 bg-muted/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="h-4 w-4" /> ENUNCIADO DO CASO
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm leading-relaxed max-h-[50vh] overflow-y-auto">
                {CASOS_PRATICOS[materia]}
              </CardContent>
            </Card>
          </div>
        )}

        <ResizablePanelGroup direction="horizontal">
          {/* LADO ESQUERDO: ENUNCIADO E FEEDBACK (Só visível se não estiver no modo foco) */}
          {!isFocusMode && (
            <>
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full flex flex-col border-r">
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      <section>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                          <Info className="h-4 w-4" /> Enunciado do Caso Prático
                        </h3>
                        <Card className="bg-muted/30 border-dashed">
                          <CardContent className="pt-6 text-sm leading-relaxed">
                            {CASOS_PRATICOS[materia] || "Escolha uma matéria para visualizar o caso."}
                          </CardContent>
                        </Card>
                      </section>

                      {feedback && (
                        <section className="animate-in fade-in slide-in-from-left-4 duration-500">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Laudo do Inspetor Geral
                          </h3>
                          <Card className={`border-2 ${feedback.includes("REPROVADO") ? "border-destructive/50 bg-destructive/5" : "border-success/50 bg-success/5"}`}>
                            <CardContent className="pt-6 text-sm whitespace-pre-wrap leading-relaxed">
                              {feedback}
                            </CardContent>
                          </Card>
                        </section>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* LADO DIREITO: EDITOR */}
          <ResizablePanel defaultSize={isFocusMode ? 100 : 60} minSize={40}>
            <div className={`h-full flex flex-col bg-background ${isFocusMode ? "max-w-4xl mx-auto shadow-2xl border-x" : ""}`}>
              <div className="px-4 py-2 border-b bg-muted/10 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Editor de Peça Processual - v1.9.6</span>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-muted-foreground italic hidden sm:inline">Use parágrafos claros e fundamente no Direito.</span>
                  {!isFocusMode && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleFocusMode}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex-1 relative flex flex-col overflow-hidden">
                <Textarea
                  className={`flex-1 resize-none border-none focus-visible:ring-0 p-8 md:p-12 font-serif text-lg leading-loose bg-[#09090b] text-[#FFFFFF] placeholder:text-[#FFFFFF]/50`}
                  placeholder="Comece a redigir sua peça aqui... Ex: EXCELENTÍSSIMO SENHOR DOUTOR JUIZ..."
                  value={textoAluno}
                  onChange={(e) => setTextoAluno(e.target.value)}
                />
                
                {/* FOOTER DO EDITOR: CONTADOR v1.9.5 */}
                <div className="p-3 border-t-2 border-primary/20 bg-[#09090b] flex items-center justify-between shrink-0">
                  <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${linhasCount > 150 ? "text-destructive animate-pulse" : "text-muted-foreground"}`}>
                    <AlertTriangle className={`h-3.5 w-3.5 ${linhasCount > 150 ? "opacity-100" : "opacity-0"}`} />
                    LINHA: {linhasCount} / 150
                    {linhasCount > 150 && <span className="ml-1 uppercase">(Limite OAB Excedido)</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    Salvamento automático ativo
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
