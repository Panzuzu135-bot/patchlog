/* global React */
const { useState, useEffect, useMemo } = React;

// ============ Mock data ============
const projects = [
  { id: "p1", name: "Nova Engine", slug: "nova-engine", desc: "Motor de videojuegos indie minimalista. Pipelines WebGPU, ECS ligero.", color: "#7fe3a1", initials: "NE", entries: 12, followers: 284 },
  { id: "p2", name: "Relay", slug: "relay", desc: "Cliente HTTP colaborativo. Colecciones compartidas en tiempo real.", color: "#89b8ff", initials: "RL", entries: 8, followers: 127 },
  { id: "p3", name: "Notch DB", slug: "notch-db", desc: "Base de datos documental embebida. Sync offline-first.", color: "#f3a66b", initials: "ND", entries: 23, followers: 512 },
  { id: "p4", name: "Quill", slug: "quill", desc: "Editor markdown con plugins WASM.", color: "#c08bff", initials: "QL", entries: 5, followers: 64 },
];

const allEntries = [
  { id: "e1", projectId: "p1", type: "feature", version: "v2.1.0", title: "Sistema de partidas multijugador", published: true, publishedAt: "2026-04-22", content: "Nueva capa de red peer-to-peer con WebRTC. Soporta hasta 8 jugadores por sala.\n\n- Matchmaking regional\n- Reconexión automática\n- Snapshots de estado cada 50ms" },
  { id: "e2", projectId: "p1", type: "improvement", version: "v2.0.3", title: "Reducido tiempo de compilación en 40%", published: true, publishedAt: "2026-04-15", content: "Refactor del sistema de build. Caché incremental de shaders.\n\nEl build limpio en un M1 pasó de 22s a 13s." },
  { id: "e3", projectId: "p1", type: "fix", version: "v2.0.2", title: "Crash al cargar mapas > 256MB", published: true, publishedAt: "2026-04-08", content: "Fix en el asset streamer. El buffer de carga crecía sin límite." },
  { id: "e4", projectId: "p1", type: "breaking", version: "v2.0.0", title: "Nueva API de materiales", published: true, publishedAt: "2026-03-28", content: "Rediseño completo del sistema de materiales. Ver guía de migración.\n\n```\nmaterial.setColor(r,g,b) → material.color = new Color(r,g,b)\n```" },
  { id: "e5", projectId: "p2", type: "feature", version: "v0.8.0", title: "Colecciones colaborativas", published: true, publishedAt: "2026-04-20" },
  { id: "e6", projectId: "p2", type: "security", version: "v0.7.5", title: "Rotación automática de tokens OAuth", published: true, publishedAt: "2026-04-12" },
  { id: "e7", projectId: "p3", type: "feature", version: "v1.4.0", title: "Sync offline con CRDTs", published: true, publishedAt: "2026-04-21" },
  { id: "e8", projectId: "p3", type: "improvement", version: "v1.3.7", title: "Índices full-text más rápidos", published: true, publishedAt: "2026-04-14" },
  { id: "e9", projectId: "p1", type: "fix", version: "v2.1.1", title: "Fix en UI del inventario", published: false, publishedAt: null },
];

const TYPE_META = {
  feature:     { label: "feature",     desc: "Nueva funcionalidad" },
  fix:         { label: "fix",         desc: "Corrección de bug" },
  improvement: { label: "improvement", desc: "Mejora o refactor" },
  breaking:    { label: "breaking",    desc: "Cambio incompatible" },
  security:    { label: "security",    desc: "Parche de seguridad" },
};

// ============ Utils ============
function relTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diff = (new Date("2026-04-24") - d) / 86400000;
  if (diff < 1) return "hoy";
  if (diff < 2) return "ayer";
  if (diff < 7) return `hace ${Math.round(diff)}d`;
  if (diff < 30) return `hace ${Math.round(diff/7)}sem`;
  return `hace ${Math.round(diff/30)}mes`;
}

