import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
    // Публичные (только для гостей)
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/LoginView.vue"),
        meta: { guest: true },
    },
    {
        path: "/register",
        name: "register",
        component: () => import("@/views/RegisterView.vue"),
        meta: { guest: true },
    },

    // Защищённые (для авторизованных)
    {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/api-keys",
        name: "api-keys",
        component: () => import("@/views/ApiKeysView.vue"),
        meta: { requiresAuth: true },
    },

    // Админские маршруты
    {
        path: "/admin/ai-provider-keys",
        name: "ai-provider-keys",
        component: () => import("@/views/admin/AiProviderKeysView.vue"),
        meta: { requiresAuth: true, requiresAdmin: true },
    },

    // Редиректы
    { path: "/", redirect: "/dashboard" },
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const auth = useAuthStore();

    // Защищённый маршрут + не авторизован → login
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: "login", query: { redirect: to.fullPath } };
    }

    // Гостевой маршрут + уже авторизован → dashboard
    if (to.meta.guest && auth.isAuthenticated) {
        return { name: "dashboard" };
    }

    // Админский маршрут + не админ → dashboard
    if (to.meta.requiresAdmin && !auth.isAdmin) {
        return { name: "dashboard" };
    }
});

export default router;
