<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
    error.value = ''
    loading.value = true

    try {
        await auth.register(name.value, email.value, password.value, passwordConfirmation.value)
        router.push('/dashboard')
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка регистрации'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth-container">
        <h1>Регистрация</h1>

        <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
                <label for="name">Имя</label>
                <input id="name" v-model="name" type="text" required placeholder="Ваше имя" />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" v-model="email" type="email" required placeholder="email@example.com" />
            </div>

            <div class="form-group">
                <label for="password">Пароль</label>
                <input id="password" v-model="password" type="password" required placeholder="••••••••" />
            </div>

            <div class="form-group">
                <label for="password-confirm">Подтвердите пароль</label>
                <input id="password-confirm" v-model="passwordConfirmation" type="password" required
                    placeholder="••••••••" />
            </div>

            <div v-if="error" class="error">{{ error }}</div>

            <button type="submit" :disabled="loading">
                {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>
        </form>

        <p class="auth-link">
            Есть аккаунт? <router-link to="/login">Войти</router-link>
        </p>
    </div>
</template>

<style scoped>
.auth-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group input {
    padding: 0.75rem;
    border: 1px solid #333;
    border-radius: 4px;
    background: #1a1a1a;
    color: #fff;
}

.error {
    color: #ff6b6b;
    padding: 0.5rem;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 4px;
}

button {
    padding: 0.75rem;
    margin-top: 0.5rem;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.auth-link {
    text-align: center;
    margin-top: 1rem;
}
</style>