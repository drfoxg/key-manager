<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
    error.value = ''
    loading.value = true

    try {
        await auth.login(email.value, password.value)

        const redirect = route.query.redirect as string
        router.push(redirect || '/dashboard')
    } catch (e: any) {
        error.value = e.response?.data?.message || 'Ошибка входа'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="auth-container">
        <h1>Вход</h1>

        <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" v-model="email" type="email" required placeholder="email@example.com" />
            </div>

            <div class="form-group">
                <label for="password">Пароль</label>
                <input id="password" v-model="password" type="password" required placeholder="••••••••" />
            </div>

            <div v-if="error" class="error">{{ error }}</div>

            <button type="submit" :disabled="loading">
                {{ loading ? 'Вход...' : 'Войти' }}
            </button>
        </form>

        <p class="auth-link">
            Нет аккаунта? <router-link to="/register">Регистрация</router-link>
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