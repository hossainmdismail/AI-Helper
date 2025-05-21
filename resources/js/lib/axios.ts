import axios from "axios";

// Setup CSRF for Laravel
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
if (token) {
  axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
}

export default axios;
