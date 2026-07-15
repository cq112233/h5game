<template>
  <div class="phaser-container" ref="gameContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as Phaser from 'phaser';
import MainScene from '../game/MainScene';

const gameContainer = ref(null);
const emit = defineEmits(['ready']);

let game = null;
let mainScene = null;

onMounted(() => {
  const config = {
    type: Phaser.AUTO,
    width: 60 * 8 + 40,
    height: 60 * 6 + 40,
    parent: gameContainer.value,
    backgroundColor: '#ffffff',
    scene: [MainScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  game = new Phaser.Game(config);
  
  // Wait for scene to be ready
  game.events.on('ready', () => {
    mainScene = game.scene.getScene('MainScene');
    
    // Listen for custom event from our scene
    if (mainScene) {
      if (mainScene.sys.isActive()) {
        emit('ready', mainScene);
      } else {
        mainScene.events.on('scene-ready', () => {
          emit('ready', mainScene);
        });
      }
    }
  });
});

onUnmounted(() => {
  if (game) {
    game.destroy(true);
  }
});
</script>

<style scoped>
.phaser-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
