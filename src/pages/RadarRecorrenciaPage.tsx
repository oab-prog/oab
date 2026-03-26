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
    <div className="container mx-auto p-6 space-y-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            📊 Radar de Recorrência <Badge variant="secondary" className="ml-2">v1.6.1</Badge>
          </h1>
          <p className="text-slate-600 mt-2 font-medium">
            Inteligência Estatística Baseada na Recorrência Real da FGV/OAB
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
            🔥 Alta Prioridade
          </Badge>
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">
            ⚡ Recorrência Média
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="tributario" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 bg-slate-100 rounded-xl">
          {Object.entries(materiaData).map(([key, data]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <span className="text-lg mr-2">{data.emoji}</span>
              <span className="hidden md:inline text-xs font-bold uppercase text-slate-700">{key}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(materiaData).map(([key, data]) => (
          <TabsContent key={key} value={key} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border-2 shadow-none overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        {data.emoji} {data.nome}
                      </CardTitle>
                      <CardDescription className="text-slate-600">Distribuição de incidência histórica</CardDescription>
                    </div>
                    <TrendingUp className="text-slate-400 h-8 w-8" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[350px] w-full">
                    <ChartContainer config={{
                      value: { label: "Recorrência (%)", color: "#0f172a" }
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.pecas} margin={{ top: 20, right: 30, left: 40, bottom: 20 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            scale="band" 
                            width={150}
                            style={{ fontSize: '12px', fontWeight: 'bold', fill: '#0f172a' }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
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
                              style={{ fontSize: '12px', fontWeight: 'bold', fill: '#0f172a' }} 
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-2 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Target className="h-4 w-4" /> Top Temas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.temas.map((tema, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm font-bold text-slate-800">
                          <span>{tema.name}</span>
                          <span className={tema.value >= 18 ? "text-red-600" : "text-slate-700"}>{tema.value}%</span>
                        </div>
                        <Progress 
                          value={tema.value * 3} 
                          className="h-2" 
                          indicatorClassName={getProgressColor(tema.value)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-2 border-slate-900 bg-slate-900 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" /> Alerta de Perigo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-white leading-relaxed font-medium">
                      O tema <strong className="text-white underline decoration-yellow-400">"{data.temas[0].name}"</strong> e a peça <strong className="text-white underline decoration-yellow-400">"{data.pecas[0].name}"</strong> representam a maior probabilidade de cobrança nesta matéria. Foque 60% do seu tempo de revisão nestes tópicos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 border-2 rounded-xl flex items-center gap-4 bg-white">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                    🎯
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Estratégia de Peças</h4>
                    <p className="text-xs text-slate-600 font-medium">Pratique {data.pecas[0].name} pelo menos 3 vezes.</p>
                  </div>
               </div>
               <div className="p-4 border-2 rounded-xl flex items-center gap-4 bg-white">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                    📚
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Base Doutrinária</h4>
                    <p className="text-xs text-slate-600 font-medium">Domine {data.temas[0].name} para as questões discursivas.</p>
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
