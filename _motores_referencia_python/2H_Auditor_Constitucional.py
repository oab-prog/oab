import os
import json
import time
import threading
import tkinter as tk
import re
from tkinter import filedialog, messagebox, scrolledtext, ttk
from google import genai
from google.genai import types

API_KEY_LOCAL = os.getenv("GEMINI_API_KEY") 

def aplicar_escudo_no_json(dados):
    padrao = r'(?i)\b(?:RE|ADI|MS|AP|HC|REsp|AgRg|AREsp|Apelação|Agravo|Processo n[º°]?\s*)\s*[\d\.\-\/]+\/[A-Z]{2}\b'
    if isinstance(dados, dict): return {k: aplicar_escudo_no_json(v) for k, v in dados.items()}
    elif isinstance(dados, list): return [aplicar_escudo_no_json(i) for i in dados]
    elif isinstance(dados, str): return re.sub(padrao, "[AVISO: NUMERACAO OMITIDA - BUSQUE NO STF]", dados)
    else: return dados

def analisar_lote_ia(caminhos_txt, fatos, callback_progresso, callback_sucesso, callback_erro):
    try:
        client = genai.Client(api_key=API_KEY_LOCAL.strip())
        resumos_volumes = []
        for idx, caminho in enumerate(caminhos_txt):
            gemini_file = client.files.upload(file=caminho, config={'mime_type': 'text/plain'})
            while True:
                f_info = client.files.get(name=gemini_file.name)
                if "ACTIVE" in str(f_info.state).upper(): break
                time.sleep(2)
            prompt = f"DIRECIONAMENTO: {fatos}\n\nAnalise este volume Constitucional. Foque em: Mandado de Segurança (7x), ADI (7x), Ação Popular (5x). OBRIGATÓRIO citar fls. TRAVA LEGISLATIVA: CF/88. NÃO INVENTE DADOS."
            response = client.models.generate_content(model='gemini-2.0-flash', contents=[types.Part.from_uri(file_uri=f_info.uri, mime_type='text/plain'), prompt], config=types.GenerateContentConfig(temperature=0.0))
            resumos_volumes.append(f"--- ACHADOS CONSTITUCIONAIS VOLUME {idx+1} ---\n{response.text.strip()}")
            client.files.delete(name=gemini_file.name)
        
        instrucao = """
        Você é o M.A | JUS IA EXPERIENCE, Auditor Forense Especialista em Direito Constitucional.
        >>> TRAVA ANTI-ALUCINAÇÃO <<<
        1. VALIDAR APENAS a Constituição Federal de 1988.
        2. RIGOR OAB: Mandado de Segurança (Rigor 7), ADI (Rigor 7), Ação Popular (Rigor 5).
        3. OBRIGATÓRIO fls.
        """
        prompt_m = f"DIRECIONAMENTO: {fatos}\n\n--- DADOS ---\n" + "\n".join(resumos_volumes) + "\n\nGere o JSON."
        resp_f = client.models.generate_content(model='gemini-2.0-flash', contents=[prompt_m], config=types.GenerateContentConfig(system_instruction=instrucao, temperature=0.0, response_mime_type="application/json"))
        callback_sucesso(aplicar_escudo_no_json(json.loads(resp_f.text.strip())))
    except Exception as e: callback_erro(str(e))

janela = tk.Tk()
janela.title("M.A | Auditor Constitucional")
janela.geometry("1100x750"); janela.configure(bg="#020617")
style = ttk.Style(); style.theme_use('clam')
# Azul Royal Constitucional
style.map("TNotebook.Tab", background=[("selected", "#1e40af")], foreground=[("selected", "white")])

sidebar = tk.Frame(janela, bg="#0f172a", width=300); sidebar.pack(side=tk.LEFT, fill=tk.Y); sidebar.pack_propagate(False)
tk.Label(sidebar, text="M.A | CONSTITUCIONAL", font=("Segoe UI", 18, "bold"), bg="#0f172a", fg="#1e40af", pady=30).pack()
main_area = tk.Frame(janela, bg="#020617"); main_area.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
notebook = ttk.Notebook(main_area); notebook.pack(fill=tk.BOTH, expand=True)
tab_fatos = tk.Frame(notebook, bg="#1e293b"); notebook.add(tab_fatos, text=" 1. DIRECIONAMENTO ")
txt_fatos = scrolledtext.ScrolledText(tab_fatos, bg="#1e293b", fg="white"); txt_fatos.pack(fill=tk.BOTH, expand=True)
btn_executar = tk.Button(main_area, text="🚀 AUDITAR CONSTITUCIONAL", bg="#1e40af", fg="white", font=("Segoe UI", 11, "bold"), pady=12, command=lambda: threading.Thread(target=analisar_lote_ia, args=(sorted(list(filedialog.askopenfilenames())), txt_fatos.get(1.0, tk.END).strip(), None, None, None), daemon=True).start())
btn_executar.pack(fill=tk.X)
janela.mainloop()