import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, CalendarDays, AlertTriangle } from "lucide-react";

const CalculadoraPrazosPage = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          Calculadora de Prazos
        </h1>
        <p className="text-muted-foreground">
          Calcule prazos processuais em dias úteis com suporte a feriados e suspensões.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data de Início (Intimação)</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-sm mx-auto"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Prazo (Dias)</Label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Dias</SelectItem>
                    <SelectItem value="8">8 Dias</SelectItem>
                    <SelectItem value="10">10 Dias</SelectItem>
                    <SelectItem value="15">15 Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary shadow-xl h-full flex flex-col justify-center items-center p-12 text-center">
            <CalendarDays className="h-16 w-16 text-primary mb-6" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Prazo Final</h3>
              <p className="text-4xl font-extrabold text-primary">-- / -- / ----</p>
              <p className="text-sm text-muted-foreground pt-4">
                O cálculo levará em conta o CPC/2015 ou legislação correspondente (dias úteis).
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-amber-500/10 rounded-lg flex items-center gap-3 text-amber-600 text-xs font-semibold uppercase">
              <AlertTriangle className="h-4 w-4" />
              Lembre-se de verificar suspensões locais do tribunal
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraPrazosPage;
