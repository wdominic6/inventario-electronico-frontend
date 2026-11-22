<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EntityManager from '@/components/ui/EntityManager.vue'
import { catalogos } from '@/components/catalogo/config'
const route=useRoute()
const config=computed(()=>catalogos[route.meta.resource]||catalogos.products)
</script>
<template><EntityManager :key="route.meta.resource" :kind="route.meta.resource" :title="config.title" :fields="config.fields" :columns="config.columns" :admin-only="config.adminOnly||false" /></template>
