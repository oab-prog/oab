import os
import json
import time
import datetime
import threading
import tkinter as tk
import re
from tkinter import filedialog, messagebox, scrolledtext, ttk
import docx
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from google import genai
from google.genai import types
from typing import Dict, List, Any, Optional

API_KEY_LOCAL = os.getenv("GEMINI_API_KEY") 

# ==========================================
# O ESCUDO DE CÓDIGO (REGEX) - ADMINISTRATIVO
# ==========================================
def aplicar_escudo_no_json(dados: Any) -> Any:
    padrao_jurisprudencia = r'(?i)\b(?:REsp|RE|RMS|AgRg|AREsp|Apelação|Agravo|Processo n[º°]?\s*)\s*[\d\.\-\/]+\/[A-Z]{2}\b'
    if isinstance(dados, dict):
        return {k: aplicar_escudo_no_json(v) for k, v in dados.items()}
    elif isinstance(dados, list):
        return [aplicar_escudo_no_json(i) for i in dados]
    elif isinstance(dados, str):
        return re.sub(padrao_jurisprudencia, "[AVISO: NUMERACAO OMITIDA]", dados)
    else:
        return dados

def analisar_lote_ia(caminhos_txt: List[str], fatos: str, callback_progresso: Any, callback_sucesso: Any, callback_erro: Any):
    try:
        client = genai.Client(api_key=API_KEY_LOCAL.strip())
        filtros_seguranca = [types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE")]

        resumos_volumes = []
        total_vols = len(caminhos_txt)

        for idx, caminho in enumerate(caminhos_txt):
            vol_num = idx + 1
            callback_progresso(vol_num, total_vols, f"Fase 1: Auditando Atos Administrativos no Volume {vol_num} de {total_vols}...")
            gemini_file = client.files.upload(file=caminho, config={'mime_type': 'text/plain'})
            while True:
                f_info = client.files.get(name=gemini_file.name)
                if "ACTIVE" in str(f_info.state).upper(): break
                time.sleep(2)
            
            conteudo_txt = types.Part.from_uri(file_uri=f_info.uri, mime_type='text/plain')
            prompt_detetive = f"DIRECIONAMENTO DA ESTRATÉGIA:\n{fatos}\n\nAnalise este volume Administrativo. Foque em: licitações, processos disciplinares, atos de improbidade e responsabilidade civil do Estado. OBRIGATÓRIO fls. RIGOR: Apelação (7x), Mandado de Segurança (5x), Contestação (3x). NÃO INVENTE."
            config_detetive = types.GenerateContentConfig(temperature=0.0)
            response_detetive = client.models.generate_content(model='gemini-2.0-flash', contents=[conteudo_txt, prompt_detetive], config=config_detetive)
            resumos_volumes.append(f"--- ACHADOS ADMINISTRATIVOS DO VOLUME {vol_num} ---\n{response_detetive.text.strip()}\n")
            client.files.delete(name=gemini_file.name)

        texto_consolidado = "\n".join(resumos_volumes)
        instrucao_sistema_mestre = """
        Você é o M.A | JUS IA EXPERIENCE, Especialista em Direito Administrativo.
        >>> TRAVA ANTI-ALUCINAÇÃO <<<
        1. VALIDAR APENAS legislação administrativa (Leis 8.112, 8.429, 9.784, 14.133, etc).
        2. RIGOR OAB: Apelação (Rigor 7), Mandado de Segurança (Rigor 5), Contestação (Rigor 3).
        3. OBRIGATÓRIO citar fls.
        """
        prompt_mestre = f"DIRECIONAMENTO:\n{fatos}\n\n--- DADOS ---\n{texto_consolidado}\n\nGere o JSON."
        config_mestre = types.GenerateContentConfig(system_instruction=instrucao_sistema_mestre, temperature=0.0, response_mime_type="application/json")
        response_final = client.models.generate_content(model='gemini-2.0-flash', contents=[prompt_mestre], config=config_mestre)
        callback_sucesso(aplicar_escudo_no_json(json.loads(response_final.text.strip())))
    except Exception as e: callback_erro(str(e))

janela = tk.Tk()
janela.title("M.A | Auditor Administrativo")
janela.geometry("1100x750")
janela.configure(bg="#020617")
style = ttk.Style(); style.theme_use('clam')
style.configure("TNotebook", background="#020617")
# Verde Administrativo
style.map("TNotebook.Tab", background=[("selected", "#15803d")], foreground=[("selected", "white")])

def executar_analise():
    fatos = txt_fatos.get(1.0, tk.END).strip()
    caminhos_txt = filedialog.askopenfilenames(filetypes=[("Arquivos de Texto", "*.txt")])
    if not caminhos_txt: return
    threading.Thread(target=analisar_lote_ia, args=(sorted(list(caminhos_txt)), fatos, lambda a,t,m: None, lambda d: None, lambda e: None), daemon=True).start()

sidebar = tk.Frame(janela, bg="#0f172a", width=300); sidebar.pack(side=tk.LEFT, fill=tk.Y); sidebar.pack_propagate(False)
tk.Label(sidebar, text="M.A | ADMINISTRATIVO", font=("Segoe UI", 18, "bold"), bg="#0f172a", fg="#15803d", pady=30).pack()
main_area = tk.Frame(janela, bg="#020617"); main_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
notebook = ttk.Notebook(main_area); notebook.pack(fill=tk.BOTH, expand=True)
tab_fatos = tk.Frame(notebook, bg="#1e293b"); notebook.add(tab_fatos, text=" 1. DIRECIONAMENTO ")
txt_fatos = scrolledtext.ScrolledText(tab_fatos, bg="#1e293b", fg="white"); txt_fatos.pack(fill=tk.BOTH, expand=True)
btn_executar = tk.Button(main_area, text="🚀 AUDITAR ADMINISTRATIVO", command=executar_analise, bg="#15803d", fg="white", font=("Segoe UI", 11, "bold"), pady=12)
btn_executar.pack(fill=tk.X)
janela.mainloop()