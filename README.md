# mundo-senai

Jogo de detetive (single player) com tema de investigacao policial.
Feito para o evento **Mundo SENAI**, para engajar estudantes de todos os cursos.

## Sobre o jogo

Voce e um detetive chamado a uma delegacia às escuras. Os arquivos queimam, a verdade some e cabe a voce coletar pistas, interrogar suspeitos e acusar o culpado.

Cada acao exige uma pericia (rolagem de dado d20). Algumas escolhas abrem um mini-desafio de observacao (senha de cofre, documento rasgado, horario de cameras) — nada de programacao, qualquer pessoa pode jogar. Falhas nao bloqueiam o progresso, apenas tornam a investigacao mais dificil.

Ao final, o jogo calcula sua pontuacao e rank (A, B ou C) com base nas pistas coletadas e na acusacao feita. O resultado e enviado para o painel do evento (`/admin`), onde a organizacao pode acompanhar estatísticas e exportar um CSV.

## Como rodar

```bash
# instale as dependências
npm install

# inicie o servidor
npm start

# ou em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no navegador.

## Como jogar

1. **Registro** — digite seu nome de detetive.
2. **Investigacao** — explore as cenas com a lanterna seguindo o mouse.
3. **Escolhas** — clique em uma opcao. Se houver um dado (d20), voce rola e compara com o numero da dificuldade (DC).
4. **Mini-desafios** — algumas opcoes abrem um desafio de observacao simples (sem codigo). Acertar garante sucesso; cancelar volta para o dado.
5. **Acusacao** — no final, escolha quem voce acha que e o culpado com base nas pistas.
6. **Resultado** — veja o desfecho (Caso Resolvido / Verdade Parcial / Erro de Julgamento / Caso Inconclusivo) com seu rank.
7. **Painel do evento** — clique em "Ver Painel do Evento" para ver estatísticas gerais.

## Estrutura

```
mundo-senai/
├── server.js            # Servidor e rotas da API
├── package.json         # Dependencias e scripts
├── README.md            # Este arquivo
├── public/              # Frontend
│   ├── index.html       # Tela de registro
│   ├── game.html        # Tela do jogo
│   ├── admin.html       # Painel do evento
│   ├── css/style.css    # Estilos
│   ├── js/
│   │   ├── name.js      # Registro do jogador
│   │   ├── game.js      # Motor do jogo, dado, desafios, resultado
│   │   ├── puzzles.js   # Mini-desafios de observacao
│   │   └── audio.js     # Sons de ambiente
│   ├── data/scenes.json # Cenas, escolhas e personagens
│   └── images/characters/  # Retratos dos suspeitos
└── data/                # Dados gerados durante o evento (ignorados pelo Git)
```

## API do servidor

| Rota | Descricao |
|------|-----------|
| `POST /api/register` | Registra o nome do jogador |
| `POST /api/game-over` | Envia resultado da partida |
| `GET /api/players` | Lista jogadores |
| `GET /api/stats` | Estatísticas para o painel admin |
| `GET /api/export/csv` | Download dos resultados em CSV |
| `GET /admin` | Painel visual do evento |

## Scripts

- `npm start` — inicia o servidor na porta 3000
- `npm run dev` — mesmo que start

## Licença

MIT — veja o arquivo `LICENSE`.
