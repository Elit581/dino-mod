(() => {
  if (window.dinoModMenu) return; // evita múltiplas execuções

  const Runner = window.Runner || window.RunnerInstance || window.Runner.prototype.gameOver ? window.Runner : null;
  if (!Runner && !window.Runner.instance_) {
    alert('Não encontrou o jogo do dinossauro nesta página.');
    return;
  }

  const runnerInstance = window.Runner.instance_;

  // Estado do menu
  let invincible = false;
  let autoJump = false;
  let autoJumpInterval = null;

  // Função para alterar velocidade
  function setSpeed(value) {
    if (runnerInstance) {
      runnerInstance.currentSpeed = value;
      runnerInstance.setSpeed && runnerInstance.setSpeed(value);
    }
  }

  // Invencibilidade
  function enableInvincible() {
    Runner.prototype.gameOver = function () {
      // Ignora game over
      // Pode exibir um console.log ou nada
    };
  }

  function disableInvincible() {
    location.reload(); // para resetar comportamento padrão
  }

  // Bot automático simples: pula ao detectar obstáculos próximos
  function startAutoJump() {
    if (!runnerInstance) return;
    autoJumpInterval = setInterval(() => {
      const tRex = runnerInstance.tRex;
      const obstacles = runnerInstance.horizon.obstacles;
      if (obstacles.length > 0) {
        const obstacle = obstacles[0];
        const distance = obstacle.xPos - tRex.xPos;
        if (distance < 60 && tRex.jumping === false) {
          tRex.startJump();
        }
      }
    }, 50);
  }

  function stopAutoJump() {
    clearInterval(autoJumpInterval);
    autoJumpInterval = null;
  }

  // Criar menu
  const menu = document.createElement('div');
  menu.style = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    font-family: monospace;
    z-index: 99999;
    border-radius: 8px;
    width: 220px;
  `;

  // Título
  const title = document.createElement('div');
  title.textContent = 'Dino Mod Menu';
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '10px';
  menu.appendChild(title);

  // Velocidade
  const speedLabel = document.createElement('label');
  speedLabel.textContent = 'Velocidade: ';
  menu.appendChild(speedLabel);

  const speedInput = document.createElement('input');
  speedInput.type = 'number';
  speedInput.min = 1;
  speedInput.max = 1000;
  speedInput.value = runnerInstance.currentSpeed.toFixed(2);
  speedInput.style.width = '60px';
  speedInput.style.marginBottom = '10px';
  speedInput.onchange = () => {
    const val = parseFloat(speedInput.value);
    if (!isNaN(val)) setSpeed(val);
  };
  menu.appendChild(speedInput);

  menu.appendChild(document.createElement('br'));

  // Invencível
  const invincibleBtn = document.createElement('button');
  invincibleBtn.textContent = 'Invencível OFF';
  invincibleBtn.style.width = '100%';
  invincibleBtn.style.marginBottom = '10px';
  invincibleBtn.onclick = () => {
    invincible = !invincible;
    if (invincible) {
      enableInvincible();
      invincibleBtn.textContent = 'Invencível ON';
    } else {
      disableInvincible();
      invincibleBtn.textContent = 'Invencível OFF';
    }
  };
  menu.appendChild(invincibleBtn);

  // Auto jump
  const autoJumpBtn = document.createElement('button');
  autoJumpBtn.textContent = 'Auto Jump OFF';
  autoJumpBtn.style.width = '100%';
  autoJumpBtn.onclick = () => {
    autoJump = !autoJump;
    if (autoJump) {
      startAutoJump();
      autoJumpBtn.textContent = 'Auto Jump ON';
    } else {
      stopAutoJump();
      autoJumpBtn.textContent = 'Auto Jump OFF';
    }
  };
  menu.appendChild(autoJumpBtn);

  document.body.appendChild(menu);
  window.dinoModMenu = menu;
})();
