javascript:(() => {
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
      width: 220px;
      box-shadow: 0 0 10px #000a;
    }
    #dinoModMenu button {
      background: #775ce3;
      border: none;
      color: white;
      padding: 8px;
      margin-top: 10px;
      width: 100%;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    #dinoModMenu label {
      display: block;
      margin-top: 10px;
      font-size: 14px;
    }
    #dinoModMenu input[type=range] {
      width: 100%;
    }
  `;
  document.head.appendChild(style);

  const menu = document.createElement('div');
  menu.id = 'dinoModMenu';
  menu.innerHTML = `
    <div><b>Dino Mod</b></div>
    <label>
      Velocidade: <span id="speedValue">10</span>
      <input type="range" min="5" max="50" value="10" id="speedRange" />
    </label>
    <label>
      <input type="checkbox" id="invincibleCheckbox" />
      Invencível
    </label>
    <div>Pontuação: <span id="scoreDisplay">0</span></div>
    <button id="closeDinoMod">Fechar</button>
  `;
  document.body.appendChild(menu);

  let speed = 10;
  let invincible = false;

  const speedRange = document.getElementById('speedRange');
  const speedValue = document.getElementById('speedValue');
  const invincibleCheckbox = document.getElementById('invincibleCheckbox');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const closeBtn = document.getElementById('closeDinoMod');

  // Atualiza a velocidade no Runner
  function updateSpeed() {
    if (window.Runner && Runner.instance_) {
      Runner.instance_.setSpeed(speed);
    }
  }

  // Torna o dino invencível (desativa game over)
  function toggleInvincible(on) {
    if (window.Runner && Runner.instance_) {
      if (on) {
        Runner.instance_.gameOver = () => {};
      } else {
        // Recarrega a página para resetar o gameOver original (simples e rápido)
        location.reload();
      }
    }
  }

  // Atualiza a pontuação exibida
  function updateScore() {
    if (window.Runner && Runner.instance_ && Runner.instance_.distanceMeter) {
      const dist = Runner.instance_.distanceMeter.getActualDistance();
      scoreDisplay.textContent = dist.toFixed(0);
    }
  }

  // Loop principal que atualiza o jogo e UI
  let loopId;
  function mainLoop() {
    updateSpeed();
    updateScore();
    if (invincible) toggleInvincible(true);
    loopId = requestAnimationFrame(mainLoop);
  }

  // Eventos UI
  speedRange.addEventListener('input', e => {
    speed = Number(e.target.value);
    speedValue.textContent = speed;
    updateSpeed();
  });

  invincibleCheckbox.addEventListener('change', e => {
    invincible = e.target.checked;
    toggleInvincible(invincible);
  });

  closeBtn.addEventListener('click', () => {
    cancelAnimationFrame(loopId);
    window.dinoModActive = false;
    menu.remove();
    style.remove();
    location.reload();
  });

  mainLoop();
})();