function TypeBadge({ type, style }) {
  return <span className={`type-badge ${style} type-${type}`}>{TYPE_META[type].label}</span>;
}

// ============ Top bar ============
function TopBar({ view, setView, isAuthed, onAuth }) {
  return (
    <div className="pl-topbar">
      <div className="pl-logo">
        <span className="pl-logo-mark"></span>
        <span className="pl-logo-text">patchlog<span className="muted">/v1</span></span>
      </div>
      {isAuthed && (
        <nav className="pl-topbar-nav">
          <a className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>Proyectos</a>
          <a className={view === "project" ? "active" : ""} onClick={() => setView("project")}>nova-engine</a>
          <a className={view === "feed" ? "active" : ""} onClick={() => setView("feed")}>Feed</a>
          <a className={view === "public" ? "active" : ""} onClick={() => setView("public")}>Página pública</a>
          <a className={view === "editor" ? "active" : ""} onClick={() => setView("editor")}>Nueva entrada</a>
        </nav>
      )}
      <div className="pl-topbar-spacer" />
      {!isAuthed ? (
        <>
          <a className="btn btn-ghost btn-sm" onClick={() => setView("landing")}>Inicio</a>
          <a className="btn btn-secondary btn-sm" onClick={onAuth}>Iniciar sesión</a>
        </>
      ) : (
        <>
          <a className="btn btn-ghost btn-sm" onClick={() => setView("landing")}>Ver landing</a>
          <a className="btn btn-ghost btn-sm" onClick={onAuth}>Salir</a>
        </>
      )}
    </div>
  );
}

