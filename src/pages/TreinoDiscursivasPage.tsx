import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PenTool, Send, Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { ScrollArea } from "@/components/ui/scroll-area";

const MATERIAS = [
  { id: "penal", label: "Direito Penal" },
  { id: "civil", label: "Direito Civil" },
  { id: "trabalhista", label: "Direito do Trabalho" },
  { id: "tributario", label: "Direito Tributário" },
  { id: "administrativo", label: "Direito Administrativo" },
  { id: "constitucional", label: "Direito Constitucional" },
  { id: "empresarial", label: "Direito Empresarial" },
];

const TEMAS_POR_MATERIA: Record<string, string[]> = {
  penal: ["Teoria do Crime", "Crimes em Espécie", "Execução Penal", "Recursos"],
  civil: ["Família", "Sucessões", "Contratos", "Coisas", "Responsabilidade Civil"],
  trabalhista: ["Vínculo", "Verbas Rescisórias", "Jornada", "Processo do Trabalho"],
  tributario: ["Imunidade", "Competência", "Crédito Tributário", "Processo Judicial"],
  administrativo: ["Agentes Públicos", "Licitações", "Atos Administrativos", "Improbidade"],
  constitucional: ["Controle de Constitucionalidade", "Direitos Fundamentais", "Organização do Estado"],
  empresarial: ["Sociedades", "Falência e Recuperação", "Títulos de Crédito"],
};

const QUESTOES_FIXAS: Record<string, string[]> = {
  penal: [
    "Questão 1: Diferencie erro de tipo de erro de proibição e explique as consequências jurídicas de cada um.",
    "Questão 2: Discorra sobre o princípio da insignificância e seus requisitos cumulativos segundo a jurisprudência do STF.",
    "Questão 3: O que é crime impossível? Cite o artigo correspondente do Código Penal.",
    "Questão 4: Explique a teoria da actio libera in causa no contexto da embriaguez preordenada."
  ],
  civil: [
    "Questão 1: Explique a diferença entre prescrição e decadência no Direito Civil brasileiro.",
    "Questão 2: Discorra sobre a responsabilidade civil objetiva e subjetiva, citando exemplos de cada uma.",
    "Questão 3: Quais são os requisitos para a configuração da usucapião extraordinária?",
    "Questão 4: O que se entende por cláusula penal e qual sua função nos contratos?"
  ],
  trabalhista: [
    "Questão 1: Explique o princípio da continuidade da relação de emprego.",
    "Questão 2: Diferencie suspensão de interrupção do contrato de trabalho.",
    "Questão 3: Quais são os requisitos para a configuração do vínculo empregatício?",
    "Questão 4: Discorra sobre a equiparação salarial e seus requisitos após a Reforma Trabalhista."
  ],
  tributario: [
    "Questão 1: Discorra sobre o princípio da anterioridade tributária nonagesimal.",
    "Questão 2: Explique a diferença entre imunidade, isenção e alíquota zero.",
    "Questão 3: O que é o fato gerador da obrigação tributária?",
    "Questão 4: Quais são as causas de suspensão da exigibilidade do crédito tributário conforme o CTN?"
  ],
  administrativo: [
    "Questão 1: Explique os poderes da administração pública: hierárquico, disciplinar, regulamentar e de polícia.",
    "Questão 2: Discorra sobre os requisitos de validade do ato administrativo (COMFIFORM).",
    "Questão 3: Diferencie revogação de anulação do ato administrativo.",
    "Questão 4: O que se entende por responsabilidade civil do Estado no caso de atos omissivos?"
  ],
  constitucional: [
    "Questão 1: Discorra sobre a eficácia das normas constitucionais (plena, contida e limitada).",
    "Questão 2: Explique o controle de constitucionalidade concentrado e os legitimados para propor ADI.",
    "Questão 3: O que é o mandado de injunção e em quais casos é cabível?",
    "Questão 4: Discorra sobre a cláusula pétrea e os limites ao poder de reforma constitucional."
  ],
  empresarial: [
    "Questão 1: Diferencie sociedade limitada de sociedade anônima.",
    "Questão 2: Explique o conceito de estabelecimento empresarial.",
    "Questão 3: O que é a desconsideração da personalidade jurídica no Código Civil?",
    "Questão 4: Discorra sobre os títulos de crédito e seus princípios fundamentais."
  ]
};

