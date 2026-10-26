# mundo-senai RPG v2

Jogo de detetive (single player) com foco em **investigacao organica**.
Feito para o evento **Mundo SENAI**, para engajar estudantes de todos os cursos.

## Filosofia desta versao

Na primeira versao, o jogo entregava a resposta pronta quando o jogador examinava algo ("voce encontrou a prova de que X é culpado"). Isso virava um exercício de clicar em tudo, em vez de investigar.

Na **v2**, nada é entregue de mão beijada:

- **Pistas são observações ambíguas** — o jogo mostra o que o personagem percebe (cheiro de fumaça, um bilhete sem assinatura, marcas de luvas), não quem é o culpado.
- **O jogador interpreta** — cabe a você conectar as observações no caderno de campo e formar sua própria teoria.
- **Anotações livres** — você pode escrever suspeitas e conexões no caderno.
- **Acusação livre** — no final, você digita o nome de quem acredita que é o culpado. Não há múltipla escolha.
- **Zero código necessário** — nenhum SQL, nenhum log de servidor, nenhum conhecimento de programação.

A estética noir (film grain, lanterna, luz piscando, personagens) é herdada da versão anterior.

## Como rodar

```bash
# instale as dependências
npm install

# inicie o servidor (porta 3001)
npm start
```

Acesse `http://localhost:3001` no navegador.

## Estrutura

```
v2/
├── server.js            # Servidor Express e API
├── package.json         # Dependencias
├── README.md            # Este arquivo
├── public/
│   ├── index.html       # Tela de registro
│   ├── game.html        # Tela do jogo + caderno de campo + acusacao
│   ├── admin.html       # Painel do evento
│   ├── css/style.css    # Estilo noir herdado
│   ├── js/
│   │   ├── name.js      # Registro
│   │   ├── game.js      # Motor do jogo, caderno, acusacao, envio ao servidor
│   │   └── audio.js     # Sons processuais
│   ├── data/scenes.json # Cenas, observacoes ambíguas e personagens
│   └── images/characters/  # Retratos dos suspeitos
└── data/                # Dados gerados durante o evento
```

## API do servidor

| Rota | Descricao |
|------|-----------|
| `POST /api/register` | Registra o nome do jogador |
| `POST /api/game-over` | Envia resultado da partida (acusacao livre, observacoes, anotacoes, rank) |
| `GET /api/players` | Lista jogadores |
| `GET /api/stats` | Estatísticas para o painel admin |
| `GET /api/export/csv` | Download dos resultados em CSV |
| `GET /admin` | Painel visual do evento |

## Scripts

- `npm start` — inicia o servidor na porta 3001
- `npm run dev` — mesmo que start

## Licença

MIT — veja o arquivo `LICENSE`.
