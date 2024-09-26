<script setup>
import { onBeforeMount, ref } from 'vue'

import importCSV from '@/utils/index.js'
import ToggleOffIcon from '@/components/icons/ToggleOffIcon.vue'
import ToggleOnIcon from '@/components/icons/ToggleOnIcon.vue'

let data

const removeBufferLetter = true
const bufferLetterValue = 'Г'

const currentPair = ref('')
const currentWord = ref('')
const showWord = ref(true)
const currentTheme = ref('dark')

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
}

const showAnswer = () => {
  if (!showWord.value) {
    showWord.value = true
  } else {
    const randomFirstLetterIndex = Math.floor(Math.random() * data.length)
    const randomFirstLetterValue = data[randomFirstLetterIndex]['first/second']

    let randomSecondLetterValue = null

    do {
      // Get all possible letters for the second letter
      const secondLetterKeys = Object.keys(data[randomFirstLetterIndex])
      // Exclude 'first/second' key
      randomSecondLetterValue =
        secondLetterKeys[Math.floor(Math.random() * (secondLetterKeys.length - 1) + 1)]
    } while (
      randomSecondLetterValue === randomFirstLetterValue ||
      (removeBufferLetter && randomSecondLetterValue === bufferLetterValue)
    )

    currentPair.value = randomFirstLetterValue + randomSecondLetterValue
    currentWord.value = data[randomFirstLetterIndex][randomSecondLetterValue]
    showWord.value = false
  }
}

const removeBuffer = () => {
  const bufferIndex = Object.keys(data).find((item) => item['first/second'] === bufferLetterValue)
  data.splice(bufferIndex, 1)
}

onBeforeMount(async () => {
  data = await importCSV.importCSV()
  if (removeBufferLetter) {
    removeBuffer()
  }
  showAnswer()
})
</script>

<template>
  <div :class="['container', currentTheme]" tabindex="0" @click="showAnswer" @keydown="showAnswer">
    <h1>{{ currentPair }}</h1>
    <h2 v-if="showWord" class="word">{{ currentWord }}</h2>
    <button @click="toggleTheme" class="theme-toggle" aria-label="Toggle theme">
      <ToggleOnIcon v-if="currentTheme === 'dark'" class="icon" />
      <ToggleOffIcon v-else class="icon" />
    </button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
  position: relative;
}

.container.dark {
  background-color: #1a1a1a;
  color: #f0f0f0;
}

.container.light {
  background-color: #f7f7f7;
  color: #333;
}

.container:focus {
  outline: none;
}

h1 {
  font-size: 5rem;
  margin: 0;
}

h2 {
  font-size: 3rem;
  margin: 0;
  overflow-wrap: break-word;
  transition: color 0.3s;
}

.word {
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 90%;
  text-align: center;
}

.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
}

.icon {
  width: 32px;
  height: 32px;
}
</style>
