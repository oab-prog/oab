import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Loader2, ShieldCheck, Zap, BarChart3, Globe } from "lucide-react";

export function Auth({ onToggle }: { onToggle?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      if (onToggle) onToggle();
    } catch (error) {
      const err = error as Error;
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* SEÇÃO HERO - SPLIT LAYOUT */}
      <section className="flex-1 flex flex-col md:flex-row">
        {/* LADO ESQUERDO: CONTEÚDO DE MARKETING (Fica embaixo no mobile por padrão do flex-col, mas o pedido quer o form no topo no mobile) */}
        {/* Usando flex-col-reverse no mobile para o form ficar no topo */}
        <div className="flex-1 flex flex-col-reverse md:flex-row">
          
          <div className="flex-1 bg-muted/30 p-8 md:p-16 flex flex-col justify-center space-y-8 border-r border-border/50">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Zap className="h-3 w-3" /> Inteligência Forense
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                JurisVision: Sua Aprovação na OAB <span className="text-primary">Guiada por Dados</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Use o poder do nosso Radar de Recorrência para estudar o que realmente cai. Tecnologia forense a serviço da sua carteira da Ordem.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Radar de Recorrência</h4>
                  <p className="text-xs text-muted-foreground">Mapeamento estatístico completo das bancas.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Tecnologia Forense</h4>
                  <p className="text-xs text-muted-foreground">Análise profunda aplicada ao seu estudo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* LADO DIREITO: FORMULÁRIO DE LOGIN */}
          <div className="w-full md:w-[450px] p-8 flex flex-col justify-center items-center bg-background">
            <div className="w-full max-w-sm space-y-8">
              <div className="text-center space-y-2">
                <img 
                  src="https://raw.githubusercontent.com/oab-prog/oab/main/logo.png" 
                  alt="JurisVision Logo" 
                  className="h-20 w-20 mx-auto object-contain mb-6 drop-shadow-sm"
                />
                <h2 className="text-2xl font-bold tracking-tight">Acesse sua Área Pro</h2>
                <h3 className="text-sm md:text-base font-black text-white text-center uppercase tracking-tight leading-tight my-6 px-4 drop-shadow-sm">
                  ENTRE EM CONTATO AGORA E DESCUBRA O SEGREDO DA APROVAÇÃO NA OAB GUIADA POR DADOS!
                </h3>
              </div>

              <Card className="border-none shadow-none bg-transparent">
                <form onSubmit={handleAuth}>
                  <CardContent className="space-y-4 px-0">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Sua senha de acesso"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4 px-0 pt-4">
                    <Button type="submit" className="w-full h-11 font-bold text-base shadow-lg shadow-primary/20" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      ENTRAR AGORA
                    </Button>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors text-center w-full"
                      onClick={() => toast({ title: "Acesso Administrador", description: "Contate o suporte para redefinir sua senha." })}
                    >
                      Esqueceu sua senha? Clique aqui
                    </button>
                    <p className="mt-6 text-[10px] text-muted-foreground text-center leading-relaxed max-w-[280px] mx-auto">
                      Ao clicar em entrar, você concorda com nossos{" "}
                      <Link to="/termos" className="underline hover:text-primary transition-colors">Termos de Uso</Link>{" "}
                      e{" "}
                      <Link to="/privacidade" className="underline hover:text-primary transition-colors">Política de Privacidade</Link>. 
                      O JurisVision utiliza tecnologia de criptografia de ponta para proteger seu progresso.
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO JURISAUDITOR PRO */}
      <section className="bg-slate-950 text-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" /> Benefício Exclusivo
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tight">
            JurisAuditor Pro: <span className="text-amber-500">Segurança em Todas as Fases</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            Sua aprovação é nossa prioridade. Se você for reprovado por erro ou injustiça da banca, o JurisAuditor Pro oferece suporte especializado para análise e elaboração de recursos. Proteção total, do estudo à homologação.
          </p>
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-amber-500 mb-2">Análise Técnica</h4>
              <p className="text-sm text-slate-400">Revisão minuciosa do espelho de prova por especialistas.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-amber-500 mb-2">Recursos Prontos</h4>
              <p className="text-sm text-slate-400">Elaboração fundamentada de recursos administrativos.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="font-bold text-amber-500 mb-2">Suporte Jurídico</h4>
              <p className="text-sm text-slate-400">Orientação sobre direitos do examinando frente a ilegalidades.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ DE AUTORIDADE */}
      <footer className="bg-background border-t border-border py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <p className="font-bold text-lg">JurisVision</p>
            <p className="text-sm text-muted-foreground">Themis Consultoria Forense</p>
            <p className="text-xs text-muted-foreground">Sua segurança jurídica e pedagógica na OAB.</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suporte Especializado:</p>
            <a href="mailto:themis.ma.consultoria@gmail.com" className="text-primary hover:underline text-sm font-bold">
              themis.ma.consultoria@gmail.com
            </a>
            <p className="text-[10px] text-muted-foreground mt-4 opacity-50 font-bold uppercase tracking-widest">
              v1.2.1 — OFICIAL
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-[10px] text-muted-foreground">
          © 2026 SoftGestão – Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
