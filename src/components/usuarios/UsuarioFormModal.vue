<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { USER_ROLES } from '@/services/usuarios.service'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object,
    default: null,
  },
  branches: {
    type: Array,
    default: () => [],
  },
  saving: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  validationErrors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'ventas',
  branch_id: '',
  is_active: true,
})

const localValidationError = ref(null)

const isEditing = computed(() => Boolean(props.user?.id))
const modalTitle = computed(() =>
  isEditing.value ? `Editar usuario: ${props.user.name}` : 'Registrar nuevo usuario',
)
const willRevokeSessions = computed(
  () => isEditing.value && Boolean(props.user?.is_active) && !form.is_active,
)

function resetFormFromProps() {
  localValidationError.value = null
  if (props.user) {
    form.name = props.user.name || ''
    form.email = props.user.email || ''
    form.password = ''
    form.role = props.user.role || 'ventas'
    form.branch_id = props.user.branch_id ? String(props.user.branch_id) : ''
    form.is_active = Boolean(props.user.is_active)
  } else {
    const firstActiveBranch = props.branches.find((b) => b.is_active) || props.branches[0]
    form.name = ''
    form.email = ''
    form.password = ''
    form.role = 'ventas'
    form.branch_id = firstActiveBranch ? String(firstActiveBranch.id) : ''
    form.is_active = true
  }
}

watch(
  () => [props.open, props.user],
  ([isOpen]) => {
    if (isOpen) {
      resetFormFromProps()
    }
  },
  { immediate: true },
)

watch(
  () => props.branches,
  (list) => {
    if (props.open && !isEditing.value && !form.branch_id && list.length > 0) {
      const firstActive = list.find((b) => b.is_active) || list[0]
      form.branch_id = String(firstActive.id)
    }
  },
)

function fieldError(field) {
  const messages = props.validationErrors?.[field]
  return Array.isArray(messages) && messages.length > 0 ? messages[0] : null
}

function formatBranchLabel(branch) {
  const base = branch.code ? `${branch.name} (${branch.code})` : branch.name
  return branch.is_active === false ? `${base} — Inactiva` : base
}

function handleClose() {
  if (props.saving) return
  emit('close')
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.open && !props.saving) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleSubmit() {
  localValidationError.value = null

  const trimmedName = form.name.trim()
  const trimmedEmail = form.email.trim()

  if (!trimmedName) {
    localValidationError.value = 'El nombre completo del usuario es obligatorio.'
    return
  }
  if (!trimmedEmail) {
    localValidationError.value = 'El correo electrónico es obligatorio.'
    return
  }
  if (!form.branch_id) {
    localValidationError.value = 'Seleccione una sucursal para el usuario.'
    return
  }
  if (!isEditing.value && form.password.length < 8) {
    localValidationError.value = 'La contraseña inicial debe tener al menos 8 caracteres.'
    return
  }
  if (isEditing.value && form.password.length > 0 && form.password.length < 8) {
    localValidationError.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }

  const payload = {
    name: trimmedName,
    email: trimmedEmail,
    role: form.role,
    branch_id: Number(form.branch_id),
    is_active: Boolean(form.is_active),
  }

  if (form.password.length > 0) {
    payload.password = form.password
  }

  emit('submit', payload)
}
</script>

