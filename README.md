# Mini LECOM

MVP client-side inspirado na plataforma **LECOM** (Workspace, Studio, Admin, Análises).

**Repo:** https://github.com/vidaaal/mini-lecom

## Como usar

1. Clone ou baixe o ZIP completo do projeto
2. `python -m http.server 8080` na pasta
3. Abra http://localhost:8080/workspace.html
4. Menu de módulos (topo) → **Studio** para criar processos
5. **Workspace** → Abrir para iniciar instâncias

## Módulos

| Página | Função |
|--------|--------|
| `workspace.html` | Minhas atividades, Caixa de entrada, Abrir |
| `studio.html` | Processos + Diagrama + Campos por atividade |
| `admin.html` | Pessoas e grupos |
| `analises.html` | KPIs e auditoria |
| `index.html` | Controle pessoal de atividades |

## Studio

- **Diagrama**: cada atividade é um quadrado (Formulário / Aprovação / Script JS / Fim)
- **Atividades**: responsável, ações, script JS
- **Campos**: matriz Oculto / Normal / Somente leitura por atividade (estilo LECOM)

## Dados

`localStorage` (`mini_lecom_v3`). Sem backend. Troque o usuário no topo para simular o fluxo.

Projeto de estudo / protótipo — não é o produto LECOM oficial.

Veja [FONTES.md](FONTES.md) se faltar algum JS no clone.
