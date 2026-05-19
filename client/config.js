// Resolves the backend API base URL.
//
// Priority:
//   1. NEXT_PUBLIC_BASE_URL — explicit override (set in .env.local for custom setups).
//   2. localhost            — talk to the local backend so `npm start` works
//                             out of the box without any env configuration.
//   3. otherwise            — the deployed production API.
function resolveBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    // Matches the server's default PORT (see server/index.js).
    return "http://localhost:5000";
  }

  return "https://task-cryptopolio-main-ypy5.onrender.com";
}

const config = {
  get BASE_URL() {
    return resolveBaseUrl();
  },
};

export default config;
