<script setup>
defineProps({busy:Boolean,variant:{type:String,default:'primary'},type:{type:String,default:'button'}})
</script>
<template><button :type="type" :disabled="busy" :class="variant"><slot /></button></template>
<style scoped>button{padding:11px 16px;border-radius:9px;border:1px solid #cbd5e1;font-weight:600;cursor:pointer}.primary{background:#2563eb;color:white;border-color:#2563eb}.secondary{background:#fff;color:#0f172a}button:disabled{opacity:.6;cursor:wait}</style>
