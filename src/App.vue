<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app">
    <nav v-if="auth.isAuthenticated" class="navbar">
      <div class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/api-keys">API Keys</router-link>
      </div>
      <div class="nav-user">
        <span>{{ auth.user?.name }}</span>
        <button @click="logout">Выйти</button>
      </div>
    </nav>

    <!-- Сюда рендерятся страницы из views/ -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1a1a1a;
  border-bottom: 1px solid #333;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
}

.nav-links a.router-link-active {
  color: #646cff;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-user span {
  color: #e0e0e0;
}

.content {
  padding: 2rem;
}
</style>