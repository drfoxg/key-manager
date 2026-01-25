<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
    <div class="dashboard">
        <h1>Dashboard</h1>
        <p>Добро пожаловать, {{ auth.user?.name }}!</p>

        <div class="cards">
            <router-link to="/api-keys" class="card">
                <h3>API Keys</h3>
                <p>Управление ключами</p>
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.dashboard {
    max-width: 800px;
    margin: 0 auto;
}

.cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
}

.card {
    padding: 1.5rem;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.2s;
}

.card:hover {
    border-color: #646cff;
}

.card h3 {
    margin: 0 0 0.5rem 0;
    color: #fff;
}

.card p {
    margin: 0;
    color: #b0b0b0;
}
</style>