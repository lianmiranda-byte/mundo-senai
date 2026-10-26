(function () {
  const form = document.getElementById('nameForm');
  const input = document.getElementById('playerName');

  // flashlight follow mouse
  const fl = document.querySelector('.flashlight');
  window.addEventListener('mousemove', (e) => {
    fl.style.setProperty('--x', e.clientX + 'px');
    fl.style.setProperty('--y', e.clientY + 'px');
  });

  function playClick() {
    try { if (window.SoundEngine) window.SoundEngine.playClick(); } catch (e) { }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name || name.length < 2) {
      input.focus();
      return;
    }
    playClick();
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    } catch (err) {
      // segue mesmo se falhar
    }
    localStorage.setItem('playerName', name);
    localStorage.removeItem('clues');
    localStorage.removeItem('accused');
    window.location.href = 'game.html';
  });
})();
