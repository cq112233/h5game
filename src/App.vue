<template>
  <div class="app-container">
    <header class="app-header">
      <h1>鲁老师：幼儿路径规划游戏</h1>
      <p>大班数学逻辑思维版</p>
    </header>

    <main class="game-area">
      <!-- Player 1 / Screen 1 -->
      <div class="screen-wrapper">
        <h2 class="screen-title">玩家 1 (左)</h2>
        <div class="game-board">
          <PhaserGame @ready="onScene1Ready" />
        </div>
        <GameController 
          :disabled="isAnimating1" 
          @execute="execute1" 
          @reset="reset1" 
        />
      </div>

      <!-- Player 2 / Screen 2 (Hidden on mobile by media query or flex wrap) -->
      <div class="screen-wrapper screen-2">
        <h2 class="screen-title">玩家 2 (右)</h2>
        <div class="game-board">
          <PhaserGame @ready="onScene2Ready" />
        </div>
        <GameController 
          :disabled="isAnimating2" 
          @execute="execute2" 
          @reset="reset2" 
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PhaserGame from './components/PhaserGame.vue';
import GameController from './components/GameController.vue';

const scene1 = ref(null);
const scene2 = ref(null);
const isAnimating1 = ref(false);
const isAnimating2 = ref(false);

const onScene1Ready = (scene) => { scene1.value = scene; };
const onScene2Ready = (scene) => { scene2.value = scene; };

const execute1 = (instructions) => {
  if (!scene1.value) return;
  isAnimating1.value = true;
  scene1.value.executeInstructions(instructions, (reachedTarget) => {
    isAnimating1.value = false;
    if (reachedTarget) {
      setTimeout(() => alert(`玩家 1 成功到达：${reachedTarget.name} ${reachedTarget.icon}！`), 100);
    }
  });
};

const execute2 = (instructions) => {
  if (!scene2.value) return;
  isAnimating2.value = true;
  scene2.value.executeInstructions(instructions, (reachedTarget) => {
    isAnimating2.value = false;
    if (reachedTarget) {
      setTimeout(() => alert(`玩家 2 成功到达：${reachedTarget.name} ${reachedTarget.icon}！`), 100);
    }
  });
};

const reset1 = () => {
  if (!scene1.value) return;
  scene1.value.resetGame();
};

const reset2 = () => {
  if (!scene2.value) return;
  scene2.value.resetGame();
};
</script>

<style>
/* Global reset inside App */
* {
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
body {
  margin: 0;
  padding: 0;
  background-color: #e0f2f1;
}

.app-container {
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-header h1 {
  color: #00695c;
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.app-header p {
  color: #00897b;
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.game-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  width: 100%;
  max-width: 1400px;
}

.screen-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
}

.screen-title {
  margin-top: 0;
  color: #00796b;
  font-size: 1.5rem;
}

.game-board {
  width: 100%;
  aspect-ratio: 520 / 400; /* Approx match the 60*8 x 60*6 */
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .screen-2 {
    display: none; /* Hide second screen on smaller devices */
  }
}
</style>
