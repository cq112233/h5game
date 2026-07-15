<template>
  <div class="app-container">
    <header class="app-header">
      <h1>鲁老师：幼儿路径规划游戏</h1>
      <p>大班数学逻辑思维版</p>
      
      <!-- Timer & Start Area -->
      <div class="game-info">
        <div v-if="!gameStarted" class="start-banner">
          <button class="start-btn" @click="startGame">▶️ 开始游戏</button>
        </div>
        <div v-else class="timer-display">
          ⏱️ 用时: {{ formattedTime }}
        </div>
      </div>
    </header>

    <main class="game-area">
      <!-- Player 1 / Screen 1 -->
      <div class="screen-wrapper">
        <h2 class="screen-title">玩家 1 (左)</h2>
        <div class="progress-bar">
          <span>收集进度 ({{ visited1.length }}/4): </span>
          <span v-for="t in visited1" :key="t.name" class="visited-icon" :title="t.name">{{ t.icon }}</span>
        </div>
        <div class="game-board">
          <PhaserGame @ready="onScene1Ready" />
        </div>
        <GameController 
          ref="controller1"
          :disabled="isAnimating1 || !gameStarted" 
          @execute="execute1" 
          @reset="reset1" 
        />
      </div>

      <!-- Player 2 / Screen 2 (Hidden on mobile by media query or flex wrap) -->
      <div class="screen-wrapper screen-2">
        <h2 class="screen-title">玩家 2 (右)</h2>
        <div class="progress-bar">
          <span>收集进度 ({{ visited2.length }}/4): </span>
          <span v-for="t in visited2" :key="t.name" class="visited-icon" :title="t.name">{{ t.icon }}</span>
        </div>
        <div class="game-board">
          <PhaserGame @ready="onScene2Ready" />
        </div>
        <GameController 
          ref="controller2"
          :disabled="isAnimating2 || !gameStarted" 
          @execute="execute2" 
          @reset="reset2" 
        />
      </div>
    </main>

    <!-- Custom Success Modal -->
    <div class="modal-overlay" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🎉 恭喜！</h3>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn" @click="closeModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PhaserGame from './components/PhaserGame.vue';
import GameController from './components/GameController.vue';

const scene1 = ref(null);
const scene2 = ref(null);
const controller1 = ref(null);
const controller2 = ref(null);
const isAnimating1 = ref(false);
const isAnimating2 = ref(false);

const showModal = ref(false);
const modalMessage = ref('');

// --- Timer & Game State ---
const gameStarted = ref(false);
const timeElapsed = ref(0);
let timerInterval = null;

const visited1 = ref([]);
const visited2 = ref([]);
const TOTAL_TARGETS = 4;

const formattedTime = computed(() => {
  const m = Math.floor(timeElapsed.value / 60).toString().padStart(2, '0');
  const s = (timeElapsed.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const startGame = () => {
  gameStarted.value = true;
  timeElapsed.value = 0;
  visited1.value = [];
  visited2.value = [];
  
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed.value++;
  }, 1000);
  
  scene1.value?.resetGame();
  scene2.value?.resetGame();
  controller1.value?.clearInstructions();
  controller2.value?.clearInstructions();
};

const stopGame = () => {
  if (timerInterval) clearInterval(timerInterval);
  gameStarted.value = false;
};

const handleTargetReached = (playerNum, reachedTarget) => {
  const visitedList = playerNum === 1 ? visited1 : visited2;
  
  const alreadyVisited = visitedList.value.find(t => t.name === reachedTarget.name);
  if (!alreadyVisited) {
    visitedList.value.push(reachedTarget);
  }
  
  if (visitedList.value.length >= TOTAL_TARGETS) {
    stopGame();
    modalMessage.value = `👑 玩家 ${playerNum} 率先到达了所有地点！\n总耗时：${formattedTime.value}`;
    showModal.value = true;
  } else {
    modalMessage.value = `玩家 ${playerNum} 成功到达：${reachedTarget.name} ${reachedTarget.icon}！\n当前进度: ${visitedList.value.length}/${TOTAL_TARGETS}`;
    showModal.value = true;
  }
};

const closeModal = () => {
  showModal.value = false;
};

const onScene1Ready = (scene) => { scene1.value = scene; };
const onScene2Ready = (scene) => { scene2.value = scene; };

const execute1 = (instructions) => {
  if (!scene1.value || !gameStarted.value) return;
  isAnimating1.value = true;
  scene1.value.executeInstructions(instructions, (reachedTarget) => {
    isAnimating1.value = false;
    controller1.value?.clearInstructions();
    if (reachedTarget) {
      handleTargetReached(1, reachedTarget);
    }
  });
};

const execute2 = (instructions) => {
  if (!scene2.value || !gameStarted.value) return;
  isAnimating2.value = true;
  scene2.value.executeInstructions(instructions, (reachedTarget) => {
    isAnimating2.value = false;
    controller2.value?.clearInstructions();
    if (reachedTarget) {
      handleTargetReached(2, reachedTarget);
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

.game-info {
  margin-top: 15px;
}

.start-btn {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 4px 0 #e65100;
  transition: all 0.1s;
}

.start-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #e65100;
}

.timer-display {
  display: inline-block;
  background-color: white;
  color: #d32f2f;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 24px;
  border-radius: 24px;
  border: 2px solid #ef5350;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.progress-bar {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 15px;
  font-weight: bold;
  color: #555;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.visited-icon {
  margin-left: 8px;
  font-size: 1.2rem;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
}

.modal-header {
  background-color: #4fc08d;
  padding: 20px;
  text-align: center;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.modal-body {
  padding: 30px 20px;
  text-align: center;
}

.modal-body p {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 20px;
  display: flex;
  justify-content: center;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.modal-btn {
  background-color: #4fc08d;
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 0 #3aa876;
}

.modal-btn:hover {
  background-color: #42b983;
}

.modal-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #3aa876;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
