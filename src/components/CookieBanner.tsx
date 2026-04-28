"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CookieCategory = "essential" | "functional" | "analytics";

interface CookiePreferences {
  essential: true;
  functional: boolean;
  analytics: boolean;
  savedAt: string;
}

const STORAGE_KEY = "patchlog_cookie_consent";

function loadPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePreferences(prefs: Omit<CookiePreferences, "essential" | "savedAt">) {
  const full: CookiePreferences = {
    essential: true,
    functional: prefs.functional,
    analytics: prefs.analytics,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  return full;
}

interface ToggleProps {
  id: CookieCategory;
  checked: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
}

function Toggle({ id, checked, disabled, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-labelledby={`label-${id}`}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2",
        "focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
        disabled
          ? "cursor-not-allowed bg-indigo-500 opacity-60"
          : checked
          ? "bg-indigo-500"
          : "bg-gray-600",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0",
          "transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = loadPreferences();
    if (!existing) setVisible(true);
  }, []);

  if (!visible) return null;

  function acceptAll() {
    savePreferences({ functional: true, analytics: true });
    setVisible(false);
  }

  function rejectAll() {
    savePreferences({ functional: false, analytics: false });
    setVisible(false);
  }

  function saveConfig() {
    savePreferences({ functional, analytics });
    setVisible(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 flex justify-center"
    >
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Banner principal */}
        {!configOpen && (
          <div className="p-5 sm:p-6">
            <p className="text-sm font-semibold text-white mb-1">
              🍪 Usamos cookies
            </p>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">
              Utilizamos cookies propias esenciales para que el sitio funcione, y
              cookies opcionales para mejorar tu experiencia. Puedes aceptarlas
              todas, rechazar las opcionales o elegir cuáles activar.{" "}
              <Link
                href="/politica-de-cookies"
                className="text-indigo-400 underline hover:text-indigo-300 transition-colors"
                target="_blank"
              >
                Más información
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={acceptAll}
                className="flex-1 min-w-[120px] px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Aceptar todas
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 min-w-[120px] px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Rechazar opcionales
              </button>
              <button
                onClick={() => setConfigOpen(true)}
                className="flex-1 min-w-[120px] px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Configurar
              </button>
            </div>
          </div>
        )}

        {/* Panel de configuración */}
        {configOpen && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                Configuración de cookies
              </h2>
              <button
                onClick={() => setConfigOpen(false)}
                aria-label="Volver al aviso principal"
                className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
              >
                ←
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Esenciales */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-700">
                <div>
                  <p
                    id="label-essential"
                    className="text-sm font-medium text-white"
                  >
                    Esenciales
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Necesarias para que el sitio funcione: sesión de usuario,
                    seguridad y tu preferencia de cookies. No pueden desactivarse.
                  </p>
                </div>
                <Toggle
                  id="essential"
                  checked={true}
                  disabled={true}
                  onChange={() => {}}
                />
              </div>

              {/* Funcionales */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-700">
                <div>
                  <p
                    id="label-functional"
                    className="text-sm font-medium text-white"
                  >
                    Funcionales
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Recuerdan preferencias como el tema visual o el idioma para
                    ofrecerte una experiencia más personalizada.
                  </p>
                </div>
                <Toggle
                  id="functional"
                  checked={functional}
                  onChange={setFunctional}
                />
              </div>

              {/* Analíticas */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    id="label-analytics"
                    className="text-sm font-medium text-white"
                  >
                    Analíticas
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    Nos ayudan a entender cómo se usa el sitio (páginas vistas,
                    tiempo de sesión) para mejorarlo. Actualmente no están activas.
                  </p>
                </div>
                <Toggle
                  id="analytics"
                  checked={analytics}
                  onChange={setAnalytics}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveConfig}
                className="flex-1 min-w-[140px] px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Guardar preferencias
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 min-w-[140px] px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                Rechazar opcionales
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Puedes cambiar estas preferencias en cualquier momento desde nuestra{" "}
              <Link
                href="/politica-de-cookies"
                className="text-indigo-400 underline hover:text-indigo-300"
                target="_blank"
              >
                Política de cookies
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
