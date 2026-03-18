<template>
  <div id="app">
    <AiTest></AiTest>
  </div>
</template>

<script>
import AiTest from './AiTest.vue'

export default {
  name: 'App',
  components: {
    AiTest
  },
  data() {
    return {}
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
