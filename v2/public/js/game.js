(function () {
  const fl = document.querySelector('.flashlight');
  if (fl) window.addEventListener('mousemove', (e) => {
    fl.style.setProperty('--x', e.clientX + 'px');
    fl.style.setProperty('--y', e.clientY + 'px');
  });

  const playerLabel = document.getElementById('playerLabel');
  const sceneTitle = document.getElementById('sceneTitle');
  const sceneText = document.getElementById('sceneText');
  const rollResult = document.getElementById('rollResult');
  const choicesEl = document.getElementById('choices');
  const dice = document.getElementById('dice');
  const ending = document.getElementById('ending');
  const endingTitle = document.getElementById('endingTitle');
  const endingText = document.getElementById('endingText');
  const endingRank = document.getElementById('endingRank');
  const restartBtn = document.getElementById('restartBtn');
  const timerLabel = document.getElementById('timerLabel');
  const roomLight = document.getElementById('roomLight');
  const sceneFade = document.getElementById('sceneFade');
  const characterLayer = document.getElementById('characterLayer');

  // Caderno de campo
  const notebookBtn = document.getElementById('notebookBtn');
  const notebookModal = document.getElementById('notebookModal');
  const closeNotebookBtn = document.getElementById('closeNotebookBtn');
  const closeNotebookBtn2 = document.getElementById('closeNotebookBtn2');
  const observationsList = document.getElementById('observationsList');
  const playerNotes = document.getElementById('playerNotes');
  const notesCount = document.getElementById('notesCount');

  // Acusacao final
  const accuseModal = document.getElementById('accuseModal');
  const closeAccuseBtn = document.getElementById('closeAccuseBtn');
  const accuseName = document.getElementById('accuseName');
  const accuseHint = document.getElementById('accuseHint');
  const submitAccuseBtn = document.getElementById('submitAccuseBtn');

  const name = localStorage.getItem('playerName') || 'Detetive';
  if (playerLabel) playerLabel.textContent = 'Detetive ' + name;

  let data = null;
  let currentId = null;
  let observations = JSON.parse(localStorage.getItem('observations') || '[]');
  let notes = localStorage.getItem('notes') || '';
  let accused = null;

  let sceneTimer = null;
  let timeLeft = 35;

  function clearSceneTimer() {
    if (sceneTimer) { clearInterval(sceneTimer); sceneTimer = null; }
  }

  function startSceneTimer(choices) {
    clearSceneTimer();
    timeLeft = 35;
    if (timerLabel) timerLabel.textContent = 'TEMPO: ' + timeLeft + 'S';
    sceneTimer = setInterval(() => {
      timeLeft--;
      if (timerLabel) timerLabel.textContent = 'TEMPO: ' + timeLeft + 'S';
      if (timeLeft <= 0) {
        clearSceneTimer();
        let best = choices[0];
        for (const c of choices) {
          if (c.dc < best.dc) best = c;
        }
        rollResult.textContent = 'TEMPO ESGOTADO. ESCOLHA AUTOMATICA: ' + best.label;
        handleChoice(best, true);
      }
    }, 1000);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function playSound(fn) {
    try { if (fn) fn(); } catch (e) { }
  }

  async function typewriter(el, text) {
    el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      if (i % 6 === 0) {
        playSound(() => window.SoundEngine && window.SoundEngine.playTypewriter());
      }
      await sleep(12);
    }
  }

  function showDice(value, rolling) {
    dice.textContent = value;
    dice.classList.add('show');
    if (rolling) dice.classList.add('rolling');
    else dice.classList.remove('rolling');
  }
  function hideDice() {
    dice.classList.remove('show');
    dice.classList.remove('rolling');
  }

  async function roll(skill, dc) {
    playSound(() => window.SoundEngine && window.SoundEngine.playDiceRoll());
    showDice('?', true);
    await sleep(400);
    const r = Math.floor(Math.random() * 20) + 1;
    showDice(r, false);
    await sleep(500);
    const success = r >= dc;
    rollResult.textContent = `ROLAGEM (${skill}): ${r} VS DC ${dc} -> ${success ? 'SUCESSO' : 'FALHA'}`;
    await sleep(600);
    hideDice();
    if (success) {
      playSound(() => window.SoundEngine && window.SoundEngine.playSuccess());
    } else {
      playSound(() => window.SoundEngine && window.SoundEngine.playFailure());
    }
    return success;
  }

  function getScene(id) { return data && data.scenes ? data.scenes.find(s => s.id === id) : null; }

  async function fadeOut() {
    if (sceneFade) sceneFade.classList.add('show');
    await sleep(900);
  }
  async function fadeIn() {
    await sleep(400);
    if (sceneFade) sceneFade.classList.remove('show');
    await sleep(900);
  }

  // Caderno de campo
  function renderNotebook() {
    if (!observationsList || !playerNotes || !notesCount) return;
    observationsList.innerHTML = '';
    if (observations.length === 0) {
      observationsList.innerHTML = '<p style="color:var(--muted); font-style: italic;">Nenhuma observacao ainda...</p>';
    } else {
      observations.forEach((obs, idx) => {
        const div = document.createElement('div');
        div.style.padding = '0.6rem 0';
        div.style.borderBottom = '1px solid rgba(244,239,228,0.1)';
        div.style.fontSize = '0.9rem';
        div.style.lineHeight = '1.5';
        div.style.color = 'var(--fg)';
        div.innerHTML = `<strong>[${idx + 1}]</strong> ${obs}`;
        observationsList.appendChild(div);
      });
    }
    playerNotes.value = notes;
    notesCount.textContent = (notes || '').length + ' caracteres';
  }

  function addObservation(text) {
    if (!text) return;
    if (observations.includes(text)) return;
    observations.push(text);
    localStorage.setItem('observations', JSON.stringify(observations));
    renderNotebook();
  }

  function saveNotes() {
    if (playerNotes) {
      notes = playerNotes.value;
      localStorage.setItem('notes', notes);
      if (notesCount) notesCount.textContent = (notes || '').length + ' caracteres';
    }
  }

  // Modal caderno
  notebookBtn.addEventListener('click', () => {
    renderNotebook();
    notebookModal.classList.remove('hidden');
  });
  function closeNotebook() {
    notebookModal.classList.add('hidden');
  }
  closeNotebookBtn.addEventListener('click', closeNotebook);
  closeNotebookBtn2.addEventListener('click', closeNotebook);
  playerNotes.addEventListener('input', saveNotes);

  // Modal acusacao
  function openAccuseModal() {
    accuseName.value = '';
    accuseHint.textContent = '';
    accuseModal.classList.remove('hidden');
    accuseName.focus();
  }
  function closeAccuse() {
    accuseModal.classList.add('hidden');
  }
  closeAccuseBtn.addEventListener('click', closeAccuse);

  submitAccuseBtn.addEventListener('click', () => {
    const val = accuseName.value.trim();
    if (!val) {
      accuseHint.textContent = 'Digite um nome para acusar.';
      accuseHint.style.color = '#e63946';
      return;
    }
    accused = val;
    localStorage.setItem('accused', accused);
    closeAccuse();
    showEnding();
  });

  async function renderScene(id) {
    clearSceneTimer();
    await fadeOut();
    if (roomLight) {
      roomLight.classList.remove('off', 'steady', 'flicker');
    }
    if (characterLayer) {
      characterLayer.classList.remove('show');
    }
    currentId = id;
    const scene = getScene(id);
    if (!scene) return;
    if (roomLight) {
      roomLight.classList.add(scene.light || 'flicker');
    }
    if (characterLayer) {
      const ch = (scene.character && data.characters) ? data.characters[scene.character] : null;
      if (ch) {
        const key = scene.character;
        const portrait = `<img class="char-img" src="images/characters/${key}.png" alt="${ch.name}" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='images/characters/${key}.svg';}else{this.style.display='none';}" />`;
        characterLayer.innerHTML = `<div class="character-portrait">${portrait}</div><div class="character-name">${ch.name}</div><div class="character-role">${ch.role}</div>`;
        setTimeout(() => { if (characterLayer) characterLayer.classList.add('show'); }, 300);
      } else {
        characterLayer.innerHTML = '';
      }
    }
    choicesEl.innerHTML = '';
    rollResult.textContent = '';
    sceneTitle.textContent = scene.title;
    await typewriter(sceneText, scene.text);
    await fadeIn();

    if (id === 's12_ending') {
      openAccuseModal();
      return;
    }

    scene.choices.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.choiceIdx = idx;
      if (c.dc <= 6) {
        btn.innerHTML = `${c.label} <span class="choice-skill">ACAO LIVRE</span>`;
      } else {
        btn.innerHTML = `${c.label} <span class="choice-skill">${c.skill}</span>`;
      }
      btn.addEventListener('click', () => {
        playSound(() => window.SoundEngine && window.SoundEngine.playClick());
        handleChoice(c, false, idx);
      });
      choicesEl.appendChild(btn);
    });
    startSceneTimer(scene.choices);
  }

  async function handleChoice(c, forced, choiceIdx) {
    forced = !!forced;
    clearSceneTimer();
    Array.from(choicesEl.querySelectorAll('button')).forEach(b => b.disabled = true);

    let success;
    if (c.dc <= 6) {
      success = true;
      rollResult.textContent = 'ACAO LIVRE - SEM ROLAGEM';
      await sleep(350);
      playSound(() => window.SoundEngine && window.SoundEngine.playSuccess());
    } else {
      success = await roll(c.skill, c.dc);
    }

    if (success && c.observation) {
      addObservation(c.observation);
    }

    if (success || forced) {
      await renderScene(c.next);
      return;
    }

    // Falha: desabilita apenas o botao clicado
    const clickedBtn = Array.from(choicesEl.querySelectorAll('button')).find(b => Number(b.dataset.choiceIdx) === choiceIdx);
    if (clickedBtn) {
      clickedBtn.classList.add('failed');
      clickedBtn.disabled = true;
    }
    rollResult.textContent = (rollResult.textContent || '') + '  ->  FALHOU. ESCOLHA OUTRA ACAO.';

    Array.from(choicesEl.querySelectorAll('button')).forEach(b => {
      if (!b.classList.contains('failed')) b.disabled = false;
    });

    const remaining = Array.from(choicesEl.querySelectorAll('button')).filter(b => !b.classList.contains('failed'));
    if (remaining.length === 0) {
      rollResult.textContent = 'TODAS AS TENTATIVAS FALHARAM. SEGUINDO...';
      await sleep(1200);
      const sc = getScene(currentId);
      const target = sc && sc.choices.length ? sc.choices[0].next : c.next;
      await renderScene(target);
      return;
    }

    const sc = getScene(currentId);
    if (sc) startSceneTimer(sc.choices);
  }

  // Observacoes que apontam para o Delegado (culpado canonico)
  const DELEGADO_OBSERVATIONS = [
    'Cheiro forte de combustivel',
    'O Delegado evita o olhar quando voce menciona o caso 23',
    'Um isqueiro com a marca da delegacia esta no bolso da jaqueta dele',
    'O Faxineiro confirma: viu o Delegado entrar com um galao as 23h15',
    'O log mostra acesso ao sistema de cameras as 22:58 com a senha do Tecnico, mas ele estava em casa',
    'Entre as cinzas, restos de um livro-razao com nomes riscados a tinta vermelha',
    'Fragmento de assinatura: as iniciais parecem ser D. ou S.'
  ];

  function computeResult(accusedName) {
    const lower = (accusedName || '').toLowerCase();
    const hasDelegadoObs = DELEGADO_OBSERVATIONS.filter(obs => observations.includes(obs)).length;
    const score = hasDelegadoObs;

    if (lower.includes('delegado')) {
      if (score >= 3) {
        return { title: 'CASO RESOLVIDO', text: 'Voce acusou o Delegado e suas observacoes sustentam a acusacao: cheiro de combustivel, isqueiro da delegacia, testemunho do faxineiro e cameras desligadas. A verdade veio a tona.', rank: 'A' };
      } else if (score >= 1) {
        return { title: 'VERDADE PARCIAL', text: 'Voce acertou o Delegado, mas faltaram provas suficientes para provar a corrupcao. Ele confessou sob pressao, mas parte da verdade ficou nas cinzas.', rank: 'B' };
      } else {
        return { title: 'CASO INCONCLUSIVO', text: 'Voce acusou o Delegado sem nenhuma observacao concreta. Sem provas, a acusacao nao se sustenta.', rank: 'C' };
      }
    }
    if (lower.includes('silva')) {
      return { title: 'ERRO DE JULGAMENTO', text: 'Voce acusou a Detetive Silva, que tentava expor a corrupcao. O verdadeiro culpado escapou.', rank: 'C' };
    }
    if (lower.includes('tecnico') || lower.includes('ti')) {
      return { title: 'ERRO DE JULGAMENTO', text: 'Voce acusou o Tecnico de TI, que apenas teve sua senha usada. O verdadeiro culpado escapou.', rank: 'C' };
    }
    if (lower.includes('escrivao')) {
      return { title: 'ERRO DE JULGAMENTO', text: 'Voce acusou o Escrivao, que apenas cumpriu ordens. O verdadeiro culpado escapou.', rank: 'C' };
    }
    if (lower.includes('faxineiro')) {
      return { title: 'ERRO DE JULGAMENTO', text: 'Voce acusou o Faxineiro, que era apenas uma testemunha. O verdadeiro culpado escapou.', rank: 'C' };
    }
    return { title: 'CASO INCONCLUSIVO', text: 'Sem acusacao clara, o caso permanece nas sombras.', rank: 'C' };
  }

  async function showEnding() {
    clearSceneTimer();
    const result = computeResult(accused);
    endingTitle.textContent = result.title;
    endingText.textContent = result.text + `\n\nObservacoes coletadas: ${observations.length}\nSua anotacao: ${(notes || 'Sem anotacoes')}\nRank: ${result.rank}`;
    if (endingRank) endingRank.textContent = 'RANK ' + result.rank;
    ending.classList.remove('hidden');

    playSound(() => window.SoundEngine && window.SoundEngine.playSuspense());

    const playerName = localStorage.getItem('playerName') || 'Anonimo';
    fetch('/api/game-over', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playerName,
        accused: accused || 'Nenhum',
        resultTitle: result.title,
        observationsCount: observations.length,
        notesCount: (notes || '').length,
        score: result.rank === 'A' ? 4 : result.rank === 'B' ? 3 : result.rank === 'C' ? (result.title === 'CASO INCONCLUSIVO' ? 0 : 1) : 0,
        rank: result.rank
      })
    }).catch(err => {
      console.warn('Não foi possivel enviar o resultado ao servidor:', err);
    });
  }

  restartBtn.addEventListener('click', () => {
    localStorage.removeItem('observations');
    localStorage.removeItem('notes');
    localStorage.removeItem('accused');
    observations = [];
    notes = '';
    accused = null;
    ending.classList.add('hidden');
    renderScene('s0_intro');
  });

  fetch('data/scenes.json')
    .then(r => r.json())
    .then(d => {
      data = d;
      renderScene('s0_intro');
    })
    .catch(err => {
      sceneText.textContent = 'Erro ao carregar dados do jogo: ' + err;
    });
})();
