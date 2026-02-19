import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
}

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(localStorage.getItem("token"));
    const user = ref<User | null>(null);

    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.is_admin === true);

    async function login(email: string, password: string) {
        const { data } = await axios.post("/api/v1/login", { email, password });

        token.value = data.data.token;
        user.value = data.data.user;
        localStorage.setItem("token", data.data.token);
        axios.defaults.headers.common["Authorization"] =
            `Bearer ${data.data.token}`;
    }

    async function register(
        name: string,
        email: string,
        password: string,
        passwordConfirmation: string,
    ) {
        const { data } = await axios.post("/api/v1/register", {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });

        token.value = data.data.token;
        user.value = data.data.user;
        localStorage.setItem("token", data.data.token);
        axios.defaults.headers.common["Authorization"] =
            `Bearer ${data.data.token}`;
    }

    function logout() {
        axios.post("/api/v1/logout").catch(() => {});

        token.value = null;
        user.value = null;
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
    }

    async function init() {
        if (!token.value) return;

        axios.defaults.headers.common["Authorization"] =
            `Bearer ${token.value}`;

        try {
            const { data } = await axios.get("/api/v1/user");
            user.value = data.data; // <-- исправлено
        } catch {
            logout();
        }
    }

    return {
        token,
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        init,
    };
});
