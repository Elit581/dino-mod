function startAutoBot() {
  if (!window.Runner || !Runner.instance_) return;
  if (botInterval) return;

  const canvas = document.querySelector('canvas.runner-canvas');
  if (!canvas) return;

  const dino = Runner.instance_.tRex;

  botInterval = setInterval(() => {
    if (!autoBot || !Runner.instance_ || Runner.instance_.crashed) return;

    if (!dino.jumping && !dino.ducking && dino.yPos === dino.groundYPos) {
      // Detectar obstáculos
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
        // Simular tecla "espaço" para pular
        const keyboardEventDown = new KeyboardEvent('keydown', { keyCode: 32, which: 32 });
        const keyboardEventUp = new KeyboardEvent('keyup', { keyCode: 32, which: 32 });
        window.dispatchEvent(keyboardEventDown);
        window.dispatchEvent(keyboardEventUp);
      }
    }
  }, 50);
}
