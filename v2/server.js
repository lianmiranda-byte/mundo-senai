const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const DATA_DIR = path.join(__dirname, 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

// garante pasta/arquivos de dados
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PLAYERS_FILE)) fs.writeFileSync(PLAYERS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(GAMES_FILE)) fs.writeFileSync(GAMES_FILE, JSON.stringify([], null, 2));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// rota direta para admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// registra nome do jogador
app.post('/api/register', (req, res) => {
  const name = (req.body && req.body.name ? String(req.body.name) : '').trim();
  if (!name || name.length < 2) {
    return res.status(400).json({ ok: false, error: 'Nome invalido' });
  }
  let players = [];
  try { players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8')); } catch (e) { players = []; }
  const record = { id: Date.now(), name, date: new Date().toISOString() };
  players.push(record);
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2));
  fs.appendFileSync(path.join(DATA_DIR, 'players.txt'), `${new Date().toISOString()} - ${name}\n`);
  res.json({ ok: true, name });
});

// registra fim do jogo
app.post('/api/game-over', (req, res) => {
  const { name, accused, resultTitle, observationsCount, notesCount, score, rank } = req.body || {};
  let games = [];
  try { games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8')); } catch (e) { games = []; }

  const record = {
    id: Date.now(),
    name: name || 'Anonimo',
    accused: accused || 'Nenhum',
    resultTitle: resultTitle || 'Desconhecido',
    observationsCount: Number(observationsCount) || 0,
    notesCount: Number(notesCount) || 0,
    score: Number(score) || 0,
    rank: rank || 'C',
    date: new Date().toISOString()
  };

  games.push(record);
  fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));

  // Grava em CSV
  const csvLine = `"${record.date}","${record.name.replace(/"/g, '""')}","${record.accused}","${record.resultTitle}","${record.observationsCount}","${record.notesCount}","${record.score}","${record.rank}"\n`;
  const csvFile = path.join(DATA_DIR, 'games.csv');
  if (!fs.existsSync(csvFile)) {
    fs.writeFileSync(csvFile, 'Data,Nome,Acusado,Resultado,Observacoes,Anotacoes,Pontos,Rank\n');
  }
  fs.appendFileSync(csvFile, csvLine);

  res.json({ ok: true });
});

// lista jogadores (uso interno/admin)
app.get('/api/players', (req, res) => {
  let players = [];
  try { players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8')); } catch (e) { players = []; }
  res.json(players);
});

// estatisticas completas para o painel admin
app.get('/api/stats', (req, res) => {
  let players = [];
  let games = [];
  try { players = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8')); } catch (e) { players = []; }
  try { games = JSON.parse(fs.readFileSync(GAMES_FILE, 'utf8')); } catch (e) { games = []; }

  const totalPlayers = players.length;
  const totalGames = games.length;
  const solvedCount = games.filter(g => g.resultTitle === 'CASO RESOLVIDO').length;
  const partialCount = games.filter(g => g.resultTitle === 'VERDADE PARCIAL').length;
  const errorCount = games.filter(g => g.resultTitle === 'ERRO DE JULGAMENTO').length;
  const inconclusiveCount = games.filter(g => g.resultTitle === 'CASO INCONCLUSIVO').length;

  res.json({
    totalPlayers,
    totalGames,
    solvedCount,
    partialCount,
    errorCount,
    inconclusiveCount,
    recentGames: games.slice(-20).reverse(),
    recentPlayers: players.slice(-20).reverse()
  });
});

// download CSV
app.get('/api/export/csv', (req, res) => {
  const csvFile = path.join(DATA_DIR, 'games.csv');
  if (fs.existsSync(csvFile)) {
    res.download(csvFile, 'mundo-senai-rpg-v2-resultados.csv');
  } else {
    res.status(404).send('Nenhum dado registrado ainda.');
  }
});

app.listen(PORT, () => {
  console.log(`Mundo SENAI RPG v2 rodando em http://localhost:${PORT}`);
});