export default function TreinoDiscursivasPage() {
  const { profile, loading } = useProfile();
  const isAssinante = profile?.assinante_2_fase === true;
  const { toast } = useToast();
  
  const [materia, setMateria] = useState(() => {
    return localStorage.getItem("selectedSubject") || "penal";
  });

  const [tema, setTema] = useState<string>("Sorteio Aleatório");
  const [questoes, setQuestoes] = useState<string[]>(QUESTOES_FIXAS[materia] || []);
  const [respostas, setRespostas] = useState<string[]>(["", "", "", ""]);
  const [feedbacks, setFeedbacks] = useState<(string | null)[]>([null, null, null, null]);
  const [corrigindo, setCorrigindo] = useState<boolean[]>([false, false, false, false]);
  const [gerandoQuestoes, setGerandoQuestoes] = useState(false);

  useEffect(() => {
    setQuestoes(QUESTOES_FIXAS[materia] || []);
    setRespostas(["", "", "", ""]);
    setFeedbacks([null, null, null, null]);
    setTema("Sorteio Aleatório");
  }, [materia]);

  const handleMateriaChange = (value: string) => {
    setMateria(value);
    localStorage.setItem("selectedSubject", value);
  };

  const handleGerarQuestoes = async () => {
    setGerandoQuestoes(true);
    try {
      let apiKey = "";
      let model = "";
      let requestBody = {};
      let url = "";

      try {
        apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
        model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
        const materiaLabel = MATERIAS.find(m => m.id === materia)?.label;
        const instrucaoMotor = "Você é um membro da banca examinadora da OAB (FGV). Sua missão é gerar questões discursivas inéditas no padrão FGV OAB com fundamentação legal precisa.";
        const promptFinal = `${instrucaoMotor}\n\nGere 4 questões discursivas inéditas no padrão FGV OAB especificamente sobre o tema [${tema === "Sorteio Aleatório" ? "aleatório/maior recorrência" : tema}] da matéria [${materiaLabel}]. 
Cada questão deve obrigatoriamente ter um item A e um item B. 
A resposta esperada deve conter a fundamentação legal precisa.
Retorne as questões começando cada uma com "Questão X: ".`;

        requestBody = {
          contents: [{ 
            role: "user",
            parts: [{ text: promptFinal }] 
          }]
        };

        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        console.log('URL de Destino:', url);
        console.log('Payload enviado:', JSON.stringify(requestBody));
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

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro detalhado da API Gemini:', data);
        throw new Error(data.error?.message || "Erro na resposta da API Gemini");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const novasQuestoes = text.split("\n").filter((l: string) => l.trim().startsWith("Questão")).slice(0, 4);
        if (novasQuestoes.length === 4) {
          setQuestoes(novasQuestoes);
          toast({ title: "Estudo Dirigido Ativado", description: `4 questões preparadas sobre ${tema}.` });
        } else {
          // Se não veio no formato certo, tenta limpar e pegar 4 blocos
          const blocos = text.split(/Questão \d:/).filter((b: string) => b.trim().length > 10).slice(0, 4);
          if (blocos.length === 4) {
            setQuestoes(blocos.map((b: string, i: number) => `Questão ${i+1}: ${b.trim()}`));
            toast({ title: "Estudo Dirigido Ativado", description: `4 questões preparadas sobre ${tema}.` });
          } else {
            setQuestoes(QUESTOES_FIXAS[materia]);
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao gerar questões", description: "Usando banco de questões padrão.", variant: "destructive" });
    } finally {
      setGerandoQuestoes(false);
    }
  };

  const handleCorrigirIndividual = async (index: number) => {
    if (!respostas[index].trim()) {
      toast({
        title: "Resposta Vazia",
        description: "Digite sua resposta antes de enviar para correção.",
        variant: "destructive",
      });
      return;
    }

    const novosCorrigindo = [...corrigindo];
    novosCorrigindo[index] = true;
    setCorrigindo(novosCorrigindo);

    try {
      let apiKey = "";
      let model = "";
      let requestBody = {};
      let url = "";

      try {
        apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
        model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
        const instrucao = `Você é o Corretor Especialista do JurisVision (Banca FGV). 
Sua missão é corrigir uma questão discursiva que possui itens A e B.
Avalie a resposta do aluno com base no espelho de correção da OAB.

Foque estritamente nestes critérios para cada item:
1. INDICAÇÃO DO ARTIGO (0,10 a 0,15): Verifique se o aluno citou o dispositivo legal correto.
2. FUNDAMENTAÇÃO JURÍDICA (até 1,10): Verifique se a explicação técnica está correta.

Retorne o feedback formatado:
[NOTA FINAL TOTAL]
- ITEM A: (Nota e Comentário)
- ITEM B: (Nota e Comentário)
- FUNDAMENTAÇÃO LEGAL: (Quais artigos deveriam ter sido citados)
- VEREDITO: (Dica cirúrgica para pontuar mais)`;

        const questaoOriginal = questoes[index];
        const respostaOriginal = respostas[index];

        const promptFinal = `${instrucao}\n\nQUESTÃO: ${questaoOriginal}\nRESPOSTA DO ALUNO: ${respostaOriginal}\n\nEmita a correção agora.`;

        requestBody = {
          contents: [{ 
            role: "user",
            parts: [{ text: promptFinal }] 
          }]
        };

        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        console.log('URL de Destino:', url);
        console.log('Payload enviado:', JSON.stringify(requestBody));
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

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro detalhado da API Gemini:', data);
        throw new Error(data.error?.message || "Erro na resposta da API Gemini");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        const novosFeedbacks = [...feedbacks];
        novosFeedbacks[index] = text;
        setFeedbacks(novosFeedbacks);
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Erro na Correção", description: "Não foi possível obter o feedback. Tente novamente.", variant: "destructive" });
    } finally {
      const novosCorrigindo = [...corrigindo];
      novosCorrigindo[index] = false;
      setCorrigindo(novosCorrigindo);
    }
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
          <PenTool className="h-10 w-10 text-primary" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-3xl font-black tracking-tight">ÁREA EXCLUSIVA: 2ª FASE</h1>
          <p className="text-muted-foreground">
            O módulo de Treino de Discursivas está disponível apenas para assinantes do plano JurisVision 2ª Fase.
          </p>
        </div>
        <Button size="lg" className="font-bold gap-2" onClick={() => window.open("https://wa.me/5511978353047", "_blank")}>
          <Sparkles className="h-4 w-4" /> QUERO SER ASSINANTE 2ª FASE
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-background">
      <div className="border-b bg-card p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" /> Treino de Discursivas
          </h1>
          <div className="flex items-center gap-2">
            <Select value={materia} onValueChange={handleMateriaChange}>
              <SelectTrigger className="w-[200px] bg-white text-black font-bold border-2 border-primary/20">
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tema} onValueChange={setTema}>
              <SelectTrigger className="w-[240px] bg-white text-black font-medium border-2 border-primary/20">
                <SelectValue placeholder="Tema para Treinar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sorteio Aleatório">🎲 Sorteio Aleatório</SelectItem>
                {TEMAS_POR_MATERIA[materia]?.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              size="sm" 
              className="gap-2 font-bold bg-primary hover:bg-primary/90 text-white" 
              onClick={handleGerarQuestoes}
              disabled={gerandoQuestoes}
            >
              {gerandoQuestoes ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              ATIVAR ESTUDO DIRIGIDO
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
          {questoes.map((q, index) => (
            <Card key={index} className="border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                  <Sparkles className="h-4 w-4" /> QUESTÃO 0{index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 divide-x divide-border">
                  {/* Lado do Enunciado e Resposta */}
                  <div className="p-6 space-y-4">
                    <div className="bg-primary/5 p-4 rounded-lg text-sm leading-relaxed font-medium text-foreground border border-primary/10">
                      {q}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sua Resposta</label>
                      <Textarea 
                        placeholder="Redija sua fundamentação aqui..." 
                        className="min-h-[180px] resize-none font-serif text-base focus-visible:ring-primary/20"
                        value={respostas[index]}
                        onChange={(e) => {
                          const novasRespostas = [...respostas];
                          novasRespostas[index] = e.target.value;
                          setRespostas(novasRespostas);
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full gap-2 font-bold" 
                      onClick={() => handleCorrigirIndividual(index)}
                      disabled={corrigindo[index]}
                    >
                      {corrigindo[index] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      CORRIGIR QUESTÃO 0{index + 1}
                    </Button>
                  </div>

                  {/* Lado do Feedback */}
                  <div className="p-6 bg-muted/5">
                    <div className="h-full flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Feedback da IA</label>
                      {feedbacks[index] ? (
                        <div className="bg-card border-2 border-primary/20 rounded-xl p-5 text-sm whitespace-pre-wrap leading-relaxed animate-in fade-in slide-in-from-right-4">
                          <div className="flex items-center gap-2 text-primary font-bold mb-3 border-b pb-2">
                            <CheckCircle2 className="h-4 w-4" /> Resultado da Avaliação
                          </div>
                          {feedbacks[index]}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-xl opacity-50">
                          <AlertTriangle className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-xs font-medium">Aguardando envio da resposta para análise técnica.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
