import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AlertTriangle, TrendingUp, BookOpen, Target } from 'lucide-react';

const materiaData = {
  tributario: {
    nome: "Direito Tributário",
    emoji: "⚖️",
    pecas: [
      { name: "Mandado de Segurança", value: 25 },
      { name: "Apelação", value: 15 },
      { name: "Repetição de Indébito", value: 12 },
      { name: "Embargos à Execução", value: 10 },
      { name: "Agravo de Instrumento", value: 8 },
    ],
    temas: [
      { name: "Imunidade", value: 20 },
      { name: "Crédito Tributário", value: 18 },
      { name: "Competência", value: 15 },
      { name: "Simples Nacional", value: 10 },
      { name: "Princípios", value: 12 },
    ]
  },
  penal: {
    nome: "Direito Penal",
    emoji: "⚖️",
    pecas: [
      { name: "Apelação", value: 30 },
      { name: "Memoriais", value: 25 },
      { name: "Resposta à Acusação", value: 20 },
      { name: "RESE", value: 12 },
      { name: "Agravo em Execução", value: 8 },
    ],
    temas: [
      { name: "Crimes/Patrimônio", value: 22 },
      { name: "Penas", value: 18 },
      { name: "Rito Processual", value: 15 },
      { name: "Teoria do Crime", value: 15 },
      { name: "Extinção Punibilidade", value: 10 },
    ]
  },
  civil: {
    nome: "Direito Civil",
    emoji: "⚖️",
    pecas: [
      { name: "Apelação", value: 28 },
      { name: "Petição Inicial", value: 22 },
      { name: "Agravo Instrumento", value: 15 },
      { name: "Contestação", value: 15 },
      { name: "Embargos Terceiro", value: 10 },
    ],
    temas: [
      { name: "Obrigações", value: 20 },
      { name: "Família", value: 18 },
      { name: "Resp. Civil", value: 15 },
      { name: "Sucessões", value: 12 },
      { name: "Contratos", value: 15 },
    ]
  },
  trabalho: {
    nome: "Direito do Trabalho",
    emoji: "⚖️",
    pecas: [
      { name: "Reclamatória", value: 35 },
      { name: "Recurso Ordinário", value: 25 },
      { name: "Contestação", value: 20 },
      { name: "Ação Consignação", value: 10 },
      { name: "Embargos", value: 5 },
    ],
    temas: [
      { name: "Verbas Rescisórias", value: 25 },
      { name: "Jornada Trabalho", value: 20 },
      { name: "Estabilidade", value: 15 },
      { name: "Remuneração", value: 15 },
      { name: "Justa Causa", value: 10 },
    ]
  },
  administrativo: {
    nome: "Direito Administrativo",
    emoji: "⚖️",
    pecas: [
      { name: "Mandado Segurança", value: 30 },
      { name: "Ação Ordinária", value: 20 },
      { name: "Apelação", value: 15 },
      { name: "Agravo Instrumento", value: 10 },
      { name: "Contestação", value: 10 },
    ],
    temas: [
      { name: "Licitações", value: 22 },
      { name: "Agentes Públicos", value: 18 },
      { name: "Atos Admin.", value: 15 },
      { name: "Resp. Civil Estado", value: 15 },
      { name: "Intervenção Prop.", value: 10 },
    ]
  },
  constitucional: {
    nome: "Direito Constitucional",
    emoji: "⚖️",
    pecas: [
      { name: "Mandado Segurança", value: 28 },
      { name: "ADI", value: 22 },
      { name: "Recurso Extraord.", value: 15 },
      { name: "Ação Popular", value: 15 },
      { name: "Habeas Data", value: 10 },
    ],
    temas: [
      { name: "Direitos Fund.", value: 25 },
      { name: "Controle Const.", value: 20 },
      { name: "Org. Estado", value: 15 },
      { name: "Poder Judiciário", value: 15 },
      { name: "Proc. Legislativo", value: 10 },
    ]
  },
  empresarial: {
    nome: "Direito Empresarial",
    emoji: "⚖️",
    pecas: [
      { name: "Falência/Recup.", value: 25 },
      { name: "Dissolução Soc.", value: 20 },
      { name: "Apelação", value: 15 },
      { name: "Contestação", value: 15 },
      { name: "Ação Monitoria", value: 10 },
    ],
    temas: [
      { name: "Sociedades", value: 25 },
      { name: "Títulos Crédito", value: 20 },
      { name: "Falência", value: 15 },
      { name: "Prop. Industrial", value: 15 },
      { name: "Contratos Emp.", value: 10 },
    ]
  }
};

