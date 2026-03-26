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
    // Se o dia seguinte à intimação não for útil, o prazo só começa a correr no próximo dia útil.
    
    currentDate = addDays(currentDate, 1);
    
    while (daysAdded < days) {
      if (!isHolidayOrWeekendOrRecess(currentDate)) {
        daysAdded++;
      }
      
      // Se ainda não atingimos o número de dias, avançamos para o próximo
      if (daysAdded < days) {
        currentDate = addDays(currentDate, 1);
      }
    }

    // O loop garante que currentDate pare em um dia útil (pois daysAdded só incrementa em dias úteis)
    return currentDate;
  };

  useEffect(() => {
    if (startDate) {
      const deadline = calculateDeadline(startDate, parseInt(pieceDays));
      setResultDate(deadline);
    }
  }, [startDate, pieceDays]);

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 bg-white -mx-6 px-6 pt-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600" />
            Calculadora de Prazos <span className="text-blue-600">2026</span>
          </h1>
          <p className="text-slate-600 mt-1 font-medium">
            Motor de Cálculo em Dias Úteis (Art. 219 CPC) • Calendário OAB/FGV
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
           <Scale className="h-4 w-4 text-blue-600" />
           <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">v1.7.0 | OAB-FGV Compliance</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Data da Intimação
              </CardTitle>
              <CardDescription className="text-slate-600">O prazo começa a contar no dia útil seguinte</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                locale={ptBR}
                className="rounded-md border shadow-sm mx-auto bg-white"
              />
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Tipo de Peça
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="piece-type" className="font-bold text-slate-700">Selecione a Peça Prática</Label>
                <Select value={pieceDays} onValueChange={setPieceDays}>
                  <SelectTrigger id="piece-type" className="h-12 border-2 focus:ring-blue-500 bg-white">
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PIECE_TYPES.map((piece) => (
                      <SelectItem key={`${piece.label}-${piece.value}`} value={piece.value}>
                        <div className="flex flex-col py-1">
                          <span className="font-bold text-slate-900">{piece.label}</span>
                          <span className="text-[10px] uppercase font-black text-blue-600">{piece.area}</span>
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
          <Card className="border-2 border-blue-600 bg-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Clock className="h-32 w-32 rotate-12" />
            </div>
            
            <div className="bg-blue-600 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" /> Resultado da Contagem
              </h3>
            </div>
            
            <CardContent className="p-12 text-center space-y-8 relative z-10">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Data Final para Protocolo</p>
                <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter">
                  {resultDate ? format(resultDate, "dd/MM/yyyy") : "--/--/----"}
                </h2>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="h-px w-8 bg-blue-200" />
                  <p className="text-xl font-black text-blue-600 uppercase tracking-tight">
                    {resultDate ? format(resultDate, "EEEE", { locale: ptBR }) : ""}
                  </p>
                  <div className="h-px w-8 bg-blue-200" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Início (Intimação)</p>
                   <p className="text-xl font-black text-slate-700">{startDate ? format(startDate, "dd/MM/yyyy") : "--"}</p>
                   <p className="text-[10px] text-slate-500 font-bold">{startDate ? format(startDate, "EEEE", { locale: ptBR }) : ""}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prazo Processual</p>
                   <p className="text-xl font-black text-slate-700">{pieceDays} dias úteis</p>
                   <p className="text-[10px] text-slate-500 font-bold">Art. 219 CPC/2015</p>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl flex items-start gap-4 text-left">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-amber-900 uppercase">Cláusula de Barreira:</p>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Esta calculadora automatiza a contagem considerando o <strong className="font-bold">Recesso Forense (20/12 a 20/01)</strong> e feriados nacionais de 2026. 
                    Sempre confirme suspensões locais por feriados municipais ou instabilidade de sistemas nos sites dos Tribunais (TJ/TRF/TRT).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-4 bg-slate-50 border-b">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Fundamentação Legal & Regras de Contagem</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-600">
                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                    <Scale className="h-4 w-4" />
                    <span>CPC, Art. 219</span>
                  </div>
                  <p className="italic leading-relaxed">"Na contagem de prazo em dias, estabelecido por lei ou pelo juiz, computar-se-ão somente os <strong className="text-slate-900">dias úteis</strong>."</p>
                </div>
                <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-1">
                    <Scale className="h-4 w-4" />
                    <span>CPC, Art. 224</span>
                  </div>
                  <p className="italic leading-relaxed">"Salvo disposição em contrário, os prazos serão contados <strong className="text-slate-900">excluindo o dia do começo</strong> e incluindo o dia do vencimento."</p>
                </div>
              </div>
              <div className="mt-6 p-4 border-t text-[10px] text-slate-400 font-medium flex justify-between items-center">
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
