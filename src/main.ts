import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import App from "./App.vue";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import "./style.css";

console.log("ENV:", import.meta.env.VITE_API_URL);

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

console.log("AXIOS BASE URL:", axios.defaults.baseURL);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const auth = useAuthStore();

auth.init().finally(() => {
    app.use(router);
    app.mount("#app");
});
