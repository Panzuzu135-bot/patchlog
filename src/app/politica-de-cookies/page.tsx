import type { Metadata } from "next";
import Link from "next/link";
import CookieResetButton from "@/components/CookieResetButton";

export const metadata: Metadata = {
  title: "Política de Cookies — Patchlog",
  description:
    "Información sobre las cookies que utiliza Patchlog, su finalidad y cómo puedes gestionarlas.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      <div className="text-gray-300 leading-relaxed space-y-3 text-sm">
        {children}
      </div>
    </section>
  );
}

function CookieTable({
  rows,
}: {
  rows: {
    name: string;
    provider: string;
    purpose: string;
    duration: string;
    type: string;
  }[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 mt-4">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/60">
            <th className="px-4 py-3 text-gray-200 font-medium">Identificador</th>
            <th className="px-4 py-3 text-gray-200 font-medium">Proveedor</th>
            <th className="px-4 py-3 text-gray-200 font-medium">Finalidad</th>
            <th className="px-4 py-3 text-gray-200 font-medium">Duración</th>
            <th className="px-4 py-3 text-gray-200 font-medium">Tipo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.name}
              className={
                i % 2 === 0
                  ? "bg-gray-900/40"
                  : "bg-gray-800/20 border-t border-gray-700/50"
              }
            >
              <td className="px-4 py-3 font-mono text-xs text-indigo-300 whitespace-nowrap">
                {row.name}
              </td>
              <td className="px-4 py-3 text-gray-300">{row.provider}</td>
              <td className="px-4 py-3 text-gray-300">{row.purpose}</td>
              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                {row.duration}
              </td>
              <td className="px-4 py-3">
                <span
                  className={[
                    "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                    row.type === "Esencial"
                      ? "bg-indigo-900/60 text-indigo-300"
                      : row.type === "Funcional"
                      ? "bg-emerald-900/60 text-emerald-300"
                      : "bg-amber-900/60 text-amber-300",
                  ].join(" ")}
                >
                  {row.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BrowserRow({
  name,
  href,
}: {
  name: string;
  href: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
      >
        {name}
      </a>
    </li>
  );
}

export default function CookiePolicyPage() {
  const lastUpdate = "28 de abril de 2026";

  const essentialCookies = [
    {
      name: "sb-[ref]-auth-token",
      provider: "Supabase",
      purpose:
        "Mantiene tu sesión iniciada de forma segura. Sin esta cookie no puedes acceder a tu cuenta.",
      duration: "Sesión / 1 año",
      type: "Esencial",
    },
    {
      name: "sb-[ref]-auth-token.0, .1…",
      provider: "Supabase",
      purpose:
        "Fragmentos de la cookie de sesión cuando el token supera el tamaño máximo permitido por cookie (3 KB). Solo aparecen si la sesión necesita dividirse; son equivalentes a la anterior.",
      duration: "Sesión / 1 año",
      type: "Esencial",
    },
    {
      name: "sb-[ref]-auth-token-code-verifier",
      provider: "Supabase",
      purpose:
        "Verifica el flujo seguro de inicio de sesión (PKCE). Se elimina automáticamente al completar el login.",
      duration: "Sesión",
      type: "Esencial",
    },
    {
      name: "patchlog_cookie_consent",
      provider: "Patchlog",
      purpose:
        "Almacena tus preferencias de cookies en el almacenamiento local del navegador (localStorage) para no volver a mostrarte el aviso en cada visita.",
      duration: "Hasta que limpies los datos del sitio",
      type: "Esencial",
    },
  ];

  const functionalCookies = [
    {
      name: "(sin almacenamiento activo)",
      provider: "—",
      purpose:
        "Actualmente no usamos almacenamiento funcional. Si lo hacemos en el futuro, actualizaremos esta tabla.",
      duration: "—",
      type: "Funcional",
    },
  ];

  const analyticsCookies = [
    {
      name: "(sin cookies activas)",
      provider: "—",
      purpose:
        "Actualmente no usamos herramientas de analítica con cookies. Si lo hacemos en el futuro, actualizaremos esta tabla.",
      duration: "—",
      type: "Analítica",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Cabecera */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <span className="mr-1 group-hover:-translate-x-0.5 transition-transform">
              ←
            </span>{" "}
            Volver a Patchlog
          </Link>
          <h1 className="text-3xl font-bold text-white mb-3">
            Política de Cookies
          </h1>
          <p className="text-gray-400 text-sm">
            Última actualización:{" "}
            <time dateTime="2026-04-28">{lastUpdate}</time>
          </p>
        </div>

        {/* Introducción */}
        <Section title="¿Qué son las cookies?">
          <p>
            Las cookies son pequeños archivos de texto que los sitios web
            guardan en tu dispositivo cuando los visitas. Sirven para que el
            sitio recuerde información sobre tu visita: si has iniciado sesión,
            tus preferencias de visualización o cómo navegas por el sitio.
          </p>
          <p>
            Algunas cookies son <strong className="text-white">imprescindibles</strong>{" "}
            para que el sitio funcione correctamente (sin ellas no podrías
            iniciar sesión, por ejemplo). Otras son{" "}
            <strong className="text-white">opcionales</strong> y solo las
            activamos con tu consentimiento.
          </p>
        </Section>

        {/* Responsable */}
        <Section title="¿Quién es responsable de las cookies?">
          <p>
            El responsable del tratamiento de datos asociado al uso de cookies
            en <strong className="text-white">patchlog.dev</strong> es el
            titular del sitio. Para cualquier consulta relacionada con
            privacidad y cookies puedes contactar en{" "}
            <a
              href="mailto:privacidad@patchlog.dev"
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              privacidad@patchlog.dev
            </a>
            .
          </p>
        </Section>

        {/* Categorías */}
        <Section title="¿Qué tipos de cookies utilizamos?">
          <p>
            Clasificamos las cookies en tres categorías según su finalidad:
          </p>

          {/* Esenciales */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-900/60 text-indigo-300">
                Esenciales
              </span>
              <span className="text-gray-400 text-xs">(siempre activas)</span>
            </div>
            <p>
              Sin estas cookies el sitio no puede funcionar. Gestionan tu
              sesión de usuario y almacenan tu decisión sobre cookies. No
              requieren tu consentimiento porque son técnicamente necesarias.
            </p>
            <CookieTable rows={essentialCookies} />
            <p className="text-xs text-gray-500 mt-2">
              <code className="bg-gray-800 px-1 rounded">[ref]</code> representa
              una referencia interna del proveedor de autenticación que varía por
              entorno y no contiene datos personales.
            </p>
          </div>

          {/* Funcionales */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/60 text-emerald-300">
                Funcionales
              </span>
              <span className="text-gray-400 text-xs">(opcionales)</span>
            </div>
            <p>
              Mejoran tu experiencia recordando preferencias personales como el
              tema visual. El sitio funciona sin ellas, pero puede que no
              recuerde tus ajustes entre visitas.
            </p>
            <CookieTable rows={functionalCookies} />
          </div>

          {/* Analíticas */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/60 text-amber-300">
                Analíticas
              </span>
              <span className="text-gray-400 text-xs">(opcionales)</span>
            </div>
            <p>
              Permiten medir el uso del sitio (páginas más visitadas, tiempo de
              sesión) para entender qué funciona bien y qué podemos mejorar.
              Actualmente{" "}
              <strong className="text-white">no usamos ninguna herramienta</strong>{" "}
              de analítica con cookies.
            </p>
            <CookieTable rows={analyticsCookies} />
          </div>
        </Section>

        {/* Cookies de terceros */}
        <Section title="Cookies de terceros">
          <p>
            Utilizamos <strong className="text-white">Supabase</strong> como
            plataforma de autenticación y base de datos. Supabase genera
            cookies propias para gestionar tu sesión de forma segura. Puedes
            consultar su política de privacidad en{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              supabase.com/privacy
            </a>
            .
          </p>
          <p>
            No instalamos cookies de redes sociales, publicidad ni rastreo
            entre sitios.
          </p>
        </Section>

        {/* Gestión */}
        <Section title="¿Cómo gestionar tus preferencias?">
          <p>
            Puedes cambiar tus preferencias de cookies en cualquier momento
            haciendo clic en el botón de abajo, que vuelve a mostrar el panel
            de consentimiento:
          </p>

          {/* Botón que limpia el localStorage y recarga */}
          <div className="mt-4">
            <CookieResetButton />
          </div>

          <p className="mt-4">
            También puedes controlar o eliminar todas las cookies directamente
            desde la configuración de tu navegador:
          </p>
          <ul className="list-none mt-2 space-y-1.5 pl-0">
            <BrowserRow
              name="Google Chrome"
              href="https://support.google.com/chrome/answer/95647"
            />
            <BrowserRow
              name="Mozilla Firefox"
              href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
            />
            <BrowserRow
              name="Safari"
              href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
            />
            <BrowserRow
              name="Microsoft Edge"
              href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
            />
            <BrowserRow
              name="Opera"
              href="https://help.opera.com/en/latest/web-preferences/#cookies"
            />
          </ul>
          <p className="mt-3 text-gray-400">
            Ten en cuenta que si eliminas o bloqueas las cookies esenciales es
            posible que no puedas iniciar sesión ni usar todas las funciones del
            sitio.
          </p>
        </Section>

        {/* Base legal */}
        <Section title="Base legal del tratamiento">
          <p>
            El uso de cookies esenciales se ampara en el{" "}
            <strong className="text-white">interés legítimo</strong> y la
            necesidad técnica del servicio (art. 6.1.b y 6.1.f RGPD).
          </p>
          <p>
            El uso de cookies opcionales (funcionales y analíticas) se basa en
            tu <strong className="text-white">consentimiento explícito</strong>{" "}
            (art. 6.1.a RGPD), que puedes retirar en cualquier momento sin
            perjuicio para ti.
          </p>
        </Section>

        {/* Actualizaciones */}
        <Section title="Actualizaciones de esta política">
          <p>
            Podemos actualizar esta Política de Cookies cuando añadamos nuevas
            funcionalidades o herramientas. Cuando lo hagamos, actualizaremos
            la fecha de «Última actualización» que aparece en la parte superior
            de esta página y, si los cambios son significativos, te lo
            comunicaremos mediante un aviso visible en el sitio.
          </p>
        </Section>

        {/* Contacto */}
        <Section title="Contacto">
          <p>
            Si tienes preguntas sobre cómo usamos las cookies o quieres ejercer
            tus derechos (acceso, rectificación, supresión, portabilidad u
            oposición), escríbenos a{" "}
            <a
              href="mailto:privacidad@patchlog.dev"
              className="text-indigo-400 underline hover:text-indigo-300"
            >
              privacidad@patchlog.dev
            </a>
            . Responderemos en un plazo máximo de 30 días.
          </p>
        </Section>

        {/* Pie de página de la política */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            Esta política aplica únicamente a{" "}
            <strong className="text-gray-400">patchlog.dev</strong> y no a
            sitios externos enlazados desde aquí.
          </p>
        </div>
      </div>
    </main>
  );
}
