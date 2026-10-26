(function () {
  const fl = document.querySelector('.flashlight');
  if (fl) window.addEventListener('mousemove', (e) => {
    fl.style.setProperty('--x', e.clientX + 'px');
    fl.style.setProperty('--y', e.clientY + 'px');
  });

  const playerLabel = document.getElementById('playerLabel');
  const clueCount = document.getElementById('clueCount');
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

  const name = localStorage.getItem('playerName') || 'Detetive';
  if (playerLabel) playerLabel.textContent = 'Detetive ' + name;

  let data = null;
  let currentId = null;
  let clues = new Set(JSON.parse(localStorage.getItem('clues') || '[]'));
  let accused = localStorage.getItem('accused');

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
        rollResult.textContent = 'TEMPO ESGOTADO. ESCOLHA AUTOMATICA (VANTAGEM): ' + best.label;
        handleChoice(best, true);
      }
    }, 1000);
  }

  function updateClueCount() { if (clueCount) clueCount.textContent = 'PISTAS: ' + clues.size; }
  updateClueCount();

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function playSound(fn) {
    try { if (fn) fn(); } catch (e) { /* audio falhou silenciosamente */ }
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

  // Executa um desafio de TI (puzzle) quando a escolha tem o campo 'puzzle'.
  // Retorna: true = sucesso, false = falha na resposta, null = cancelou para rolar d20
  function playPuzzle(puzzleKey) {
    return new Promise((resolve) => {
      if (!window.Puzzles) {
        resolve(false);
        return;
      }
      window.Puzzles.startPuzzle(puzzleKey,
        () => resolve(true), // acertou
        (fallback) => {      // errou ou cancelou
          if (fallback === true) resolve(null); // cancelou -> rolar d20
          else resolve(false);                  // errou resposta
        }
      );
    });
  }

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
      showEnding();
      return;
    }

    scene.choices.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.choiceIdx = idx;
      if (c.dc <= 6) {
        btn.innerHTML = `${c.label} <span class="choice-skill">ACAO LIVRE</span>`;
      } else if (c.puzzle) {
        btn.innerHTML = `${c.label} <span class="choice-skill">DESAFIO TI</span>`;
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
    if (c.puzzle) {
      const puzzleResult = await playPuzzle(c.puzzle);
      if (puzzleResult === null) {
        // cancelou o desafio, recorre ao d20
        success = await roll(c.skill, c.dc);
      } else {
        success = puzzleResult;
      }
      if (!success) {
        rollResult.textContent = (rollResult.textContent || '') + '  ->  DESAFIO FALHOU.';
      }
    } else if (c.dc <= 6) {
      success = true;
      rollResult.textContent = 'ACAO LIVRE - SEM ROLAGEM';
      await sleep(350);
      playSound(() => window.SoundEngine && window.SoundEngine.playSuccess());
    } else {
      success = await roll(c.skill, c.dc);
    }

    if (success && c.clue) {
      clues.add(c.clue);
      localStorage.setItem('clues', JSON.stringify([...clues]));
      updateClueCount();
    }
    if (c.clue && c.clue.startsWith('acusacao_')) {
      accused = c.clue;
      localStorage.setItem('accused', accused);
    }

    if (success || forced) {
      await renderScene(c.next);
      return;
    }

    // Falha: desabilita apenas o botao clicado (por indice, mais confiavel)
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

  function computeRank(score) {
    if (score >= 4) return 'A';
    if (score >= 2) return 'B';
    return 'C';
  }

  async function showEnding() {
    clearSceneTimer();
    const hasWitness = clues.has('faxineiro_testemunha') || clues.has('faxineiro_detalhes');
    const hasLogs = clues.has('logs_cameras');
    const hasNames = clues.has('nomes_riscados') || clues.has('caso_23');
    const score = (hasWitness ? 2 : 0) + (hasLogs ? 1 : 0) + (hasNames ? 1 : 0);
    const rank = computeRank(score);

    let title, text;
    if (accused === 'acusacao_delegado' && score >= 2) {
      title = 'CASO RESOLVIDO';
      text = 'Voce acusou o Delegado e tinha provas solidas: testemunho do faxineiro, logs de cameras e o caso 23. A verdade veio a tona. Os arquivos queimados escondiam corrupcao, e agora serao repostos. Excelente trabalho, detetive.';
    } else if (accused === 'acusacao_delegado') {
      title = 'VERDADE PARCIAL';
      text = 'Voce acertou o culpado, mas com poucas provas. O Delegado confessou sob pressao, mas parte da verdade ficou nas cinzas. Ainda assim, a justica prevaleceu.';
    } else if (accused === 'acusacao_silva') {
      title = 'ERRO DE JULGAMENTO';
      text = 'Voce acusou a Detetive Silva, que na verdade tentava expor a corrupcao. O verdadeiro culpado escapou. Mas a verdade sobre os arquivos ainda pode ser revelada por outros.';
    } else if (accused === 'acusacao_ti') {
      title = 'ERRO DE JULGAMENTO';
      text = 'Voce acusou o Tecnico de TI, que apenas teve sua senha usada. O verdadeiro culpado escapou. Mas a verdade sobre os arquivos ainda pode ser revelada por outros.';
    } else {
      title = 'CASO INCONCLUSIVO';
      text = 'Sem acusacao clara, o caso permanece nas sombras. Mas voce coletou pistas valiosas que poderao ser usadas mais tarde.';
    }

    endingTitle.textContent = title;
    endingText.textContent = text + `\n\nPistas coletadas: ${clues.size}\nPontuacao: ${score}/4\nRank: ${rank}`;
    if (endingRank) endingRank.textContent = 'RANK ' + rank;
    ending.classList.remove('hidden');

    playSound(() => window.SoundEngine && window.SoundEngine.playSuspense());

    // Envia o resultado para o servidor (atualiza painel admin e CSV)
    const playerName = localStorage.getItem('playerName') || 'Anonimo';
    const accusedLabel = accused === 'acusacao_delegado' ? 'Delegado'
      : accused === 'acusacao_silva' ? 'Detetive Silva'
      : accused === 'acusacao_ti' ? 'Tecnico de TI'
      : accused === 'acusacao_escrivao' ? 'Escrivao'
      : accused === 'acusacao_faxineiro' ? 'Faxineiro'
      : 'Nenhum';

    fetch('/api/game-over', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: playerName,
        accused: accusedLabel,
        resultTitle: title,
        cluesCount: clues.size,
        score,
        rank
      })
    }).catch(err => {
      console.warn('Não foi possível enviar o resultado ao servidor:', err);
    });
  }

  restartBtn.addEventListener('click', () => {
    localStorage.removeItem('clues');
    localStorage.removeItem('accused');
    clues = new Set();
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
