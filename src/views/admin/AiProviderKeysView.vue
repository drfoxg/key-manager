<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

interface User {
    id: number
    name: string
    email: string
}

interface AiProviderKey {
    id: number
    user_id: number
    user?: User
    provider: string
    provider_label: string
    label: string | null
    masked_key: string
    priority: number
    weight: number
    is_active: boolean
    is_available: boolean
    status: string
    daily_limit: number | null
    rate_limit_per_min: number | null
    requests_today: number
    tokens_today: number
    errors_count: number
    last_used_at: string | null
    cooldown_until: string | null
    expires_at: string | null
    last_error_at: string | null
    last_error_code: string | null
    meta: Record<string, any> | null
    created_at: string
    updated_at: string
}

// Состояние списка
const keys = ref<AiProviderKey[]>([])
const users = ref<User[]>([])
const loading = ref(true)
const error = ref('')

// Фильтры
const filterProvider = ref('')
const filterUserId = ref('')

// Модальное окно
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingKey = ref<AiProviderKey | null>(null)
const saving = ref(false)

// Форма
const form = ref({
    user_id: '',
    provider: 'gigachat',
    api_key: '',
    label: '',
    priority: 100,
    weight: 1,
    is_active: true,
    daily_limit: '',
    rate_limit_per_min: '',
    expires_at: '',
    meta_scope: 'GIGACHAT_API_PERS'
})

const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'gigachat', label: 'GigaChat' }
]

const scopes = [
    { value: 'GIGACHAT_API_PERS', label: 'Физ. лица (PERS)' },
    { value: 'GIGACHAT_API_B2B', label: 'Юр. лица B2B' },
    { value: 'GIGACHAT_API_CORP', label: 'Юр. лица CORP (pay-as-you-go)' }
]

const filteredKeys = computed(() => {
    return keys.value.filter(key => {
        if (filterProvider.value && key.provider !== filterProvider.value) return false
        if (filterUserId.value && key.user_id !== parseInt(filterUserId.value)) return false
        return true
    })
})

async function fetchKeys() {
    loading.value = true
    error.value = ''

    try {
        const { data } = await axios.get('/api/v1/ai-provider-keys')
        if (data.success) {
            keys.value = data.data

            // Сохраняем список пользователей из meta
            if (data.meta?.filters?.users) {
                users.value = data.meta.filters.users
            }
        }
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка загрузки'
    } finally {
        loading.value = false
    }
}

function openCreateModal() {
    modalMode.value = 'create'
    editingKey.value = null
    form.value = {
        user_id: users.value.length === 1 ? String(users.value[0].id) : '',
        provider: 'gigachat',
        api_key: '',
        label: '',
        priority: 100,
        weight: 1,
        is_active: true,
        daily_limit: '',
        rate_limit_per_min: '',
        expires_at: '',
        meta_scope: 'GIGACHAT_API_PERS'
    }
    showModal.value = true
}

function openEditModal(key: AiProviderKey) {
    modalMode.value = 'edit'
    editingKey.value = key
    form.value = {
        user_id: String(key.user_id),
        provider: key.provider,
        api_key: '',
        label: key.label || '',
        priority: key.priority,
        weight: key.weight,
        is_active: key.is_active,
        daily_limit: key.daily_limit ? String(key.daily_limit) : '',
        rate_limit_per_min: key.rate_limit_per_min ? String(key.rate_limit_per_min) : '',
        expires_at: key.expires_at ? key.expires_at.slice(0, 16) : '',
        meta_scope: key.meta?.scope || 'GIGACHAT_API_PERS'
    }
    showModal.value = true
}

async function saveKey() {
    saving.value = true
    error.value = ''

    try {
        const payload: Record<string, any> = {
            provider: form.value.provider,
            label: form.value.label || null,
            priority: form.value.priority,
            weight: form.value.weight,
            is_active: form.value.is_active,
            daily_limit: form.value.daily_limit ? parseInt(form.value.daily_limit) : null,
            rate_limit_per_min: form.value.rate_limit_per_min ? parseInt(form.value.rate_limit_per_min) : null,
            expires_at: form.value.expires_at || null
        }

        // Для GigaChat добавляем scope в meta
        if (form.value.provider === 'gigachat') {
            payload.meta = { scope: form.value.meta_scope }
        }

        if (modalMode.value === 'create') {
            payload.user_id = parseInt(form.value.user_id)
            payload.api_key = form.value.api_key
            await axios.post('/api/v1/ai-provider-keys', payload)
        } else if (editingKey.value) {
            if (form.value.api_key) {
                payload.api_key = form.value.api_key
            }
            await axios.patch(`/api/v1/ai-provider-keys/${editingKey.value.id}`, payload)
        }

        showModal.value = false
        await fetchKeys()
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка сохранения'
    } finally {
        saving.value = false
    }
}

