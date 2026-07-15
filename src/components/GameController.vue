<template>
  <div class="game-controller">
    <!-- Instructions display -->
    <div class="instructions-display">
      <div class="instruction-title">路线指令：</div>
      <div class="instruction-list">
        <span 
          v-for="(dir, index) in instructions" 
          :key="index"
          class="instruction-item"
        >
          {{ getArrow(dir) }}
        </span>
        <span v-if="instructions.length === 0" class="empty-state">等待输入...</span>
      </div>
    </div>

    <!-- Controls layout -->
    <div class="controls-layout">
      <!-- D-Pad -->
      <div class="d-pad">
        <button class="dir-btn up" @click="addInstruction('up')" :disabled="disabled">↑</button>
        <button class="dir-btn left" @click="addInstruction('left')" :disabled="disabled">←</button>
        <button class="dir-btn right" @click="addInstruction('right')" :disabled="disabled">→</button>
        <button class="dir-btn down" @click="addInstruction('down')" :disabled="disabled">↓</button>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button class="action-btn execute" @click="execute" :disabled="disabled || instructions.length === 0">
          ✓ 确定
        </button>
        <button class="action-btn erase" @click="erase" :disabled="disabled || instructions.length === 0">
          ⌫ 擦除
        </button>
        <button class="action-btn reset" @click="reset" :disabled="disabled">
          ↻ 重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['execute', 'reset']);
const instructions = ref([]);

const addInstruction = (dir) => {
  if (props.disabled) return;
  // Limit to maybe 20 instructions to avoid crazy bounds
  if (instructions.value.length < 20) {
    instructions.value.push(dir);
  }
};

const erase = () => {
  if (props.disabled) return;
  instructions.value.pop();
};

const reset = () => {
  if (props.disabled) return;
  instructions.value = [];
  emit('reset');
};

const execute = () => {
  if (props.disabled || instructions.value.length === 0) return;
  emit('execute', [...instructions.value]);
};

const getArrow = (dir) => {
  switch(dir) {
    case 'up': return '↑';
    case 'down': return '↓';
    case 'left': return '←';
    case 'right': return '→';
    default: return '';
  }
};

defineExpose({
  clearInstructions: () => {
    instructions.value = [];
  }
});
</script>

<style scoped>
.game-controller {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-top: 16px;
  width: 100%;
  max-width: 600px;
}

.instructions-display {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  min-height: 50px;
  border: 1px solid #e1e8ed;
}

.instruction-title {
  font-weight: bold;
  color: #333;
  margin-right: 12px;
  white-space: nowrap;
}

.instruction-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.instruction-item {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background: #4fc08d;
  color: white;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(79, 192, 141, 0.3);
}

.empty-state {
  color: #999;
  font-style: italic;
}

.controls-layout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.d-pad {
  display: grid;
  grid-template-columns: 50px 50px 50px;
  grid-template-rows: 50px 50px 50px;
  gap: 8px;
}

.dir-btn {
  background: #fff9c4;
  border: 2px solid #fbc02d;
  border-radius: 8px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #f57f17;
  cursor: pointer;
  box-shadow: 0 4px 0 #f9a825;
  transition: all 0.1s;
}

.dir-btn:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 #f9a825;
}

.dir-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.up { grid-column: 2; grid-row: 1; }
.left { grid-column: 1; grid-row: 2; }
.right { grid-column: 3; grid-row: 2; }
.down { grid-column: 2; grid-row: 3; }

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.action-btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  color: white;
  transition: all 0.1s;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.execute {
  background: #4fc08d;
  box-shadow: 0 4px 0 #3aa876;
}
.execute:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 #3aa876;
}

.erase {
  background: #ff5252;
  box-shadow: 0 4px 0 #d50000;
}
.erase:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 #d50000;
}

.reset {
  background: #448aff;
  box-shadow: 0 4px 0 #2962ff;
}
.reset:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 #2962ff;
}

@media (max-width: 600px) {
  .controls-layout {
    flex-direction: column;
  }
  .action-buttons {
    flex-direction: row;
    width: 100%;
  }
  .action-btn {
    flex: 1;
  }
}
</style>
