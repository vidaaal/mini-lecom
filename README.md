# Mini LECOM (Node.js)

MVP inspirado na plataforma **LECOM** + **Controle pessoal de atividades**.

Stack: **Node.js nativo** (`http` / `fs` / `path`). **Sem Python. Sem `npm install`.**

## Execução

```bash
node server.js
# ou: npm start
```

| URL | App |
|-----|-----|
| http://localhost:3000/workspace.html | **Mini LECOM** (oficial) — processos, caixa de entrada |
| http://localhost:3000/studio.html | Studio — diagrama, atividades, campos |
| http://localhost:3000/admin.html | Pessoas e grupos |
| http://localhost:3000/analises.html | Indicadores |
| http://localhost:3000/index.html | Controle pessoal de atividades (Kanban, calendário) |

Porta: `PORT=3456 node server.js`

## Segurança (demo)

Por padrão a API fica **aberta** (uso local).

```bash
API_KEY=minha-chave-secreta node server.js
```

Envie header `X-API-Key` nas chamadas. **Não exponha na internet sem autenticação real.**

## Persistência

- `data/db.json` (gravação atômica + `.bak`)
- `localStorage` como fallback

## Documentação

- `docs/DEVOLUTIVA_ANALISE.md`
- `docs/IDEIAS_FUNCOES_SERVICOS_AUTOMACAO_INOVACAO.md`

Protótipo de estudo — não é o produto LECOM oficial.
