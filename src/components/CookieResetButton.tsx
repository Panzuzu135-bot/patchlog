"use client";

const STORAGE_KEY = "patchlog_cookie_consent";

export default function CookieResetButton() {
  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <button
      onClick={handleReset}
      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
    >
      Gestionar mis preferencias de cookies
    </button>
  );
}
