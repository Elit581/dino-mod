(() => {
  if (window.dinoModActive) return alert('Script já ativo!');
  window.dinoModActive = true;

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
    #dinoModMenu button, #dinoModMenu input[type=checkbox], #dinoModMenu input[type=number] {
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
    #dinoModMenu input[type=number] {
      width: 100%;
      padding: 5px;
      border-radius: 4px;
      border: none;
      font-size: 14px;
      box-sizing: border-box;
    }
  `;
  document.head.appendChild(style);

  const menu = document.createElement('div');
  menu.id = 'dinoModMenu';
  menu.innerHTML = `
    <div><b>Dino Mod v2</b></div>
    
    <label>
      Velocidade (5 a 100):
      <input type="number" min="5" max="100" value="10" id="speedInput" />
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

  let speed = 10;
  let invincible = false;
  let autoBot = false;
  let maxScore = 0;
  let loopId;
  let botInterval;

  const speedInput = document.getElementById('speedInput');
  const invincibleCheckbox = document.getElementById('invincibleCheckbox');
  const autoBotCheckbox = document.getElementById('autoBotCheckbox');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const closeBtn = document.getElementById('closeDinoMod');

  function updateSpeed() {
    if (window.Runner && Runner.instance_) {
      Runner.instance_.setSpeed(speed);
    }
  }

  let originalGameOver;
  function enableInvincible() {
    if (!window.Runner || !Runner.instance_) return;
    if (!originalGameOver) {
      originalGameOver = Runner.instance_.gameOver.bind(Runner.instance_);
      Runner.instance_.gameOver = function() {
        if (!invincible) {
          originalGameOver();
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

  function startAutoBot() {
    if (!window.Runner || !Runner.instance_) return;
    if (botInterval) return;

    const canvas = document.querySelector('canvas.runner-canvas');
    if (!canvas) return;

    const dino = Runner.instance_.tRex;

    botInterval = setInterval(() => {
      if (!autoBot || !Runner.instance_ || Runner.instance_.crashed) return;

      if (!dino.jumping && !dino.ducking && dino.yPos === dino.groundYPos) {
        const ctx = canvas.getContext('2d');
        const startX = 90;
        const width = 30;
        const height = 30;
        const imageData = ctx.getImageData(startX, canvas.height - height - 10, width, height);

        let obstacleFound = false;
        for(let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i+1];
          const b = imageData.data[i+2];
          const alpha = imageData.data[i+3];
          if (alpha > 0 && (r < 100 || g < 100 || b < 100)) {
            obstacleFound = true;
            break;
          }
        }

        if(obstacleFound) {
          // Simular tecla espaço para pular
          const keyboardEventDown = new KeyboardEvent('keydown', { keyCode: 32, which: 32 });
          const keyboardEventUp = new KeyboardEvent('keyup', { keyCode: 32, which: 32 });
          window.dispatchEvent(keyboardEventDown);
          window.dispatchEvent(keyboardEventUp);
        }
      }
    }, 50);
  }

  function stopAutoBot() {
    if (botInterval) {
      clearInterval(botInterval);
      botInterval = null;
    }
  }

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

  function mainLoop() {
    updateSpeed();
    updateScore();
    if (invincible) enableInvincible();
    if (autoBot) startAutoBot();
    else stopAutoBot();
    loopId = requestAnimationFrame(mainLoop);
  }

  speedInput.addEventListener('input', e => {
    let val = Number(e.target.value);
    if (val < 5) val = 5;
    if (val > 100) val = 100;
    speed = val;
    speedInput.value = val;
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
