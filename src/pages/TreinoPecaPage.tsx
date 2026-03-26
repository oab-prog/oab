import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfile } from "@/hooks/use-profile";

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
};

export default function TreinoPecaPage() {
  const { profile, loading } = useProfile();
  const isAssinante = profile?.assinante_2_fase === true;
  const [materia, setMateria] = useState("penal");
  const [textoAluno, setTextoAluno] = useState("");
  const [corrigindo, setCorrigindo] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { toast } = useToast();

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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyA_riNjroJk8CtkvD2bbFVUw9vidFRzV24";
      
      // ESCUDO ANTI-ALUCINAÇÃO (Regex do Inspetor_Geral_v2.py adaptado para TS)
      const padroesJulgados = [
        { regex: /HC\s+n[º°]?\s*[\d.]+\s?\/[A-Z]{2}/gi, tipo: "Habeas Corpus" },
        { regex: /REsp\s+[\d.]+\s?\/[A-Z]{2}/gi, tipo: "Recurso Especial" },
        { regex: /RHC\s+[\d.]+\s?\/[A-Z]{2}/gi, tipo: "RHC" },
        { regex: /AgRg\s+no\s+HC\s+[\d.]+\s?\/[A-Z]{2}/gi, tipo: "AgRg no HC" },
      ];

      let alertasRegex = "";
      padroesJulgados.forEach(p => {
        const matches = textoAluno.match(p.regex);
        if (matches) {
          matches.forEach(m => {
            alertasRegex += `\n⚠️ [${p.tipo}] ${m} detectado. O Inspetor recomenda validar a numeração no site do STJ/JusBrasil.`;
          });
        }
      });

      const instrucaoCorregedor = `Você é o M.A CORREGEDOR GERAL do JurisVision 2ª Fase.
Sua única missão é destruir e apontar erros em documentos gerados por alunos ou outras IAs.
Gere o LAUDO DE INSPEÇÃO com 4 seções:

1. ALUCINAÇÕES FÁTICAS: Liste invenções de fatos que não constam no enunciado.
2. ERROS DE FUNDAMENTAÇÃO E ARTIGOS: Liste ausência de artigos obrigatórios ou citações erradas.
3. AVISOS DE SEGURANÇA: O documento cita jurisprudência real ou inventada?
4. VEREDITO FINAL: APROVADO ou REPROVADO - RISCO GRAVE.

Seja frio, direto e rigoroso. Não use introduções cordiais.`;

      const promptUsuario = `ENUNCIADO DO CASO PRÁTICO:
${CASOS_PRATICOS[materia] || "Considere um caso complexo da matéria selecionada."}

PEÇA DO ALUNO PARA INSPEÇÃO:
${textoAluno}

Emita seu LAUDO DE INSPEÇÃO agora.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${instrucaoCorregedor}\n\n${promptUsuario}` }] }]
        })
      });

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        if (alertasRegex) {
          text = `--- ALERTAS DE SEGURANÇA (CAMADA 1) ---\n${alertasRegex}\n\n--- LAUDO DE IA (CAMADA 2) ---\n${text}`;
        }
        setFeedback(text);
      } else {
        throw new Error("Falha ao obter resposta da IA.");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na Correção",
        description: "Não foi possível conectar ao Inspetor Geral. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCorrigindo(false);
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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="border-b bg-card p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> JurisVision 2ª Fase
          </h1>
          <Select value={materia} onValueChange={setMateria}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Selecione a matéria" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          onClick={handleCorrigir} 
          disabled={corrigindo}
          className="bg-primary hover:bg-primary/90 text-white font-bold gap-2"
        >
          {corrigindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
          CORRIGIR PEÇA COM INSPETOR
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* LADO ESQUERDO: ENUNCIADO E FEEDBACK */}
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

          {/* LADO DIREITO: EDITOR */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col bg-background">
              <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Editor de Peça Processual</span>
                <span className="text-[10px] text-muted-foreground italic">Dica: Use parágrafos claros e fundamente no Direito.</span>
              </div>
              <Textarea
                className="flex-1 resize-none border-none focus-visible:ring-0 p-8 font-serif text-lg leading-loose"
                placeholder="Comece a redigir sua peça aqui... Ex: EXCELENTÍSSIMO SENHOR DOUTOR JUIZ..."
                value={textoAluno}
                onChange={(e) => setTextoAluno(e.target.value)}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
