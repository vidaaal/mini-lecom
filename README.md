# Mini LECOM

MVP client-side inspirado na plataforma **LECOM** (Workspace, Studio, Admin, Análises).

## Como usar

1. Clone o repositório
2. Abra `workspace.html` ou `index.html` no navegador (ou: `python -m http.server 8080`)
3. Menu de módulos (topo) → **Studio** para criar processos
4. **Workspace** → Abrir para iniciar instâncias

## Módulos

| Página | Função |
|--------|--------|
| `workspace.html` | Minhas atividades, Caixa de entrada, Abrir processo |
| `studio.html` | Lista de processos + assistente (Propriedades → Diagrama → Atividades → Campos → Publicar) |
| `admin.html` | Pessoas e grupos |
| `analises.html` | KPIs e auditoria |
| `index.html` | Controle pessoal de atividades |
| `bpmn.html` | Modelador BPMN (bpmn-js) |

## Studio

- **Diagrama**: cada atividade é um quadrado (Formulário / Aprovação / Script JS / Fim)
- **Atividades**: responsável, ações, script JavaScript por etapa
- **Campos**: ID técnico + matriz Oculto / Normal / Somente leitura por atividade

## Dados

`localStorage` (`mini_lecom_v3`). Sem backend. Troque o usuário no topo para simular o fluxo.

Projeto de estudo / protótipo — não é o produto LECOM oficial.
