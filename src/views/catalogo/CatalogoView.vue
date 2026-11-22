
<script setup>
import { ref, computed } from 'vue'

const busqueda = ref('')

const productos = ref([])

const productosFiltrados = computed(() =>
  productos.value.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
)
</script>

<template>
  <section class="pagina">
    <div class="encabezado">
      <div>
        <h2>Catálogo técnico</h2>
        <p>
          Administración de componentes y productos electrónicos.
        </p>
      </div>
      <button class="boton" type="button" disabled>
        + Nuevo producto
      </button>
    </div>

    <div class="panel">
      <div class="herramientas">
        <input
          v-model="busqueda"
          type="search"
          placeholder="Buscar producto..."
          aria-label="Buscar producto"
        />
      </div>

      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="producto in productosFiltrados"
              :key="producto.id"
            >
              <td>{{ producto.codigo }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.categoria }}</td>
              <td>{{ producto.estado }}</td>
            </tr>
            <tr v-if="productosFiltrados.length === 0">
              <td colspan="4" class="vacio">
                No hay productos para mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pagina {
  width: 100%;
}

.encabezado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

h2 {
  color: #172b46;
  margin: 0 0 8px;
}

p {
  color: #64748b;
  margin: 0;
}

.boton {
  background: #2563eb;
  color: white;
  padding: 12px 18px;
  border: 0;
  border-radius: 8px;
}

.boton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.herramientas {
  padding: 20px;
}

input {
  width: 100%;
  max-width: 350px;
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.tabla-contenedor {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

th {
  background: #f8fafc;
  color: #475569;
}

.vacio {
  text-align: center;
  color: #94a3b8;
  padding: 35px;
}

@media (max-width: 600px) {
  .encabezado {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
