document.querySelectorAll('.screen').forEach(screen => {
    screen.addEventListener('click', () => {
      const target = screen.dataset.target;
      openPuzzle(target);
    });
  });
  
  document.getElementById('close-puzzle').addEventListener('click', closePuzzle);
  
  function openPuzzle(id) {
    const modal = document.getElementById('puzzle-modal');
    const content = document.getElementById('puzzle-content');
    
    // For now, just placeholder text
    if (id === 'puzzle1') content.innerHTML = "<p>Incoming transmission detected... decoding...</p>";
    if (id === 'puzzle2') content.innerHTML = "<p>Message corrupted. Attempt repair?</p>";
    if (id === 'puzzle3') content.innerHTML = "<p>Static... but there’s something underneath the noise.</p>";
  
    modal.classList.remove('hidden');
  }
  
  function closePuzzle() {
    document.getElementById('puzzle-modal').classList.add('hidden');
  }
  