<template>
  <div
    v-if="open"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    :aria-label="modalTitle"
    @click.self="handleClose"
  >
    <div class="modal-card">
      <header class="modal-header">
        <div>
          <h2 class="modal-title">{{ modalTitle }}</h2>
          <p class="modal-subtitle">
            {{
              isEditing
                ? 'Actualice perfil, rol RBAC, sucursal asignada o estado de acceso.'
                : 'Complete los datos para habilitar el acceso al sistema logístico (RF08).'
            }}
          </p>
        </div>
        <button
          type="button"
          class="close-btn"
          aria-label="Cerrar modal"
          :disabled="saving"
          @click="handleClose"
        >
          &times;
        </button>
      </header>

      <form class="modal-body" @submit.prevent="handleSubmit">
        <div v-if="localValidationError || error" class="alert-error" role="alert">
          {{ localValidationError || error }}
        </div>

        <div class="form-grid">
          <div class="field-group field-full">
            <label for="user-name">Nombre completo *</label>
            <input
              id="user-name"
              v-model="form.name"
              type="text"
              maxlength="100"
              required
              placeholder="Ej. María Quispe Mamani"
              :disabled="saving"
            />
            <span v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</span>
          </div>

          <div class="field-group field-full">
            <label for="user-email">Correo electrónico institucional *</label>
            <input
              id="user-email"
              v-model="form.email"
              type="email"
              maxlength="150"
              required
              placeholder="Ej. mquispe@empresa.pe"
              :disabled="saving"
            />
            <span v-if="fieldError('email')" class="field-error">{{ fieldError('email') }}</span>
          </div>

          <div class="field-group">
            <label for="user-role">Rol RBAC *</label>
            <select id="user-role" v-model="form.role" required :disabled="saving">
              <option v-for="roleOpt in USER_ROLES" :key="roleOpt.value" :value="roleOpt.value">
                {{ roleOpt.label }}
              </option>
            </select>
            <span v-if="fieldError('role')" class="field-error">{{ fieldError('role') }}</span>
          </div>

          <div class="field-group">
            <label for="user-branch">Sucursal asignada *</label>
            <select id="user-branch" v-model="form.branch_id" required :disabled="saving">
              <option value="" disabled>-- Seleccione sucursal --</option>
              <option v-for="branch in branches" :key="branch.id" :value="String(branch.id)">
                {{ formatBranchLabel(branch) }}
              </option>
            </select>
            <span v-if="fieldError('branch_id')" class="field-error">
              {{ fieldError('branch_id') }}
            </span>
          </div>

          <div class="field-group field-full">
            <label for="user-password">
              {{ isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña inicial *' }}
            </label>
            <input
              id="user-password"
              v-model="form.password"
              type="password"
              minlength="8"
              maxlength="100"
              :required="!isEditing"
              :placeholder="
                isEditing
                  ? 'Dejar vacío para mantener la contraseña actual'
                  : 'Mínimo 8 caracteres'
              "
              autocomplete="new-password"
              :disabled="saving"
            />
            <small class="field-hint">
              {{
                isEditing
                  ? 'Solo ingrese una contraseña si desea restablecer las credenciales del usuario.'
                  : 'Debe contener mínimo 8 caracteres.'
              }}
            </small>
            <span v-if="fieldError('password')" class="field-error">
              {{ fieldError('password') }}
            </span>
          </div>

          <div class="field-group field-full">
            <label class="checkbox-row">
              <input v-model="form.is_active" type="checkbox" :disabled="saving" />
              <span>Cuenta activa (permite iniciar sesión y operar según su rol)</span>
            </label>
            <p v-if="willRevokeSessions" class="revoke-warning">
              Al guardar como inactivo se revocarán de inmediato todos los tokens de sesión activos
              de este usuario.
            </p>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" :disabled="saving" @click="handleClose">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{
              saving
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear usuario'
            }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(15, 23, 42, 0.55);
}

.modal-card {
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.85rem;
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.22);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.15rem 1.35rem;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.modal-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  padding: 0.1rem 0.35rem;
  border-radius: 0.35rem;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-error {
  padding: 0.75rem 0.9rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 0.5rem;
  font-size: 0.84rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-full {
  grid-column: 1 / -1;
}

.field-group label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.field-group input[type='text'],
.field-group input[type='email'],
.field-group input[type='password'],
.field-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #f8fafc;
}

.field-group input:focus,
.field-group select:focus {
  outline: 2px solid #93c5fd;
  border-color: #2563eb;
  background-color: #ffffff;
}

.field-hint {
  font-size: 0.75rem;
  color: #64748b;
}

.field-error {
  font-size: 0.76rem;
  font-weight: 600;
  color: #b91c1c;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  font-weight: 500 !important;
}

.revoke-warning {
  margin: 0.35rem 0 0;
  padding: 0.6rem 0.75rem;
  font-size: 0.78rem;
  color: #92400e;
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 0.45rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.btn {
  padding: 0.55rem 1.05rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #f8fafc;
  color: #334155;
  border-color: #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f1f5f9;
}

@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
