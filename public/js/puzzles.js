// Tech Minigames for Mundo SENAI RPG
// Simplificados para nao exigir conhecimento de programacao
(function (global) {
  const Puzzles = {
    // Puzzle 1: Senha do cofre (logica simples de observacao)
    safeCracker: {
      title: "COFRE - DESCOBRIR A SENHA",
      instruction: "No cofre ha um bilhete rabiscado: 'A senha e a mesma do meu aniversario: 07-04-1985'. Qual alternativa combina com essa senha?",
      options: [
        { text: "07-04-1985", correct: true },
        { text: "04-07-1985", correct: false },
        { text: "1985-07-04", correct: false },
        { text: "07-04-85", correct: false }
      ]
    },

    // Puzzle 2: Documento rasgado (reconstrucao visual)
    documentReconstruction: {
      title: "DOCUMENTO RASGADO - RECONSTRUCAO",
      instruction: "Voce encontrou pedaços de um documento no lixo. Um fragmento diz: 'Caso 23 - responsabilidade do setor'. Quem assinou esse documento?",
      options: [
        { text: "Delegado", correct: false },
        { text: "Escrivao", correct: false },
        { text: "Detetive Silva", correct: true },
        { text: "Tecnico de TI", correct: false }
      ]
    },

    // Puzzle 3: Horario das cameras (observacao simples)
    cameraSchedule: {
      title: "CAMERAS - HORARIO SUSPEITO",
      instruction: "O registro mostra que as cameras pararam de gravar em um horario especifico. Qual foi?",
      options: [
        { text: "20:00", correct: false },
        { text: "23:00", correct: true },
        { text: "00:00", correct: false },
        { text: "06:00", correct: false }
      ]
    },

    // Helper to start puzzle modal
    startPuzzle(puzzleKey, onSuccess, onFailure) {
      const p = this[puzzleKey] || this.safeCracker;

      const modal = document.createElement('div');
      modal.className = 'puzzle-modal';
      modal.innerHTML = `
        <div class="puzzle-card">
          <div class="puzzle-header">
            <span class="puzzle-title">${p.title}</span>
            <span class="puzzle-badge">DESAFIO DE INVESTIGACAO</span>
          </div>
          <p class="puzzle-instruction">${p.instruction}</p>
          <div class="puzzle-options">
            ${p.options.map((opt, idx) => `
              <button class="puzzle-opt-btn" data-correct="${opt.correct}">${opt.text}</button>
            `).join('')}
          </div>
          <div class="puzzle-footer">
            <button class="puzzle-cancel-btn">Tentar outra coisa (Rolar D20)</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelectorAll('.puzzle-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const isCorrect = btn.getAttribute('data-correct') === 'true';
          if (window.SoundEngine) {
            if (isCorrect) window.SoundEngine.playSuccess();
            else window.SoundEngine.playFailure();
          }
          btn.style.borderColor = isCorrect ? '#2a9d8f' : '#e63946';
          btn.style.background = isCorrect ? 'rgba(42, 157, 143, 0.3)' : 'rgba(230, 57, 70, 0.3)';

          setTimeout(() => {
            modal.remove();
            if (isCorrect) onSuccess();
            else onFailure();
          }, 600);
        });
      });

      modal.querySelector('.puzzle-cancel-btn').addEventListener('click', () => {
        modal.remove();
        onFailure(true); // fall back to d20
      });
    }
  };

  global.Puzzles = Puzzles;
})(window);
