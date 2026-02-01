<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface ApiKey {
    id: number
    name: string
    status: string
    status_label: string
    is_usable: boolean
    expires_at: string | null
    last_used_at: string | null
    created_at: string
}

const apiKeys = ref<ApiKey[]>([])
const loading = ref(true)
const error = ref('')

// Создание ключа
const newKeyName = ref('')
const creating = ref(false)
const createdKey = ref('')

async function fetchApiKeys() {
    try {
        const { data } = await axios.get('/api/v1/api-keys')
        if (data.success) {
            apiKeys.value = data.data
        }
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка загрузки'
    } finally {
        loading.value = false
    }
}

async function createKey() {
    if (!newKeyName.value.trim()) return

    creating.value = true
    createdKey.value = ''

    try {
        const { data } = await axios.post('/api/v1/api-keys', {
            name: newKeyName.value
        })

        if (data.success) {
            createdKey.value = data.data.api_key
            newKeyName.value = ''
            await fetchApiKeys()
        }
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка создания'
    } finally {
        creating.value = false
    }
}

async function deleteKey(id: number) {
    if (!confirm('Удалить ключ?')) return

    try {
        await axios.delete(`/api/v1/api-keys/${id}`)
        await fetchApiKeys()
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка удаления'
    }
}

async function toggleKey(id: number) {
    try {
        await axios.post(`/api/v1/api-keys/${id}/toggle-active`)
        await fetchApiKeys()
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка изменения статуса'
    }
}

onMounted(fetchApiKeys)
</script>

<template>
    <div class="api-keys">
        <h1>API Keys</h1>

        <!-- Создание ключа -->
        <div class="create-form">
            <input v-model="newKeyName" type="text" placeholder="Название ключа" @keyup.enter="createKey" />
            <button @click="createKey" :disabled="creating" class="btn-primary">
                {{ creating ? 'Создание...' : 'Создать' }}
            </button>
        </div>

        <!-- Показ созданного ключа -->
        <div v-if="createdKey" class="created-key">
            <p><strong>Сохраните ключ!</strong> Он больше не будет показан:</p>
            <code>{{ createdKey }}</code>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="loading">Загрузка...</div>

        <!-- Таблица ключей -->
        <table v-else-if="apiKeys.length" class="keys-table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Статус</th>
                    <th>Последнее использование</th>
                    <th>Создан</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="key in apiKeys" :key="key.id">
                    <td>{{ key.name }}</td>
                    <td>
                        <span :class="['status', key.status]">
                            {{ key.status_label }}
                        </span>
                    </td>
                    <td>{{ key.last_used_at || '—' }}</td>
                    <td>{{ key.created_at }}</td>
                    <td class="actions">
                        <button v-if="key.status === 'active' || key.status === 'inactive'" @click="toggleKey(key.id)"
                            class="btn-small">
                            {{ key.status === 'active' ? 'Отключить' : 'Включить' }}
                        </button>
                        <button @click="deleteKey(key.id)" class="btn-small btn-danger">
                            Удалить
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-else class="empty">Нет API ключей</p>
    </div>
</template>

<style scoped>
.api-keys {
    max-width: 1280px;
    margin: 0 auto;
}

.create-form {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.create-form input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #333;
    border-radius: 4px;
    background: #1a1a1a;
    color: #fff;
}

.create-form input::placeholder {
    color: #888;
}

.created-key {
    padding: 1rem;
    background: rgba(100, 108, 255, 0.1);
    border: 1px solid #646cff;
    border-radius: 4px;
    margin-bottom: 1.5rem;
}

.created-key code {
    display: block;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #1a1a1a;
    border-radius: 4px;
    word-break: break-all;
    color: #4caf50;
}

.error {
    color: #ff6b6b;
    padding: 0.5rem;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
    margin-bottom: 1rem;
}

.keys-table {
    width: 100%;
    border-collapse: collapse;
}

.keys-table th,
.keys-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #333;
}

.keys-table th {
    color: #888;
    font-weight: 500;
}

.status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
}

.status.active {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
}

.status.inactive {
    background: rgba(158, 158, 158, 0.2);
    color: #9e9e9e;
}

.status.revoked {
    background: rgba(244, 67, 54, 0.2);
    color: #f44336;
}

.actions {
    display: flex;
    gap: 0.5rem;
}

.btn-small {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

.btn-danger {
    background: #f44336;
    color: #fff;
}

.btn-danger:hover {
    background: #d32f2f;
    border-color: #d32f2f;
}

.empty {
    text-align: center;
    color: #888;
    padding: 2rem;
}
</style>