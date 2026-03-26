import { jsPDF } from "jspdf";
import type { Questao } from "@/data/questoes";

export function exportarQuestoesPDF(
  questoes: Questao[],
  titulo: string,
  filename: string
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const maxW = pageW - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 275) { doc.addPage(); y = 20; }
  };

  const addText = (text: string, size: number, bold = false, color?: [number, number, number]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    if (color) doc.setTextColor(...color);
    else doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, maxW);
    const lineH = size * 0.45;
    checkPage(lines.length * lineH);
    doc.text(lines, margin, y);
    y += lines.length * lineH + 2;
  };

  addText(titulo, 16, true);
  addText(`Data: ${new Date().toLocaleDateString("pt-BR")}  |  Total: ${questoes.length} questoes`, 10);
  y += 4;

  questoes.forEach((q, i) => {
    checkPage(30);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    addText(`[${q.tema}]`, 9, true, [180, 130, 20]);
    addText(`${i + 1}. ${q.pergunta}`, 10);

    q.opcoes.forEach(op => {
      const isCorrect = op.slice(0, 2) === q.correta.slice(0, 2);
      addText(`   ${op}`, 9, isCorrect, isCorrect ? [0, 130, 70] : undefined);
    });

    addText(`Resposta: ${q.correta}`, 9, true, [0, 130, 70]);
    y += 2;
  });

  doc.save(filename);
}

export function exportarPecaPDF(
  conteudo: string,
  materia: string,
  aluno: string,
  filename: string
) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxW = pageW - margin * 2;
  let y = 20;

  // Header
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(180, 130, 20);
  doc.text("THEMIS M.A.", pageW / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("times", "normal");
  doc.text(`JurisVision 2ª Fase | Inteligência Artificial Jurídica`, pageW / 2, y, { align: "center" });
  y += 10;

  doc.setDrawColor(180, 130, 20);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Info
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.setFont("times", "bold");
  doc.text(`ALUNO: ${aluno.toUpperCase()}`, margin, y);
  y += 7;
  doc.text(`MATÉRIA: ${materia.toUpperCase()}`, margin, y);
  y += 7;
  doc.text(`DATA: ${new Date().toLocaleDateString("pt-BR")}`, margin, y);
  y += 12;

  // Content
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  const lines = doc.splitTextToSize(conteudo, maxW);
  
  lines.forEach((line: string) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 7;
  });

  doc.save(filename);
}
