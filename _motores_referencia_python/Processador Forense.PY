import os
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

# ==========================================\n# CONFIGURAÇÃO DO TESSERACT OCR (WINDOWS)
# ==========================================\npytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def processar_pdf_pesado(caminho_pdf, callback_progresso, callback_sucesso, callback_erro):
    try:
        doc = fitz.open(caminho_pdf)
        total_paginas = len(doc)
        LIMITE_PAGINAS_VOLUME = 400 
        
        volumes_extraidos = []
        texto_volume_atual = ""
        
        callback_progresso(0, total_paginas, "Iniciando mapeamento dos autos (Alta Resolução: 300 DPI)...")

        for i in range(total_paginas):
            pagina = doc[i]
            numero_fls = i + 1
            
            texto_extraido = pagina.get_text("text").strip()
            
            if len(texto_extraido) < 50:
                # CORREÇÃO Nº 5 APLICADA: Aumento de DPI para 300 (Padrão Ouro Forense)
                pix = pagina.get_pixmap(dpi=300) 
                img = Image.open(io.BytesIO(pix.tobytes()))
                texto_extraido = pytesseract.image_to_string(img, lang='por')

            texto_volume_atual += f"\n\n[--- INÍCIO DA FLS. {numero_fls} ---]\n"
            texto_volume_atual += texto_extraido
            texto_volume_atual += f"\n[--- FIM DA FLS. {numero_fls} ---]\n"

            callback_progresso(numero_fls, total_paginas, f"Lendo Fls. {numero_fls} de {total_paginas} (300 DPI)...")

            if numero_fls % LIMITE_PAGINAS_VOLUME == 0 or numero_fls == total_paginas:
                volumes_extraidos.append(texto_volume_atual)
                texto_volume_atual = ""

        doc.close()
        
        dir_base = os.path.dirname(caminho_pdf)
        nome_base = os.path.splitext(os.path.basename(caminho_pdf))[0]
        pasta_destino = os.path.join(dir_base, f"VOLUMES_TXT_{nome_base}")
        os.makedirs(pasta_destino, exist_ok=True)

        caminhos_salvos = []
        for idx, texto_vol in enumerate(volumes_extraidos):
            caminho_txt = os.path.join(pasta_destino, f"Volume_{idx+1}_Fls_Iniciais_ate_Final.txt")
            with open(caminho_txt, "w", encoding="utf-8") as f:
                f.write(texto_vol)
            caminhos_salvos.append(caminho_txt)

        callback_sucesso(len(caminhos_salvos), pasta_destino)

    except Exception as e:
        callback_erro(str(e))

# --- Interface Gráfica ---
janela = tk.Tk()
janela.title("M.A | Processador Forense (Alta Resolução)")
janela.geometry("600x400")
janela.configure(bg="#020617")

style = ttk.Style()
style.theme_use('clam')

def iniciar_extracao():
    caminho_pdf = filedialog.askopenfilename(filetypes=[("PDF Files", "*.pdf")])
    if not caminho_pdf: return

    btn_iniciar.config(state=tk.DISABLED, text="⚙️ EXTRAINDO COM OCR 300 DPI...", bg="#475569")
    progress_bar.pack(fill=tk.X, pady=20)
    
    def atualizar_progresso(atual, total, mensagem):
        def _ui_update():
            lbl_status.config(text=mensagem)
            progress_bar['maximum'] = total
            progress_bar['value'] = atual
        janela.after(0, _ui_update)

    def sucesso(qtd_volumes, pasta):
        def _ui_sucesso():
            progress_bar.pack_forget()
            btn_iniciar.config(state=tk.NORMAL, text="⚙️ ANEXAR NOVO PDF", bg="#0f766e")
            lbl_status.config(text=f"Sucesso! {qtd_volumes} volumes criados em:\n{pasta}", fg="#10b981")
            messagebox.showinfo("Concluído", f"Processo fatiado em {qtd_volumes} volumes txt.\nPronto para o Diretor Estratégico.")
        janela.after(0, _ui_sucesso)

    def erro(msg):
        def _ui_erro():
            progress_bar.pack_forget()
            btn_iniciar.config(state=tk.NORMAL, text="⚙️ TENTAR NOVAMENTE", bg="#0f766e")
            lbl_status.config(text="Status: Erro na extração.", fg="#ef4444")
            messagebox.showerror("Erro Grave", msg)
        janela.after(0, _ui_erro)

    threading.Thread(target=processar_pdf_pesado, args=(caminho_pdf, atualizar_progresso, sucesso, erro), daemon=True).start()

header = tk.Frame(janela, bg="#0f172a", pady=20)
header.pack(fill=tk.X)
tk.Label(header, text="M.A | PROCESSADOR FORENSE", font=("Segoe UI", 16, "bold"), bg="#0f172a", fg="#0ea5e9").pack()
tk.Label(header, text="Motor de extração OCR 300 DPI anti-estouro.", bg="#0f172a", fg="#94a3b8").pack()

main_area = tk.Frame(janela, bg="#020617", pady=30, padx=40)
main_area.pack(fill=tk.BOTH, expand=True)

btn_iniciar = tk.Button(main_area, text="⚙️ ANEXAR PDF E INICIAR EXTRAÇÃO", command=iniciar_extracao, bg="#0f766e", fg="white", font=("Segoe UI", 12, "bold"), pady=15, cursor="hand2")
btn_iniciar.pack(fill=tk.X)

lbl_status = tk.Label(main_area, text="Status: Aguardando PDF...", bg="#020617", fg="#cbd5e1", font=("Segoe UI", 10))
lbl_status.pack(pady=20)

progress_bar = ttk.Progressbar(main_area, mode='determinate', length=400)

janela.mainloop()