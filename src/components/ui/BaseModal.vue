<script setup>
defineProps({
  open: Boolean,
  title: String
})
const emit=defineEmits(['close'])
</script>
<template>
 <div v-if="open" class="backdrop" @click.self="emit('close')"><section role="dialog" aria-modal="true" :aria-label="title" class="modal"><header><h3>{{ title }}</h3><button type="button" aria-label="Cerrar ventana" @click="emit('close')">✕</button></header><slot /></section></div>
</template>
<style scoped>
.backdrop{position:fixed;inset:0;z-index:60;background:#0f172a99;display:grid;place-items:center;padding:16px}.modal{background:white;border-radius:14px;max-height:90vh;overflow-y:auto;width:min(680px,100%);padding:22px;box-shadow:0 20px 55px #0004}header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}h3{margin:0}button{border:0;background:transparent;cursor:pointer;font-size:20px}
</style>
