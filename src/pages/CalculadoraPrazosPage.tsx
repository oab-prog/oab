import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CalendarDays, AlertTriangle, Scale, Info, CheckCircle2 } from "lucide-react";
import { format, addDays, isWeekend, isBefore, isAfter, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";

const HOLIDAYS_2026 = [
  "2026-01-01", // Ano Novo
  "2026-02-16", // Carnaval
  "2026-02-17", // Carnaval
  "2026-04-03", // Sexta-feira Santa
  "2026-04-21", // Tiradentes
  "2026-05-01", // Dia do Trabalho
  "2026-06-04", // Corpus Christi
  "2026-09-07", // Independência
  "2026-10-12", // Nsa Sra Aparecida
  "2026-11-02", // Finados
  "2026-11-15", // Proclamação da República
  "2026-11-20", // Consciência Negra
  "2026-12-25", // Natal
];

const PIECE_TYPES = [
  { label: "Apelação (15 dias)", value: "15", area: "Cível/Penal" },
  { label: "Agravo de Instrumento (15 dias)", value: "15", area: "Cível" },
  { label: "Recurso Especial (15 dias)", value: "15", area: "Cível" },
  { label: "Recurso Extraordinário (15 dias)", value: "15", area: "Cível" },
  { label: "Embargos de Declaração (5 dias)", value: "5", area: "Geral" },
  { label: "Recurso Ordinário - ROC (8 dias)", value: "8", area: "Trabalho" },
  { label: "Agravo de Instrumento (8 dias)", value: "8", area: "Trabalho" },
  { label: "Recurso de Revista (8 dias)", value: "8", area: "Trabalho" },
  { label: "Contestação (15 dias)", value: "15", area: "Cível" },
  { label: "Réplica (15 dias)", value: "15", area: "Cível" },
];

const CalculadoraPrazosPage = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [pieceDays, setPieceDays] = useState<string>("15");
  const [resultDate, setResultDate] = useState<Date | null>(null);

  const isHolidayOrWeekendOrRecess = (date: Date): boolean => {
    const day = date.getDay();
    if (day === 0 || day === 6) return true; // Final de semana (Sáb/Dom)

    const dateString = format(date, "yyyy-MM-dd");
    if (HOLIDAYS_2026.includes(dateString)) return true; // Feriado Nacional 2026

    // Recesso Forense: 20 de Dezembro a 20 de Janeiro (Art. 220 CPC)
    const month = date.getMonth(); // 0-11
    const dayOfMonth = date.getDate();

    // De 20/12 em diante
    if (month === 11 && dayOfMonth >= 20) return true;
    // Até 20/01 inclusive
    if (month === 0 && dayOfMonth <= 20) return true;

    return false;
  };

  const calculateDeadline = (start: Date, days: number) => {
    let currentDate = new Date(start);
    let daysAdded = 0;

    // A contagem começa no primeiro dia útil APÓS a intimação (Art. 224 CPC)
    // "Exclui-se o dia do começo e inclui-se o dia do vencimento"
    
    currentDate = addDays(currentDate, 1);
    
    // Se o dia de início da contagem não for útil, pula para o próximo útil
    while (isHolidayOrWeekendOrRecess(currentDate)) {
      currentDate = addDays(currentDate, 1);
    }

    while (daysAdded < (days - 1)) { // Já estamos no primeiro dia útil
      currentDate = addDays(currentDate, 1);
      if (!isHolidayOrWeekendOrRecess(currentDate)) {
        daysAdded++;
      }
    }

    return currentDate;
  };

  useEffect(() => {
    if (startDate) {
      const deadline = calculateDeadline(startDate, parseInt(pieceDays));
      setResultDate(deadline);
    }
  }, [startDate, pieceDays]);

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500 bg-[#020617] min-h-screen text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6 -mx-6 px-6 pt-4 bg-zinc-900/20">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            Calculadora de Prazos <span className="text-blue-500">2026</span>
          </h1>
          <p className="text-zinc-400 mt-1 font-medium">
            Motor de Cálculo em Dias Úteis (Art. 219 CPC) • Calendário OAB/FGV
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
           <Scale className="h-4 w-4 text-blue-400" />
           <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">v1.7.0 | OAB-FGV Compliance</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/30 shadow-none">
            <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                Data da Intimação
              </CardTitle>
              <CardDescription className="text-zinc-400">O prazo começa a contar no dia útil seguinte</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={ptBR}
                className="rounded-md border border-zinc-800 shadow-sm mx-auto bg-zinc-950 text-white"
              />
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/30 shadow-none">
            <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Info className="h-5 w-5 text-blue-500" />
                Tipo de Peça
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="piece-type" className="font-bold text-zinc-300">Selecione a Peça Prática</Label>
                <Select value={pieceDays} onValueChange={setPieceDays}>
                  <SelectTrigger id="piece-type" className="h-12 border-zinc-800 focus:ring-blue-500 bg-zinc-950 text-white">
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {PIECE_TYPES.map((piece) => (
                      <SelectItem key={`${piece.label}-${piece.value}`} value={piece.value} className="focus:bg-zinc-800 focus:text-white">
                        <div className="flex flex-col py-1">
                          <span className="font-bold text-white">{piece.label}</span>
                          <span className="text-[10px] uppercase font-black text-blue-400">{piece.area}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-blue-500/50 bg-zinc-900/40 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Clock className="h-32 w-32 rotate-12 text-white" />
            </div>
            
            <div className="bg-blue-600/20 border-b border-blue-500/20 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-blue-400" /> Resultado da Contagem
              </h3>
            </div>
            
            <CardContent className="p-12 text-center space-y-8 relative z-10">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Data Final para Protocolo</p>
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                  {resultDate ? format(resultDate, "dd/MM/yyyy") : "--/--/----"}
                </h2>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="h-px w-8 bg-blue-500/20" />
                  <p className="text-xl font-black text-blue-400 uppercase tracking-tight">
                    {resultDate ? format(resultDate, "EEEE", { locale: ptBR }) : ""}
                  </p>
                  <div className="h-px w-8 bg-blue-500/20" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Início (Intimação)</p>
                   <p className="text-xl font-black text-zinc-200">{startDate ? format(startDate, "dd/MM/yyyy") : "--"}</p>
                   <p className="text-[10px] text-zinc-400 font-bold">{startDate ? format(startDate, "EEEE", { locale: ptBR }) : ""}</p>
                </div>
                <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Prazo Processual</p>
                   <p className="text-xl font-black text-zinc-200">{pieceDays} dias úteis</p>
                   <p className="text-[10px] text-zinc-400 font-bold">Art. 219 CPC/2015</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4 text-left">
                <div className="bg-amber-500/20 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-amber-400 uppercase">Cláusula de Barreira:</p>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Esta calculadora automatiza a contagem considerando o <strong className="font-bold text-white">Recesso Forense (20/12 a 20/01)</strong> e feriados nacionais de 2026. 
                    Sempre confirme suspensões locais por feriados municipais ou instabilidade de sistemas nos sites dos Tribunais (TJ/TRF/TRT).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/30 shadow-none overflow-hidden">
            <CardHeader className="pb-4 bg-zinc-900/50 border-b border-zinc-800">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Fundamentação Legal & Regras de Contagem</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-zinc-400">
                <div className="space-y-3 p-4 bg-zinc-900/20 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                    <Scale className="h-4 w-4" />
                    <span>CPC, Art. 219</span>
                  </div>
                  <p className="italic leading-relaxed">"Na contagem de prazo em dias, estabelecido por lei ou pelo juiz, computar-se-ão somente os <strong className="text-zinc-200">dias úteis</strong>."</p>
                </div>
                <div className="space-y-3 p-4 bg-zinc-900/20 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
                    <Scale className="h-4 w-4" />
                    <span>CPC, Art. 224</span>
                  </div>
                  <p className="italic leading-relaxed">"Salvo disposição em contrário, os prazos serão contados <strong className="text-zinc-200">excluindo o dia do começo</strong> e incluindo o dia do vencimento."</p>
                </div>
              </div>
              <div className="mt-6 p-4 border-t border-zinc-800 text-[10px] text-zinc-500 font-medium flex justify-between items-center">
                 <span>JurisVision Engine v1.7.0 • 2026 Edition</span>
                 <span className="flex items-center gap-1">
                   <CheckCircle2 className="h-3 w-3 text-green-500" /> Sistema Atualizado
                 </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraPrazosPage;