async function toggleActive(key: AiProviderKey) {
    try {
        await axios.post(`/api/v1/ai-provider-keys/${key.id}/toggle-active`)
        await fetchKeys()
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка'
    }
}

async function verifyKey(key: AiProviderKey) {
    try {
        const { data } = await axios.post(`/api/v1/ai-provider-keys/${key.id}/verify`)
        alert(data.message || 'Ключ валиден')
        await fetchKeys()
    } catch (e: any) {
        alert(e.response?.data?.message || 'Ошибка верификации')
    }
}

async function resetCounters(key: AiProviderKey) {
    if (!confirm('Сбросить счётчики?')) return

    try {
        await axios.post(`/api/v1/ai-provider-keys/${key.id}/reset-counters`)
        await fetchKeys()
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка'
    }
}

async function deleteKey(key: AiProviderKey) {
    if (!confirm(`Удалить ключ "${key.label || key.masked_key}"?`)) return

    try {
        await axios.delete(`/api/v1/ai-provider-keys/${key.id}`)
        await fetchKeys()
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка удаления'
    }
}

// Хелпер для отображения пользователя
function getUserLabel(user: User): string {
    return `${user.name} (${user.email})`
}

onMounted(fetchKeys)
</script>

<template>
    <div class="ai-provider-keys">
        <div class="header">
            <h1>AI Provider Keys</h1>
            <button @click="openCreateModal" class="btn-primary">+ Добавить ключ</button>
        </div>

        <!-- Фильтры -->
        <div class="filters">
            <select v-model="filterProvider">
                <option value="">Все провайдеры</option>
                <option v-for="p in providers" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>

            <select v-model="filterUserId">
                <option value="">Все пользователи</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ getUserLabel(user) }}
                </option>
            </select>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="loading">Загрузка...</div>

        <!-- Таблица -->
        <div v-else-if="filteredKeys.length" class="table-wrapper">
            <table class="keys-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Пользователь</th>
                        <th>Провайдер</th>
                        <th>Метка</th>
                        <th>Ключ</th>
                        <th>Статус</th>
                        <th>Приоритет</th>
                        <th>Лимит/день</th>
                        <th>Запросов</th>
                        <th>Ошибок</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="key in filteredKeys" :key="key.id" :class="{ inactive: !key.is_active }">
                        <td>{{ key.id }}</td>
                        <td>
                            <span class="user-info">
                                {{ key.user?.name || `#${key.user_id}` }}
                                <small>{{ key.user?.email }}</small>
                            </span>
                        </td>
                        <td>
                            <span :class="['provider-badge', key.provider]">
                                {{ key.provider_label }}
                            </span>
                        </td>
                        <td>{{ key.label || '—' }}</td>
                        <td><code class="provider-code">{{ key.masked_key }}</code></td>
                        <td>
                            <span :class="['status', key.is_available ? 'available' : 'unavailable']">
                                {{ key.status }}
                            </span>
                        </td>
                        <td>{{ key.priority }}</td>
                        <td>{{ key.daily_limit || '∞' }}</td>
                        <td>{{ key.requests_today }}</td>
                        <td>{{ key.errors_count }}</td>
                        <td class="actions">
                            <button @click="openEditModal(key)" class="btn-small" title="Редактировать">✏️</button>
                            <button @click="toggleActive(key)" class="btn-small"
                                :title="key.is_active ? 'Отключить' : 'Включить'">
                                {{ key.is_active ? '⏸️' : '▶️' }}
                            </button>
                            <button @click="verifyKey(key)" class="btn-small" title="Проверить">🔍</button>
                            <button @click="resetCounters(key)" class="btn-small" title="Сбросить счётчики">🔄</button>
                            <button @click="deleteKey(key)" class="btn-small btn-danger" title="Удалить">🗑️</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <p v-else class="empty">Нет ключей</p>

        <!-- Модальное окно -->
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
            <div class="modal">
                <h2>{{ modalMode === 'create' ? 'Добавить ключ' : 'Редактировать ключ' }}</h2>

                <form @submit.prevent="saveKey" class="form">
                    <div class="form-group" v-if="modalMode === 'create'">
                        <label>Пользователь *</label>
                        <select v-model="form.user_id" required>
                            <option value="" disabled>Выберите пользователя</option>
                            <option v-for="user in users" :key="user.id" :value="user.id">
                                {{ getUserLabel(user) }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group" v-else>
                        <label>Пользователь</label>
                        <input type="text"
                            :value="users.find(u => u.id === parseInt(form.user_id))?.name || `User #${form.user_id}`"
                            disabled />
                    </div>

                    <div class="form-group">
                        <label>Провайдер *</label>
                        <select v-model="form.provider" :disabled="modalMode === 'edit'">
                            <option v-for="p in providers" :key="p.value" :value="p.value">{{ p.label }}</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>API Key {{ modalMode === 'create' ? '*' : '(оставьте пустым, если не меняется)'
                            }}</label>
                        <input v-model="form.api_key" type="password" :required="modalMode === 'create'" />
                    </div>

                    <div class="form-group" v-if="form.provider === 'gigachat'">
                        <label>Scope (для GigaChat)</label>
                        <select v-model="form.meta_scope">
                            <option v-for="s in scopes" :key="s.value" :value="s.value">{{ s.label }}</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Метка</label>
                        <input v-model="form.label" type="text" placeholder="Опционально" />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Приоритет</label>
                            <input v-model.number="form.priority" type="number" min="1" max="1000" />
                        </div>
                        <div class="form-group">
                            <label>Вес</label>
                            <input v-model.number="form.weight" type="number" min="1" max="100" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Лимит/день</label>
                            <input v-model="form.daily_limit" type="number" min="1" placeholder="Без лимита" />
                        </div>
                        <div class="form-group">
                            <label>Лимит/мин</label>
                            <input v-model="form.rate_limit_per_min" type="number" min="1" placeholder="Без лимита" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Истекает</label>
                        <input v-model="form.expires_at" type="datetime-local" />
                    </div>

                    <div class="form-group checkbox">
                        <label>
                            <input v-model="form.is_active" type="checkbox" />
                            Активен
                        </label>
                    </div>

                    <div v-if="error" class="error">{{ error }}</div>

                    <div class="form-actions">
                        <button type="button" @click="showModal = false" class="btn-secondary">Отмена</button>
                        <button type="submit" :disabled="saving" class="btn-primary">
                            {{ saving ? 'Сохранение...' : 'Сохранить' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ai-provider-keys {
    max-width: 1400px;
    margin: 0 auto;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.filters select,
.filters input {
    padding: 0.5rem;
    border: 1px solid #333;
    border-radius: 4px;
    background: #1a1a1a;
    color: #fff;
    min-width: 200px;
}

.table-wrapper {
    overflow-x: auto;
}

.keys-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.keys-table th,
.keys-table td {
    padding: 0.6rem;
    text-align: left;
    border-bottom: 1px solid #333;
    vertical-align: middle;
    height: 48px;
}

.keys-table th {
    color: #888;
    font-weight: 500;
    white-space: nowrap;
}

.keys-table tr.inactive {
    opacity: 0.5;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-info small {
    color: #888;
    font-size: 0.8rem;
}

.provider-code {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.85rem;
    background: none;
    padding: 0;
}

.provider-badge {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
}

.provider-badge.gigachat {
    background: #4caf50;
    color: #fff;
}

.provider-badge.openai {
    background: #10a37f;
    color: #fff;
}

.provider-badge.anthropic {
    background: #d97706;
    color: #fff;
}

.status {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.status.available {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
}

.status.unavailable {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
}

code {
    background: #2a2a2a;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.85rem;
}

.actions {
    display: flex;
    gap: 0.3rem;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
}

.btn-small {
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
    min-width: auto;
    line-height: 1;
}

.btn-danger {
    background: #f44336;
    color: #fff;
}

.btn-danger:hover {
    background: #d32f2f;
}

.error {
    color: #ff6b6b;
    padding: 0.5rem;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
    margin-bottom: 1rem;
}

.empty {
    text-align: center;
    color: #888;
    padding: 2rem;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal h2 {
    margin: 0 0 1rem 0;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.form-group label {
    color: #b0b0b0;
    font-size: 0.9rem;
}

.form-group input,
.form-group select {
    padding: 0.6rem;
    border: 1px solid #333;
    border-radius: 4px;
    background: #242424;
    color: #fff;
}

.form-group input:disabled,
.form-group select:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.form-group.checkbox {
    flex-direction: row;
    align-items: center;
}

.form-group.checkbox label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #fff;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.form-row .form-group {
    flex: 1;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
}
</style>