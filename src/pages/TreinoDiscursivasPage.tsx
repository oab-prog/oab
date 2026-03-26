import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Send } from "lucide-react";

const TreinoDiscursivasPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">✍️ Treino de Discursivas</h1>
        <p className="text-muted-foreground">
          Simule as 4 questões dissertativas da 2ª Fase e receba feedback instantâneo.
        </p>
      </div>

      <div className="grid gap-6">
        {[1, 2, 3, 4].map((num) => (
          <Card key={num} className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <PenTool className="h-5 w-5 text-primary" />
                Questão {num}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-muted p-4 rounded-md text-sm italic">
                [O enunciado da questão {num} aparecerá aqui...]
              </div>
              <Textarea 
                placeholder="Digite sua resposta aqui conforme o espelho da FGV..." 
                className="min-h-[200px] font-serif text-base"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button size="lg" className="gap-2 px-8 py-6 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
          <Send className="h-5 w-5" />
          Enviar para Correção (IA)
        </Button>
      </div>
    </div>
  );
};

export default TreinoDiscursivasPage;