const getProgressColor = (value: number) => {
  if (value >= 25) return "bg-red-500";
  if (value >= 15) return "bg-orange-500";
  return "bg-blue-500";
};

const RadarRecorrenciaPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 bg-[#020617] min-h-screen text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-2">
            📊 Radar de Recorrência <Badge variant="secondary" className="ml-2 bg-zinc-800 text-zinc-300 border-none">v1.7.0</Badge>
          </h1>
          <p className="text-zinc-400 mt-2 font-medium">
            Inteligência Estatística Baseada na Recorrência Real da FGV/OAB
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20">
            🔥 Alta Prioridade
          </Badge>
          <Badge className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20">
            ⚡ Recorrência Média
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="tributario" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          {Object.entries(materiaData).map(([key, data]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="py-3 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 rounded-lg transition-all"
            >
              <span className="text-lg mr-2">{data.emoji}</span>
              <span className="hidden md:inline text-xs font-bold uppercase">{key}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(materiaData).map(([key, data]) => (
          <TabsContent key={key} value={key} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-zinc-800 bg-zinc-900/30 shadow-none overflow-hidden">
                <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                        {data.emoji} {data.nome}
                      </CardTitle>
                      <CardDescription className="text-zinc-400">Distribuição de incidência histórica</CardDescription>
                    </div>
                    <TrendingUp className="text-zinc-600 h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[500px] w-full">
                    <ChartContainer config={{
                      value: { label: "Recorrência (%)", color: "#FFFFFF" }
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.pecas} margin={{ top: 20, right: 60, left: 40, bottom: 20 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#444" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            scale="band" 
                            width={160}
                            tick={{ fill: '#FFFFFF' }}
                            style={{ fontSize: '13px', fontWeight: 'bold' }}
                          />
                          <ChartTooltip content={<ChartTooltipContent className="bg-zinc-900 border-zinc-800 text-white" />} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {data.pecas.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.value >= 25 ? '#ef4444' : entry.value >= 15 ? '#f97316' : '#3b82f6'} 
                              />
                            ))}
                            <LabelList 
                              dataKey="value" 
                              position="right" 
                              formatter={(v: number) => `${v}%`} 
                              style={{ fontSize: '13px', fontWeight: 'bold', fill: '#FFFFFF' }} 
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-zinc-800 bg-zinc-900/30 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <Target className="h-4 w-4" /> Top Temas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.temas.map((tema, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm font-bold text-zinc-200">
                          <span>{tema.name}</span>
                          <span className={tema.value >= 18 ? "text-red-400" : "text-zinc-400"}>{tema.value}%</span>
                        </div>
                        <Progress 
                          value={tema.value * 3} 
                          className="h-2 bg-zinc-800" 
                          indicatorClassName={getProgressColor(tema.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-zinc-700 bg-zinc-800/50 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" /> Alerta de Perigo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                      O tema <strong className="text-white underline decoration-yellow-400">"{data.temas[0].name}"</strong> e a peça <strong className="text-white underline decoration-yellow-400">"{data.pecas[0].name}"</strong> representam a maior probabilidade de cobrança nesta matéria. Foque 60% do seu tempo de revisão nestes tópicos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 border border-zinc-800 rounded-xl flex items-center gap-4 bg-zinc-900/30">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Estratégia de Peças</h4>
                    <p className="text-xs text-zinc-400 font-medium">Pratique {data.pecas[0].name} pelo menos 3 vezes.</p>
                  </div>
               </div>
               <div className="p-4 border border-zinc-800 rounded-xl flex items-center gap-4 bg-zinc-900/30">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
                    📚
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Base Doutrinária</h4>
                    <p className="text-xs text-zinc-400 font-medium">Domine {data.temas[0].name} para as questões discursivas.</p>
                  </div>
               </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RadarRecorrenciaPage;
