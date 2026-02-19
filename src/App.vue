<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(true);

onMounted(async () => {
  await auth.init();
  loading.value = false;
});

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div v-if="loading" class="app-loading">
    <div class="spinner"></div>
    <span>Загрузка...</span>
  </div>

  <div class="app">
    <nav v-if="auth.isAuthenticated" class="navbar">
      <div class="nav-links">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/api-keys">API Keys</router-link>
        <router-link v-if="auth.isAdmin" to="/admin/ai-provider-keys" class="admin-link">
          AI Provider Keys
        </router-link>
      </div>
      <div class="nav-user">
        <span class="user-name">
          {{ auth.user?.name }}
          <span v-if="auth.isAdmin" class="admin-badge">Admin</span>
        </span>
        <button @click="logout">Выйти</button>
      </div>
    </nav>

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

.admin-link {
  color: #ff9800 !important;
}

.admin-link.router-link-active {
  color: #ffc107 !important;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-badge {
  background: #ff9800;
  color: #000;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}
</style>