// ============ Landing ============
function Landing({ badgeStyle, setView, onAuth }) {
  const sample = allEntries.filter(e => e.projectId === "p1" && e.published).slice(0, 4);
  return (
    <div className="pl-landing">
      <section className="pl-hero">
        <div className="pl-hero-grid">
          <div>
            <span className="pl-hero-eyebrow">
              <span className="dot"></span>
              Changelogs para desarrolladores
            </span>
            <h1>
              Publica tu progreso.<br />
              Que nadie se pierda una <em>release</em>.
            </h1>
            <p>
              Patchlog es el lugar donde los desarrolladores publican changelogs versionados y sus seguidores los reciben en un feed personal. Sin widgets. Sin ruido.
            </p>
            <div className="pl-hero-actions">
              <button className="btn btn-primary" onClick={onAuth}>
                Empieza gratis
                <span style={{fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.7, marginLeft: 4}}>↗</span>
              </button>
              <button className="btn btn-ghost" onClick={() => setView("public")}>Ver ejemplo →</button>
            </div>
            <div className="pl-hero-meta">
              <span><strong>1.2k</strong> proyectos</span>
              <span><strong>9.4k</strong> entradas</span>
              <span><strong>free</strong> para empezar</span>
            </div>
          </div>

          <div className="pl-hero-preview">
            <div className="pl-preview-head">
              <div className="dots"><i/><i/><i/></div>
              <span className="url">patchlog.dev/nova-engine</span>
            </div>
            <div className="pl-preview-body">
              <div className="pl-preview-project">
                <div className="sq">NE</div>
                <div>
                  <h4>Nova Engine</h4>
                  <p>Motor de videojuegos indie</p>
                </div>
                <span className="followers">284 siguen</span>
              </div>
              <ul className="pl-preview-entries">
                {sample.map((e, i) => (
                  <li key={e.id}>
                    <span className="tick">●</span>
                    <TypeBadge type={e.type} style={badgeStyle} />
                    <span className="version">{e.version}</span>
                    <span className="title">{e.title}</span>
                    <span className="time">{relTime(e.publishedAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="pl-section">
        <p className="pl-section-label">// cómo funciona</p>
        <h2>Tres pasos. Cero fricción.</h2>
        <div className="pl-steps">
          {[
            { num: "01", title: "Crea un proyecto", desc: "Registra tu proyecto y obtén una página pública en segundos. Slug, color, descripción.", glyph: "$ patchlog new nova-engine" },
            { num: "02", title: "Publica tu changelog", desc: "Escribe entradas markdown con versión y tipo — feature, fix, improvement, breaking, security.", glyph: "✓ v2.1.0 published" },
            { num: "03", title: "Tus seguidores al día", desc: "Cada publicación aparece en el feed personal de quien te sigue. Sin emails. Sin apps.", glyph: "→ 284 followers notified" },
          ].map(s => (
            <div key={s.num} className="pl-step">
              <div className="pl-step-glyph">{s.glyph}</div>
              <div className="pl-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="pl-features" style={{marginTop: 64}}>
          {[
            { i: "md", t: "Markdown nativo", d: "Escribe como en GitHub. Code blocks, listas, enlaces." },
            { i: "v", t: "Versionado estricto", d: "Cada entrada lleva versión. Historial ordenado por defecto." },
            { i: "rss", t: "RSS y JSON feed", d: "Integra patchlog en cualquier reader. Webhooks opcionales." },
            { i: "◎", t: "Privados o públicos", d: "Controla quién ve cada changelog desde los ajustes del proyecto." },
          ].map(f => (
            <div key={f.t} className="pl-feature">
              <div className="pl-feature-icon">{f.i}</div>
              <h4>{f.t}</h4>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pl-cta">
        <div className="pl-cta-card">
          <h2>Empieza a publicar el progreso de tu proyecto.</h2>
          <button className="btn btn-primary" onClick={onAuth}>
            Crear cuenta gratis
            <span style={{fontFamily: "var(--font-mono)", fontSize: 11, opacity: 0.7}}>↗</span>
          </button>
        </div>
      </section>

      <footer className="pl-footer">
        <span>© 2026 patchlog</span>
        <span>v1.0.0 · build 2026.04.24</span>
      </footer>
    </div>
  );
}

// ============ Login ============
function Login({ onAuth }) {
  return (
    <div className="pl-login">
      <aside className="pl-login-aside">
        <div>
          <div className="pl-logo" style={{marginBottom: 32}}>
            <span className="pl-logo-mark"></span>
            <span className="pl-logo-text">patchlog</span>
          </div>
          <p className="quote">
            "Llevamos 3 años publicando el progreso de <em>Nova Engine</em>. Patchlog nos ahorró montar nuestro propio blog."
          </p>
          <p className="attr">— kira, nova engine team</p>
        </div>
        <div className="mini-log">
          <div><span className="c"># últimas publicaciones</span></div>
          <div><span className="g">✓</span> nova-engine <span className="c">v2.1.0</span> shipped</div>
          <div><span className="g">✓</span> relay <span className="c">v0.8.0</span> shipped</div>
          <div><span className="g">✓</span> notch-db <span className="c">v1.4.0</span> shipped</div>
          <div><span className="c">...</span></div>
        </div>
      </aside>
      <main className="pl-login-main">
        <div className="pl-login-card">
          <h2>Bienvenido de vuelta</h2>
          <p>Autentícate con GitHub para gestionar tus proyectos y seguir a otros desarrolladores.</p>
          <button className="pl-gh-button" onClick={onAuth}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            Continuar con GitHub
          </button>
          <div className="pl-login-divider">sin passwords. sin emails.</div>
          <p style={{fontSize: 12, color: "var(--fg-muted)", textAlign: "center", lineHeight: 1.5}}>
            Sólo usamos tu perfil público de GitHub para crear tu cuenta.
          </p>
          <p className="pl-login-foot">términos · privacidad · v1.0.0</p>
        </div>
      </main>
    </div>
  );
}

// ============ Sidebar ============
function Sidebar({ view, setView, activeProjectId, setActiveProjectId }) {
  return (
    <aside className="pl-sidebar">
      <a className={view === "feed" ? "active" : ""} onClick={() => setView("feed")}>
        <span className="dot" style={{background: view === "feed" ? "var(--accent)" : ""}}></span>
        Feed
        <span className="count">12</span>
      </a>
      <a className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>
        <span className="dot"></span>
        Proyectos
        <span className="count">{projects.length}</span>
      </a>

      <div className="sb-section">
        <span>Mis proyectos</span>
        <span className="badge">⌘K</span>
      </div>
      {projects.map(p => (
        <a key={p.id}
           className={view === "project" && activeProjectId === p.id ? "active" : ""}
           onClick={() => { setActiveProjectId(p.id); setView("project"); }}>
          <span className="dot" style={{background: p.color}}></span>
          {p.name}
          <span className="count">{p.entries}</span>
        </a>
      ))}
      <a onClick={() => setView("new-project")} style={{color: "var(--fg-faint)"}}>
        <span className="dot"></span>
        + Nuevo proyecto
      </a>

      <div className="sb-foot">
        <a onClick={() => setView("settings")}>
          <span className="dot"></span>
          Ajustes
        </a>
        <div className="user-row">
          <div className="avatar">K</div>
          <span className="name">kira.dev</span>
        </div>
      </div>
    </aside>
  );
}

// ============ Dashboard ============
function Dashboard({ setView, setActiveProjectId }) {
  return (
    <div className="pl-page">
      <div className="pl-page-head">
        <div>
          <div className="crumbs">~ / proyectos</div>
          <h1>Mis proyectos</h1>
          <p>4 proyectos · 48 entradas publicadas este mes</p>
        </div>
        <div className="pl-page-actions">
          <button className="btn btn-secondary btn-sm">Importar desde GitHub</button>
          <button className="btn btn-primary btn-sm" onClick={() => setView("new-project")}>
            + Nuevo proyecto
          </button>
        </div>
      </div>

      <div className="pl-projects">
        {projects.map(p => (
          <div key={p.id}
               className="pl-project"
               style={{ "--p-color": p.color }}
               onClick={() => { setActiveProjectId(p.id); setView("project"); }}>
            <div className="pl-project-head">
              <div className="pl-project-avatar">{p.initials}</div>
              <div style={{minWidth: 0}}>
                <h3>{p.name}</h3>
                <div className="slug">/{p.slug}</div>
              </div>
            </div>
            <p>{p.desc}</p>
            <div className="pl-project-meta">
              <span><b>{p.entries}</b> entradas</span>
              <span><b>{p.followers}</b> siguiendo</span>
              <span style={{marginLeft: "auto"}}>{relTime("2026-04-22")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Project page ============
function Project({ projectId, badgeStyle, setView }) {
  const project = projects.find(p => p.id === projectId) ?? projects[0];
  const [filter, setFilter] = useState("all");
  const entries = allEntries.filter(e => e.projectId === project.id);
  const filtered = filter === "all" ? entries
    : filter === "published" ? entries.filter(e => e.published)
    : entries.filter(e => !e.published);

  return (
    <div className="pl-page">
      <div className="pl-page-head">
        <div>
          <div className="crumbs">proyectos / {project.slug}</div>
          <h1 style={{display: "flex", alignItems: "center", gap: 12}}>
            <span className="pl-project-avatar" style={{"--p-color": project.color, width: 28, height: 28, fontSize: 12, borderRadius: 6}}>
              {project.initials}
            </span>
            {project.name}
          </h1>
          <p>{project.desc}</p>
        </div>
        <div className="pl-page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setView("public")}>Ver página pública ↗</button>
          <button className="btn btn-secondary btn-sm">Ajustes</button>
          <button className="btn btn-primary btn-sm" onClick={() => setView("editor")}>+ Nueva entrada</button>
        </div>
      </div>

      <div className="pl-tabs">
        {[
          ["all", "Todas", entries.length],
          ["published", "Publicadas", entries.filter(e => e.published).length],
          ["draft", "Borradores", entries.filter(e => !e.published).length],
        ].map(([k, lbl, n]) => (
          <div key={k} className={`pl-tab ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>
            {lbl}
            <span className="count">{n}</span>
          </div>
        ))}
        <div style={{flex: 1}} />
        <div className="pl-tab" style={{cursor: "default", color: "var(--fg-faint)"}}>
          <span style={{fontFamily: "var(--font-mono)", fontSize: 11}}>⌘F filtrar</span>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="pl-entries">
          {filtered.map(e => (
            <div key={e.id} className="pl-entry-row">
              <TypeBadge type={e.type} style={badgeStyle} />
              <span className="version">{e.version}</span>
              <span className="pl-entry-title">{e.title}</span>
              <span className={`pl-entry-status ${e.published ? "pub" : ""}`}>
                {e.published ? "publicado" : "borrador"}
              </span>
              <span className="pl-entry-date">{e.publishedAt ? relTime(e.publishedAt) : "—"}</span>
              <div className="pl-entry-actions">
                <button title="Editar">✎</button>
                <button title="Más">⋯</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pl-empty">
          <div className="glyph">{`┌────────────┐\n│  sin datos │\n└────────────┘`}</div>
          <h3>No hay entradas en este filtro</h3>
          <p>Prueba a cambiar el filtro o crea una nueva entrada.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setView("editor")}>+ Nueva entrada</button>
        </div>
      )}
    </div>
  );
}

// ============ Feed ============
function Feed({ badgeStyle, setView, setActiveProjectId }) {
  const feedItems = allEntries.filter(e => e.published).slice(0, 8);
  const groups = [
    { label: "Hoy", items: feedItems.slice(0, 2) },
    { label: "Esta semana", items: feedItems.slice(2, 5) },
    { label: "Anteriores", items: feedItems.slice(5) },
  ];
  return (
    <div className="pl-page" style={{maxWidth: 760}}>
      <div className="pl-page-head">
        <div>
          <div className="crumbs">~ / feed</div>
          <h1>Tu feed</h1>
          <p>Actualizaciones de los {projects.length} proyectos que sigues</p>
        </div>
        <div className="pl-page-actions">
          <button className="btn btn-secondary btn-sm">RSS</button>
          <button className="btn btn-ghost btn-sm">Todos leídos</button>
        </div>
      </div>

      <div className="pl-feed-groups">
        {groups.map(g => g.items.length > 0 && (
          <div key={g.label}>
            <div className="pl-feed-group-label">// {g.label}</div>
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              {g.items.map(e => {
                const proj = projects.find(p => p.id === e.projectId);
                return (
                  <div key={e.id}
                       className="pl-feed-item"
                       style={{"--p-color": proj.color}}
                       onClick={() => { setActiveProjectId(proj.id); setView("public"); }}>
                    <div className="ava">{proj.initials}</div>
                    <div className="body">
                      <div className="proj">
                        {proj.name}
                        <span className="slug">/{proj.slug}</span>
                      </div>
                      <div className="row">
                        <TypeBadge type={e.type} style={badgeStyle} />
                        <span className="version">{e.version}</span>
                      </div>
                      <p className="title">{e.title}</p>
                    </div>
                    <span className="date">{relTime(e.publishedAt)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ Public changelog ============
function Public({ projectId, badgeStyle }) {
  const project = projects.find(p => p.id === projectId) ?? projects[0];
  const [following, setFollowing] = useState(false);
  const entries = allEntries.filter(e => e.projectId === project.id && e.published);

  return (
    <div className="pl-main" style={{overflow: "auto"}}>
      <div className="pl-public" style={{"--p-color": project.color}}>
        <div className="pl-public-head">
          <div className="avatar">{project.initials}</div>
          <div style={{flex: 1, minWidth: 0}}>
            <h1>{project.name}</h1>
            <p>{project.desc}</p>
            <div className="meta">
              <span>{entries.length} entradas</span>
              <span>{project.followers + (following ? 1 : 0)} siguen</span>
              <span>última: {relTime(entries[0]?.publishedAt)}</span>
              <a>RSS</a>
            </div>
          </div>
          <button
            className={`pl-follow ${following ? "following" : ""}`}
            onClick={() => setFollowing(!following)}>
            {following ? "Siguiendo ✓" : "Seguir"}
            <span className="count">{project.followers + (following ? 1 : 0)}</span>
          </button>
        </div>

        <div>
          {entries.map(e => (
            <article key={e.id} className={`pl-entry pl-entry-${e.type}`}>
              <div className="pl-entry-header">
                <TypeBadge type={e.type} style={badgeStyle} />
                <span className="version">{e.version}</span>
                <span className="date">{relTime(e.publishedAt)}</span>
              </div>
              <h2>{e.title}</h2>
              <div className="pl-entry-body">
                {e.content ? e.content.split("\n\n").map((block, i) => {
                  if (block.startsWith("```")) {
                    const code = block.replace(/```\n?|\n?```/g, "");
                    return <pre key={i} style={{background: "var(--bg-elev)", border: "1px solid var(--border)", padding: 12, borderRadius: 6, fontSize: 12.5, fontFamily: "var(--font-mono)", overflow: "auto", margin: "0 0 10px"}}><code>{code}</code></pre>;
                  }
                  if (block.startsWith("- ")) {
                    return <ul key={i}>{block.split("\n").map((l, j) => <li key={j}>{l.replace(/^- /, "")}</li>)}</ul>;
                  }
                  return <p key={i}>{block}</p>;
                }) : <p style={{color: "var(--fg-faint)"}}>Sin descripción.</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ Editor ============
function Editor({ badgeStyle, setView }) {
  const [type, setType] = useState("feature");
  const [version, setVersion] = useState("v2.1.1");
  const [title, setTitle] = useState("Fix en UI del inventario");
  const [content, setContent] = useState("Corregido el desbordamiento de texto en items largos.\n\n- Aplicado `text-overflow: ellipsis`\n- Tooltip en hover con el nombre completo");
  const [published, setPublished] = useState(false);

  return (
    <div className="pl-page">
      <div className="pl-page-head">
        <div>
          <div className="crumbs">nova-engine / nueva entrada</div>
          <h1>Nueva entrada de changelog</h1>
        </div>
        <div className="pl-page-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setView("project")}>Cancelar</button>
          <button className="btn btn-secondary btn-sm">Guardar borrador</button>
          <button className="btn btn-primary btn-sm">Publicar</button>
        </div>
      </div>

      <div className="pl-editor">
        <div className="pl-editor-main">
          <input
            className="pl-editor-title-input"
            placeholder="Título de la entrada..."
            value={title}
            onChange={e => setTitle(e.target.value)} />
          <div style={{display: "flex", gap: 8, alignItems: "center", margin: "8px 0 4px"}}>
            <TypeBadge type={type} style={badgeStyle} />
            <span className="version">{version}</span>
            <span style={{fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)"}}>preview</span>
          </div>
          <div style={{position: "relative"}}>
            <label style={{position: "absolute", top: 10, right: 14, fontSize: 10, color: "var(--fg-faint)", fontFamily: "var(--font-mono)"}}>
              markdown
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="## ¿Qué cambió?"
            />
          </div>
        </div>

        <aside className="pl-editor-aside">
          <div className="block">
            <label>Versión</label>
            <input value={version} onChange={e => setVersion(e.target.value)} placeholder="v1.0.0" style={{fontFamily: "var(--font-mono)"}} />
          </div>
          <div className="block">
            <label>Tipo</label>
            <div className="pl-type-grid">
              {Object.entries(TYPE_META).map(([k, m]) => (
                <div key={k}
                     className={`pl-type-chip type-${k} ${type === k ? "active" : ""}`}
                     style={{"--t-color": `var(--t-${k})`}}
                     onClick={() => setType(k)}>
                  <span className="sq"></span>
                  {m.label}
                </div>
              ))}
            </div>
            <p style={{fontSize: 12, color: "var(--fg-muted)", margin: "10px 0 0"}}>{TYPE_META[type].desc}</p>
          </div>
          <div className="block">
            <div className="switch-row">
              <label>Publicar ahora</label>
              <div className={`switch ${published ? "on" : ""}`} onClick={() => setPublished(!published)}></div>
            </div>
            <p style={{fontSize: 12, color: "var(--fg-muted)", margin: "6px 0 0", lineHeight: 1.5}}>
              Las entradas publicadas aparecen inmediatamente en el feed de tus 284 seguidores.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============ Root App ============
function PatchlogApp({ initialView = "landing", badgeStyle = "bracket", density = 1, theme = "dark" }) {
  const [view, setView] = useState(initialView);
  const [activeProjectId, setActiveProjectId] = useState("p1");
  const [isAuthed, setIsAuthed] = useState(initialView !== "landing" && initialView !== "login");

  useEffect(() => { setView(initialView); setIsAuthed(initialView !== "landing" && initialView !== "login"); }, [initialView]);

  function auth() {
    if (isAuthed) { setIsAuthed(false); setView("landing"); }
    else { setIsAuthed(true); setView("dashboard"); }
  }

  const showSidebar = isAuthed && !["landing", "login", "public"].includes(view);
  const showTopbar = view !== "login";

  return (
    <div
      className={`pl-app theme-${theme}`}
      style={{
        "--density": density,
        "--accent": theme === "light" ? "oklch(0.55 0.16 155)" : "oklch(0.82 0.17 155)",
      }}
    >
      {showTopbar && <TopBar view={view} setView={setView} isAuthed={isAuthed} onAuth={auth} />}
      {view === "landing" && <Landing badgeStyle={badgeStyle} setView={(v) => { if (v === "public") { setActiveProjectId("p1"); } setView(v); }} onAuth={() => setView("login")} />}
      {view === "login" && <Login onAuth={auth} />}
      {showSidebar ? (
        <div className="pl-dash">
          <Sidebar view={view} setView={setView} activeProjectId={activeProjectId} setActiveProjectId={setActiveProjectId} />
          <main className="pl-main">
            {view === "dashboard" && <Dashboard setView={setView} setActiveProjectId={setActiveProjectId} />}
            {view === "project" && <Project projectId={activeProjectId} badgeStyle={badgeStyle} setView={setView} />}
            {view === "feed" && <Feed badgeStyle={badgeStyle} setView={setView} setActiveProjectId={setActiveProjectId} />}
            {view === "editor" && <Editor badgeStyle={badgeStyle} setView={setView} />}
            {view === "new-project" && (
              <div className="pl-page">
                <div className="pl-page-head">
                  <div>
                    <div className="crumbs">proyectos / nuevo</div>
                    <h1>Nuevo proyecto</h1>
                  </div>
                </div>
                <div style={{maxWidth: 520, display: "flex", flexDirection: "column", gap: 16}}>
                  <div className="pl-editor">
                    <div className="pl-editor-main" style={{gap: 16}}>
                      <div><label style={{fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6}}>Nombre</label>
                        <input defaultValue="Mi proyecto" /></div>
                      <div><label style={{fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6}}>Slug</label>
                        <input defaultValue="mi-proyecto" style={{fontFamily: "var(--font-mono)"}} /></div>
                      <div><label style={{fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6}}>Descripción</label>
                        <textarea defaultValue="Breve descripción del proyecto." style={{minHeight: 80, fontFamily: "var(--font-sans)", fontSize: 14}} /></div>
                      <div style={{display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setView("dashboard")}>Cancelar</button>
                        <button className="btn btn-primary btn-sm" onClick={() => setView("dashboard")}>Crear proyecto</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {view === "settings" && (
              <div className="pl-page">
                <div className="pl-page-head"><div><div className="crumbs">~ / ajustes</div><h1>Ajustes de cuenta</h1></div></div>
                <div className="pl-empty"><h3>Sección en preparación</h3><p>Aquí irán preferencias de notificación, API keys, y facturación.</p></div>
              </div>
            )}
          </main>
        </div>
      ) : view === "public" ? (
        <div className="pl-main"><Public projectId={activeProjectId} badgeStyle={badgeStyle} /></div>
      ) : null}
    </div>
  );
}

window.PatchlogApp = PatchlogApp;
