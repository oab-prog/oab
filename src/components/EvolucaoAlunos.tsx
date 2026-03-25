import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from "recharts";
import { Trophy, Target, TrendingUp, Calendar } from "lucide-react";

export default function EvolucaoAlunos() {
  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    // Carrega os dados que o Simulado salvou
    const dados = JSON.parse(localStorage.getItem("jurisvision_historico") || "[]");
    // Inverte para o gráfico mostrar do mais antigo para o mais novo
    setHistorico([...dados].reverse());
  }, []);

  if (historico.length === 0) {
    return (
      <Card className="bg-secondary/10 border-dashed border-white/10">
        <CardContent className="p-8 text-center space-y-3">
          <Target className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
          <p className="text-sm text-muted-foreground">
            Realize o seu primeiro simulado para começar a monitorizar a sua evolução.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Estatísticas Rápidas
  const mediaAcertos = Math.round(
    historico.reduce((acc, curr) => acc + curr.percentual, 0) / historico.length
  );
  const melhorNota = Math.max(...historico.map(h => h.percentual));

  return (
    <div className="space-y-6 animate-reveal">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card de Média */}
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Média Geral</p>
              <p className="text-2xl font-black">{mediaAcertos}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Melhor Simulado */}
        <Card className="bg-gradient-to-br from-gold/10 to-transparent border-gold/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-gold/20 rounded-lg">
              <Trophy className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Melhor Desempenho</p>
              <p className="text-2xl font-black text-gold">{melhorNota}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Total Realizado */}
        <Card className="bg-secondary/20 border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Simulados Feitos</p>
              <p className="text-2xl font-black">{historico.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card className="bg-secondary/10 border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Curva de Aprendizagem (Últimos 10 testes)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="data" 
                  hide 
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{fill: '#666', fontSize: 10}} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentual" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}