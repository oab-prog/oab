import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bone, CheckCircle2, Save } from "lucide-react";

const ConstrutorEsqueletosPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8 animate-in zoom-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Bone className="h-8 w-8 text-primary" />
          Construtor de Esqueletos
        </h1>
        <p className="text-muted-foreground">
          Crie a estrutura lógica da sua peça processual em minutos (Peça, Juízo, Preliminares, Pedidos).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Estrutura da Peça</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="peca">Nome da Peça</Label>
              <Input id="peca" placeholder="Ex: Apelação Criminal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="juizo">Endereçamento / Juízo</Label>
              <Input id="juizo" placeholder="Ex: Excelentíssimo Senhor Doutor Juiz de Direito..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preliminares">Preliminares e Teses</Label>
              <Textarea id="preliminares" placeholder="Liste os principais pontos aqui..." className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pedidos">Pedidos Finais</Label>
              <Textarea id="pedidos" placeholder="Liste os pedidos..." className="min-h-[120px]" />
            </div>
            <Button className="w-full gap-2 font-bold uppercase tracking-wider py-6">
              <Save className="h-5 w-5" />
              Gerar Esqueleto Estruturado
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-dashed border-primary/30 h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary/30 mb-4" />
            <p className="text-muted-foreground italic max-w-sm">
              Preencha os campos ao lado para visualizar a estrutura lógica da sua peça processual aqui.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConstrutorEsqueletosPage;
