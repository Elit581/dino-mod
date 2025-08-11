javascript:(() => {
  if (window.dinoModActive) return alert('Script já ativo!');
  window.dinoModActive = true;

  // --- Estilos do menu ---
  const style = document.createElement('style');
  style.textContent = `
    #dinoModMenu {
      position: fixed;
      top: 20px; right: 20px;
      background: #222;
      color: #eee;
      padding: 15px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      z-index: 99999;
      width: 260px;
      box-shadow: 0 0 10px #000a;
      user-select: none;
    }
    #dinoModMenu button, #dinoModMenu input[type=checkbox], #dinoModMenu input[type=range] {
      cursor: pointer;
    }
    #dinoModMenu button {
      background: #775ce3;
      border: none;
      color: white;
      padding: 8px;
      margin-top: 10px;
      width: 100%;
      border-radius: 4px;
      font-weight: bold;
      user-select: none;
    }
    #dinoModMenu label {
      display: block;
      margin-top: 10px;
      font-size: 14px;
      user-select: none;
    }
    #dinoModMenu input[type=range] {
      width: 100%;
    }
  `;
  document.head.appendChild(style);

  // --- Criar menu ---
  const menu = document.createElement('div');
  menu.id = 'dinoModMenu';
  menu.innerHTML = `
    <div><b>Dino Mod v2</b></div>
    
    <label>
      Velocidade: <span id="speedValue">10</span>
      <input type="range" min="5" max="50" value="10" id="speedRange" />
    </label>
    
    <label>
      <input type="checkbox" id="invincibleCheckbox" />
      Invencível discreto
    </label>
    
    <label>
      <input type="checkbox" id="autoBotCheckbox" />
      Bot automático (pula sozinho)
    </label>
    
    <div>Pontuação máxima: <span id="scoreDisplay">0</span></div>
    
    <button id="closeDinoMod">Fechar</button>
  `;
  document.body.appendChild(menu);

  // --- Variáveis de controle ---
  let speed = 10;
  let invincible = false;
  let autoBot = false;
  let maxScore = 0;
  let loopId;

  const speedRange = document.getElementById('speedRange');
  const speedValue = document.getElementById('speedValue');
  const invincibleCheckbox = document.getElementById('invincibleCheckbox');
  const autoBotCheckbox = document.getElementById('autoBotCheckbox');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const closeBtn = document.getElementById('closeDinoMod');

  // --- Função para setar velocidade ---
  function updateSpeed() {
    if (window.Runner && Runner.instance_) {
      Runner.instance_.setSpeed(speed);
    }
  }

  // --- Invencibilidade discreta (wrapper que bloqueia gameOver sem sobrescrever direto) ---
  let originalGameOver;
  function enableInvincible() {
    if (!window.Runner || !Runner.instance_) return;
    if (!originalGameOver) {
      originalGameOver = Runner.instance_.gameOver.bind(Runner.instance_);
      Runner.instance_.gameOver = function() {
        // Intercepta chamada de gameOver e não deixa o jogo acabar
        if (!invincible) {
          originalGameOver();
        } else {
          // Poderia colocar aqui algum feedback ou efeito, se quiser
          // console.log('Invencível ativo: gameOver bloqueado');
        }
      };
    }
  }
  function disableInvincible() {
    if (!window.Runner || !Runner.instance_) return;
    if (originalGameOver) {
      Runner.instance_.gameOver = originalGameOver;
      originalGameOver = null;
    }
  }

  function toggleInvincible(on) {
    invincible = on;
    if (invincible) {
      enableInvincible();
    } else {
      disableInvincible();
    }
  }

  // --- Bot automático: detecta obstáculos no canvas e simula pulo ---
  let botInterval;
  function startAutoBot() {
    if (!window.Runner || !Runner.instance_) return;
    if (botInterval) return; // já rodando

    const canvas = document.querySelector('canvas.runner-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dino = Runner.instance_.tRex;

    botInterval = setInterval(() => {
      if (!autoBot || !Runner.instance_ || Runner.instance_.crashed) return;

      // Posição e tamanho aproximada da área onde aparecem obstáculos
      // Ajuste valores se precisar!
      const startX = 90; // início da área de scan
      const width = 30;  // largura da área
      const height = 30; // altura da área

      // Pega os pixels da área (posição fixa na canvas)
      const imageData = ctx.getImageData(startX, canvas.height - height - 10, width, height);

      // Procura pixels escuros (obstáculos)
      let obstacleFound = false;
      for(let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i+1];
        const b = imageData.data[i+2];
        const alpha = imageData.data[i+3];
        // Considera pixel como obstáculo se não for branco (255,255,255)
        if (alpha > 0 && (r < 100 || g < 100 || b < 100)) {
          obstacleFound = true;
          break;
        }
      }

      if(obstacleFound && dino.jumping === false && dino.ducking === false) {
        // Simula pulo
        Runner.instance_.tRex.startJump();
      }
    }, 50);
  }

  function stopAutoBot() {
    if (botInterval) {
      clearInterval(botInterval);
      botInterval = null;
    }
  }

  // --- Atualiza pontuação máxima ---
  function updateScore() {
    const scoreContainer = document.querySelector('.score-container');
    if (scoreContainer) {
      const currentScore = parseInt(scoreContainer.textContent.trim()) || 0;
      if (currentScore > maxScore) maxScore = currentScore;
      scoreDisplay.textContent = maxScore;
    } else {
      scoreDisplay.textContent = maxScore;
    }
  }

  // --- Loop principal ---
  function mainLoop() {
    updateSpeed();
    updateScore();
    if (invincible) enableInvincible();
    if (autoBot) startAutoBot();
    else stopAutoBot();
    loopId = requestAnimationFrame(mainLoop);
  }

  // --- Eventos do menu ---
  speedRange.addEventListener('input', e => {
    speed = Number(e.target.value);
    speedValue.textContent = speed;
    updateSpeed();
  });

  invincibleCheckbox.addEventListener('change', e => {
    toggleInvincible(e.target.checked);
  });

  autoBotCheckbox.addEventListener('change', e => {
    autoBot = e.target.checked;
    if (!autoBot) stopAutoBot();
  });

  closeBtn.addEventListener('click', () => {
    cancelAnimationFrame(loopId);
    disableInvincible();
    stopAutoBot();
    window.dinoModActive = false;
    menu.remove();
    style.remove();
    location.reload();
  });

  mainLoop();
})();
