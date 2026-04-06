import { useState, useEffect, useRef, useCallback } from 'react';
import { hardcodedThoughts } from './Thoughts';
import { hardcodedCaseStudies } from './HighlightedWork';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminArticle {
  id: number;
  date: string;
  title: string;
  body: string;
  tags: string[];
  thumbBg?: string;
  image: string | null;
  fullContent?: string;
  contentType?: 'markdown' | 'html';
  heroImage?: string;
  link?: { label: string; source?: string; url: string };
}

export interface AdminCaseStudy {
  id: number;
  title: string;
  company?: string;
  timeline?: string;
  description: string;
  tags: string[];
  heroMedia?: string;
  heroBg?: string;
  fullContent?: string;
  iframeDemo?: string;
  deleted?: boolean;
}

// ─── API helpers (Vite dev server middleware) ─────────────────────────────────

async function apiLoad(): Promise<AdminArticle[]> {
  try {
    const res = await fetch('/api/thoughts');
    if (!res.ok) return [];
    const text = await res.text();
    return JSON.parse(text) as AdminArticle[];
  } catch {
    return [];
  }
}

async function apiSave(articles: AdminArticle[]): Promise<boolean> {
  try {
    const res = await fetch('/api/thoughts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articles, null, 2),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function apiUpload(name: string, dataUrl: string): Promise<string | null> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data: dataUrl }),
    });
    if (!res.ok) return null;
    const json = await res.json() as { path?: string };
    return json.path ?? null;
  } catch {
    return null;
  }
}

async function csApiLoad(): Promise<AdminCaseStudy[]> {
  try {
    const res = await fetch('/api/case-studies');
    if (!res.ok) return [];
    return JSON.parse(await res.text()) as AdminCaseStudy[];
  } catch { return []; }
}

async function csApiSave(studies: AdminCaseStudy[]): Promise<boolean> {
  try {
    const res = await fetch('/api/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studies, null, 2),
    });
    return res.ok;
  } catch { return false; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SESSION_KEY = 'yh_admin_auth';
const PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'portfolio-admin';

/** Wrap any bare <img> tags not already inside <figure> with <figure><figcaption> */
function wrapImagesInFigure(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.body.querySelectorAll('img').forEach(img => {
    if (img.parentElement?.tagName === 'FIGURE') return; // already wrapped
    const fig = doc.createElement('figure');
    const caption = doc.createElement('figcaption');
    img.replaceWith(fig);
    fig.appendChild(img);
    fig.appendChild(caption);
  });
  return doc.body.innerHTML;
}

function markdownToHtml(text: string): string {
  return text.split('\n\n').map(para => {
    const lines = para.split('\n');
    const isList = lines.length > 0 && lines.every(l => l.trimStart().startsWith('- '));

    const inline = (t: string) =>
      t
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');

    if (isList) {
      const items = lines.map(l => `<li>${inline(l.replace(/^\s*- /, ''))}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${inline(lines.join('<br>'))}</p>`;
  }).join('');
}

function todayLabel(): string {
  return new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
}

function blankCaseStudy(): AdminCaseStudy {
  return {
    id: Date.now(),
    title: '',
    description: '',
    tags: [],
    fullContent: '',
  };
}

function blankArticle(): AdminArticle {
  return {
    id: Date.now(),
    date: todayLabel(),
    title: '',
    body: '',
    tags: [],
    thumbBg: '#F0EFED',
    image: null,
    fullContent: '',
    contentType: 'html',
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const FONT = '"Inter", system-ui, -apple-system, sans-serif';

const s = {
  root: {
    display: 'flex',
    height: '100vh',
    fontFamily: FONT,
    background: '#f7f7f7',
    color: '#111',
    overflow: 'hidden',
  } satisfies React.CSSProperties,

  sidebar: {
    width: 260,
    flexShrink: 0,
    borderRight: '1px solid #e4e4e4',
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
  } satisfies React.CSSProperties,

  sidebarHead: {
    padding: '14px 16px',
    borderBottom: '1px solid #e4e4e4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  } satisfies React.CSSProperties,

  btnPrimary: {
    padding: '5px 12px',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: FONT,
  } satisfies React.CSSProperties,

  btnGhost: {
    padding: '5px 10px',
    background: 'transparent',
    color: '#888',
    border: '1px solid #e4e4e4',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: FONT,
  } satisfies React.CSSProperties,

  btnDanger: {
    padding: '6px 14px',
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid #fca5a5',
    borderRadius: 6,
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: FONT,
  } satisfies React.CSSProperties,

  input: {
    padding: '5px 9px',
    border: '1px solid #e4e4e4',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: FONT,
    outline: 'none',
    background: '#fff',
    color: '#111',
  } satisfies React.CSSProperties,

  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 3,
    display: 'block',
  },
};

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onLogin();
    } else {
      setError(true);
      setPw('');
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#f7f7f7', fontFamily: FONT,
    }}>
      <form onSubmit={submit} style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        width: 310, padding: '32px 28px',
        background: '#fff', borderRadius: 14,
        border: '1px solid #e4e4e4',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>Article Admin</div>
          <div style={{ fontSize: 13, color: '#888' }}>Enter your password to continue</div>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          placeholder="Password"
          autoFocus
          style={{
            ...s.input,
            fontSize: 14,
            padding: '10px 12px',
            border: `1px solid ${error ? '#ef4444' : '#e4e4e4'}`,
          }}
        />
        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginTop: -6 }}>
            Incorrect password
          </div>
        )}
        <button type="submit" style={{ ...s.btnPrimary, padding: '10px 0', fontSize: 14, borderRadius: 8 }}>
          Sign in
        </button>
        <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center' }}>
          Set <code>VITE_ADMIN_PASSWORD</code> in .env.local to change the password
        </div>
      </form>
    </div>
  );
}

// ─── Empty-editor placeholder (via injected CSS) ───────────────────────────────

const PLACEHOLDER_STYLE = `
  .admin-editor:empty:before {
    content: attr(data-placeholder);
    color: #bbb;
    pointer-events: none;
  }
  .admin-editor img { max-width: 100%; border-radius: 8px; margin: 6px 0; display: block; }
  .admin-editor b, .admin-editor strong { font-weight: 700; }
  .admin-editor p { margin: 0 0 0.75em; }
  .admin-editor figure { margin: 12px 0; }
  .admin-editor figure img { margin: 0; border-radius: 8px; }
  .admin-editor figcaption {
    font-size: 12px; color: #888; font-style: italic;
    margin-top: 5px; padding: 4px 0; min-height: 24px;
    border-bottom: 1px dashed #ddd; outline: none;
    position: relative;
  }
  .admin-editor figcaption:focus { border-bottom-color: #aaa; }
  .admin-editor figcaption[data-empty="true"]::before {
    content: 'Add a caption…';
    color: #ccc;
    pointer-events: none;
    position: absolute;
    top: 4px; left: 0;
  }
`;

// ─── Main Admin component ─────────────────────────────────────────────────────

export function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [apiAvailable, setApiAvailable] = useState(true);

  // Editor fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [thumbBg, setThumbBg] = useState('#F0EFED');
  const [image, setImage] = useState<string | null>(null);
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined);
  const [heroDragging, setHeroDragging] = useState(false);
  const [editorHtml, setEditorHtml] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  // ─── Case Studies state ───────────────────────────────────────────────────
  const [section, setSection] = useState<'articles' | 'case-studies'>('articles');
  const [caseStudies, setCaseStudies] = useState<AdminCaseStudy[]>([]);
  const [selectedCsId, setSelectedCsId] = useState<number | null>(null);
  const [csSaveStatus, setCsSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // CS editor fields
  const [csTitle, setCsTitle] = useState('');
  const [csCompany, setCsCompany] = useState('');
  const [csTimeline, setCsTimeline] = useState('');
  const [csDescription, setCsDescription] = useState('');
  const [csTags, setCsTags] = useState('');
  const [csHeroMedia, setCsHeroMedia] = useState('');
  const [csHeroBg, setCsHeroBg] = useState('#C8C3BB');
  const [csIframeDemo, setCsIframeDemo] = useState('');
  const [csFullContent, setCsFullContent] = useState('');
  const csHeroInputRef = useRef<HTMLInputElement>(null);

  // Load articles from API on mount, merged with hardcoded ones
  useEffect(() => {
    apiLoad().then(adminData => {
      if (adminData.length === 0) {
        fetch('/api/thoughts').then(r => {
          if (!r.ok) setApiAvailable(false);
        }).catch(() => setApiAvailable(false));
      }
      // Merge: admin articles override hardcoded ones with matching IDs
      const adminIds = new Set(adminData.map(a => a.id));
      const builtIn = (hardcodedThoughts as unknown as AdminArticle[]).filter(
        t => !adminIds.has(t.id)
      );
      setArticles([...adminData, ...builtIn]);
    });
  }, []);

  // Populate editor fields when selection changes
  useEffect(() => {
    const a = articles.find(x => x.id === selectedId);
    if (!a) return;
    setTitle(a.title);
    setDate(a.date);
    setBody(a.body);
    setTags(a.tags.join(', '));
    setThumbBg(a.thumbBg ?? '#F0EFED');
    setImage(a.image);
    setHeroImage(a.heroImage);
    if (editorRef.current) {
      const raw = a.fullContent ?? '';
      const html = wrapImagesInFigure(a.contentType === 'html' ? raw : markdownToHtml(raw));
      editorRef.current.innerHTML = html;
      editorRef.current.querySelectorAll('figcaption').forEach(fc => {
        fc.setAttribute('data-empty', fc.textContent?.trim() ? 'false' : 'true');
      });
      setEditorHtml(html);
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load case studies on mount, merged with hardcoded
  useEffect(() => {
    csApiLoad().then(adminData => {
      const adminIds = new Set(adminData.map(a => a.id));
      const builtIn = hardcodedCaseStudies.filter(cs => !adminIds.has(cs.id)).map(cs => ({
        id: cs.id,
        title: cs.title,
        company: cs.company,
        timeline: cs.timeline,
        description: cs.description,
        tags: cs.tags,
        heroMedia: cs.heroMedia,
        heroBg: cs.heroBg,
        fullContent: cs.fullContent ?? '',
        iframeDemo: cs.iframeDemo,
      } as AdminCaseStudy));
      setCaseStudies([...adminData, ...builtIn]);
    });
  }, []);

  // Populate CS editor when selection changes
  useEffect(() => {
    const cs = caseStudies.find(c => c.id === selectedCsId);
    if (!cs) return;
    setCsTitle(cs.title);
    setCsCompany(cs.company ?? '');
    setCsTimeline(cs.timeline ?? '');
    setCsDescription(cs.description);
    setCsTags(cs.tags.join(', '));
    setCsHeroMedia(cs.heroMedia ?? '');
    setCsHeroBg(cs.heroBg ?? '#C8C3BB');
    setCsIframeDemo(cs.iframeDemo ?? '');
    setCsFullContent(cs.fullContent ?? '');
  }, [selectedCsId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNew = () => {
    const a = blankArticle();
    const updated = [a, ...articles];
    setArticles(updated);
    setSelectedId(a.id);
    setTitle('');
    setDate(a.date);
    setBody('');
    setTags('');
    setThumbBg('#F0EFED');
    setImage(null);
    setHeroImage(undefined);
    if (editorRef.current) editorRef.current.innerHTML = '';
    setEditorHtml('');
  };

  const handleSave = useCallback(async () => {
    if (!selectedId) return;
    setSaveStatus('saving');

    const content = editorRef.current?.innerHTML ?? '';
    const editedArticle: AdminArticle = {
      ...(articles.find(a => a.id === selectedId) ?? blankArticle()),
      id: selectedId,
      title,
      date,
      body,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      thumbBg,
      image,
      heroImage,
      fullContent: content,
      contentType: 'html' as const,
    };

    // Update display list (all articles including hardcoded)
    const updatedDisplay = articles.map(a => a.id === selectedId ? editedArticle : a);
    setArticles(updatedDisplay);

    // Only persist admin-owned articles to the file (hardcoded ones become admin-owned on first save)
    const hardcodedIds = new Set((hardcodedThoughts as unknown as AdminArticle[]).map(t => t.id));
    const prevAdminArticles = await apiLoad();
    const prevAdminIds = new Set(prevAdminArticles.map(a => a.id));

    let nextAdmin: AdminArticle[];
    if (prevAdminIds.has(selectedId)) {
      // Already in admin file — update it
      nextAdmin = prevAdminArticles.map(a => a.id === selectedId ? editedArticle : a);
    } else if (hardcodedIds.has(selectedId)) {
      // Hardcoded article being edited for first time — add to admin (overrides hardcoded)
      nextAdmin = [editedArticle, ...prevAdminArticles];
    } else {
      // New article
      nextAdmin = [editedArticle, ...prevAdminArticles.filter(a => a.id !== selectedId)];
    }

    const ok = await apiSave(nextAdmin);
    setApiAvailable(ok);
    setSaveStatus(ok ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2500);
  }, [selectedId, articles, title, date, body, tags, thumbBg, image]);

  const handleCsSave = useCallback(async () => {
    if (selectedCsId === null) return;
    setCsSaveStatus('saving');
    const edited: AdminCaseStudy = {
      id: selectedCsId,
      title: csTitle,
      company: csCompany || undefined,
      timeline: csTimeline || undefined,
      description: csDescription,
      tags: csTags.split(',').map(t => t.trim()).filter(Boolean),
      heroMedia: csHeroMedia || undefined,
      heroBg: csHeroBg || undefined,
      fullContent: csFullContent,
      iframeDemo: csIframeDemo || undefined,
    };
    setCaseStudies(prev => prev.map(c => c.id === selectedCsId ? edited : c));
    const prev = await csApiLoad();
    const prevIds = new Set(prev.map(c => c.id));
    const next = prevIds.has(selectedCsId)
      ? prev.map(c => c.id === selectedCsId ? edited : c)
      : [edited, ...prev];
    const ok = await csApiSave(next);
    setCsSaveStatus(ok ? 'saved' : 'error');
    setTimeout(() => setCsSaveStatus('idle'), 2500);
  }, [selectedCsId, csTitle, csCompany, csTimeline, csDescription, csTags, csHeroMedia, csHeroBg, csIframeDemo]);

  const handleCsNew = () => {
    const cs = blankCaseStudy();
    setCaseStudies(prev => [cs, ...prev]);
    setSelectedCsId(cs.id);
    setCsTitle('');
    setCsCompany('');
    setCsTimeline('');
    setCsDescription('');
    setCsTags('');
    setCsHeroMedia('');
    setCsHeroBg('#C8C3BB');
    setCsIframeDemo('');
    setCsFullContent('');
  };

  const handleCsDelete = async () => {
    if (selectedCsId === null) return;
    if (!confirm('Delete this case study? This cannot be undone.')) return;
    const hardcodedIds = new Set(hardcodedCaseStudies.map(c => c.id));
    setCaseStudies(prev => prev.filter(c => c.id !== selectedCsId));
    setSelectedCsId(null);
    const prev = await csApiLoad();
    if (hardcodedIds.has(selectedCsId)) {
      // Mark hardcoded entry as deleted so it's hidden on the site
      const prevIds = new Set(prev.map(c => c.id));
      const deletedEntry: AdminCaseStudy = { id: selectedCsId, title: '', description: '', tags: [], deleted: true };
      const next = prevIds.has(selectedCsId)
        ? prev.map(c => c.id === selectedCsId ? { ...c, deleted: true } : c)
        : [deletedEntry, ...prev];
      void csApiSave(next);
    } else {
      void csApiSave(prev.filter(c => c.id !== selectedCsId));
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Delete this article? This cannot be undone.')) return;
    // Remove from display
    setArticles(prev => prev.filter(a => a.id !== selectedId));
    setSelectedId(null);
    // Remove from admin file
    const prevAdmin = await apiLoad();
    void apiSave(prevAdmin.filter(a => a.id !== selectedId));
  };

  const handleImageFile = (file: File): Promise<string | null> =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const serverPath = await apiUpload(file.name, dataUrl);
        resolve(serverPath ?? dataUrl);
      };
      reader.readAsDataURL(file);
    });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleImageFile(file).then(url => setImage(url));
  };

  // Paste images inside the content editor
  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(i => i.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      document.execCommand('insertHTML', false,
        `<figure><img src="${dataUrl}" /><figcaption data-empty="true"></figcaption></figure>`);
    };
    reader.readAsDataURL(file);
  };

  // Cmd/Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  const statusColor =
    saveStatus === 'saving' ? '#888' :
    saveStatus === 'saved' ? '#22c55e' :
    saveStatus === 'error' ? '#ef4444' : 'transparent';

  const statusText =
    saveStatus === 'saving' ? 'Saving…' :
    saveStatus === 'saved' ? '✓ Saved to file' :
    saveStatus === 'error' ? '⚠ Save failed — API offline?' : '·';

  return (
    <>
      <style>{PLACEHOLDER_STYLE}</style>
      <div style={s.root}>

        {/* ── Sidebar ── */}
        <div style={s.sidebar}>
          {/* Section tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e4e4e4', flexShrink: 0 }}>
            {(['articles', 'case-studies'] as const).map(sec => (
              <button
                key={sec}
                onClick={() => setSection(sec)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: FONT,
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${section === sec ? '#111' : 'transparent'}`,
                  color: section === sec ? '#111' : '#aaa',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {sec === 'articles' ? 'Articles' : 'Case Studies'}
              </button>
            ))}
          </div>

          <div style={s.sidebarHead}>
            {section === 'articles' ? (
              <>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Articles
                  <span style={{ marginLeft: 5, fontSize: 11, color: '#aaa', fontWeight: 400 }}>
                    ({articles.length})
                  </span>
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={s.btnPrimary} onClick={handleNew}>+ New</button>
                  <button style={s.btnGhost} onClick={() => { sessionStorage.removeItem(SESSION_KEY); window.location.href = '/'; }}>← Exit</button>
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Case Studies
                  <span style={{ marginLeft: 5, fontSize: 11, color: '#aaa', fontWeight: 400 }}>
                    ({caseStudies.filter(c => !c.deleted).length})
                  </span>
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={s.btnPrimary} onClick={handleCsNew}>+ New</button>
                  <button style={s.btnGhost} onClick={() => { sessionStorage.removeItem(SESSION_KEY); window.location.href = '/'; }}>← Exit</button>
                </div>
              </>
            )}
          </div>

          {!apiAvailable && (
            <div style={{
              margin: '10px 12px',
              padding: '8px 10px',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 7,
              fontSize: 11,
              color: '#dc2626',
              lineHeight: 1.5,
            }}>
              API unavailable — run <code>npm run dev</code> to enable file saving.
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {section === 'articles' ? (
              <>
                {articles.length === 0 && (
                  <div style={{ padding: '28px 20px', textAlign: 'center', color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>
                    No articles yet.<br />Click <strong>+ New</strong> to start.
                  </div>
                )}
                {[...articles].sort((a, b) => {
                  const parse = (d: string) => { const [m, y] = d.split(' '); return (parseInt(y) || 0) * 12 + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(m); };
                  return parse(b.date) - parse(a.date);
                }).map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    style={{
                      padding: '11px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      background: selectedId === a.id ? '#f5f5f5' : '#fff',
                      borderLeft: `2px solid ${selectedId === a.id ? '#111' : 'transparent'}`,
                      transition: 'background 0.1s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => { if (selectedId !== a.id) (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
                    onMouseLeave={e => { if (selectedId !== a.id) (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: a.title ? '#111' : '#bbb' }}>
                      {a.title || 'Untitled'}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{a.date}</div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {caseStudies.filter(cs => !cs.deleted).map(cs => (
                  <div
                    key={cs.id}
                    onClick={() => setSelectedCsId(cs.id)}
                    style={{
                      padding: '11px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      background: selectedCsId === cs.id ? '#f5f5f5' : '#fff',
                      borderLeft: `2px solid ${selectedCsId === cs.id ? '#111' : 'transparent'}`,
                      transition: 'background 0.1s',
                      userSelect: 'none',
                    }}
                    onMouseEnter={e => { if (selectedCsId !== cs.id) (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
                    onMouseLeave={e => { if (selectedCsId !== cs.id) (e.currentTarget as HTMLDivElement).style.background = '#fff'; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cs.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{cs.company}{cs.timeline ? ` · ${cs.timeline}` : ''}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Editor panel ── */}
        {section === 'case-studies' ? (
          /* ── Case Studies Editor ── */
          selectedCsId === null ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 14 }}>
              Select a case study to edit
            </div>
          ) : (() => {
            const csStatusColor = csSaveStatus === 'saving' ? '#888' : csSaveStatus === 'saved' ? '#22c55e' : csSaveStatus === 'error' ? '#ef4444' : 'transparent';
            const csStatusText = csSaveStatus === 'saving' ? 'Saving…' : csSaveStatus === 'saved' ? '✓ Saved' : csSaveStatus === 'error' ? '⚠ Save failed' : '·';
            return (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
                {/* Top bar — sticky */}
                <div style={{ padding: '10px 20px', borderBottom: '1px solid #e4e4e4', display: 'flex', alignItems: 'center', gap: 10, background: '#fff', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
                  <input
                    value={csTitle}
                    onChange={e => setCsTitle(e.target.value)}
                    placeholder="Case study title…"
                    style={{ flex: 1, fontSize: 18, fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, color: '#111', minWidth: 0 }}
                  />
                  <span style={{ fontSize: 12, color: csStatusColor, whiteSpace: 'nowrap', flexShrink: 0 }}>{csStatusText}</span>
                  <button style={s.btnDanger} onClick={() => void handleCsDelete()}>Delete</button>
                  <button style={{ ...s.btnPrimary, padding: '6px 18px', fontSize: 13 }} onClick={() => void handleCsSave()}>Save</button>
                </div>

                {/* Card metadata */}
                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid #e4e4e4' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Card (homepage)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                      {/* Hero image */}
                      <div>
                        <span style={s.label}>Hero image</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            value={csHeroMedia}
                            onChange={e => setCsHeroMedia(e.target.value)}
                            placeholder="Paste URL or upload →"
                            style={{ ...s.input, flex: 1 }}
                          />
                          <input ref={csHeroInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              void handleImageFile(f).then(url => { if (url) setCsHeroMedia(url); });
                            }}
                          />
                          <button style={s.btnGhost} onClick={() => csHeroInputRef.current?.click()}>Upload</button>
                        </div>
                        {csHeroMedia && (
                          <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', aspectRatio: '16/9', background: '#f0f0f0' }}>
                            <img src={csHeroMedia} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                        )}
                      </div>

                      {/* Company, Timeline, Bg colour */}
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 120px' }}>
                          <span style={s.label}>Company</span>
                          <input value={csCompany} onChange={e => setCsCompany(e.target.value)} placeholder="Nooks" style={s.input} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 100px' }}>
                          <span style={s.label}>Timeline</span>
                          <input value={csTimeline} onChange={e => setCsTimeline(e.target.value)} placeholder="2025–2026" style={s.input} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={s.label}>Bg colour</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="color" value={csHeroBg} onChange={e => setCsHeroBg(e.target.value)}
                              style={{ width: 28, height: 26, border: '1px solid #e4e4e4', borderRadius: 5, cursor: 'pointer', padding: 2, background: '#fff' }} />
                            <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{csHeroBg}</span>
                          </div>
                        </label>
                      </div>

                      {/* Tags */}
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={s.label}>Tags (comma-separated)</span>
                        <input value={csTags} onChange={e => setCsTags(e.target.value)} placeholder="AI, 0→1, Product Design" style={s.input} />
                      </label>

                      {/* Description */}
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={s.label}>Card description (shown on homepage card)</span>
                        <textarea
                          value={csDescription}
                          onChange={e => setCsDescription(e.target.value)}
                          rows={3}
                          style={{ ...s.input, resize: 'vertical', lineHeight: 1.6, fontFamily: FONT }}
                        />
                      </label>

                      {/* Interactive demo URL */}
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={s.label}>Interactive demo URL (optional)</span>
                        <input value={csIframeDemo} onChange={e => setCsIframeDemo(e.target.value)} placeholder="https://…" style={s.input} />
                      </label>
                  </div>
                </div>{/* end card metadata */}

              {/* Formatting toolbar */}
              <div style={{ padding: '6px 20px', borderTop: '1px solid #e4e4e4', borderBottom: '1px solid #e4e4e4', background: '#fff', display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                <button
                  title="Bold (⌘B)"
                  onMouseDown={e => { e.preventDefault(); document.execCommand('bold', false); }}
                  style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e4e4e4', borderRadius: 5, background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#333', fontFamily: 'Georgia, serif' }}
                >B</button>
                <span style={{ fontSize: 11, color: '#bbb', marginLeft: 6 }}>Use **Heading** for section titles · **bold** for emphasis · · for bullets</span>
              </div>

              {/* Plain text editor */}
              <textarea
                value={csFullContent}
                onChange={e => setCsFullContent(e.target.value)}
                placeholder={"Write the case study content here.\n\nUse **Heading** on its own line for section titles.\nUse **bold text** inline for emphasis.\nUse · at the start of a line for bullet points."}
                style={{ flex: 1, minHeight: 400, padding: '20px 24px', outline: 'none', fontSize: 15, lineHeight: 1.75, color: '#111', fontFamily: 'ui-monospace, monospace', background: '#fff', border: 'none', resize: 'none', width: '100%', boxSizing: 'border-box' }}
              />
              </div>
            );
          })()
        ) : !selectedId ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#bbb', fontSize: 14,
          }}>
            Select an article or click <strong style={{ marginLeft: 4, color: '#888' }}>+ New</strong>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

            {/* Top bar */}
            <div style={{
              padding: '10px 20px',
              borderBottom: '1px solid #e4e4e4',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fff',
              flexShrink: 0,
            }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Article title…"
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: 700,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: FONT,
                  color: '#111',
                  minWidth: 0,
                }}
              />
              <span style={{ fontSize: 12, color: statusColor, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {statusText}
              </span>
              <button style={s.btnDanger} onClick={handleDelete}>Delete</button>
              <button
                style={{ ...s.btnPrimary, padding: '6px 18px', fontSize: 13 }}
                onClick={() => void handleSave()}
              >
                Save
              </button>
            </div>

            {/* Metadata row */}
            <div style={{
              padding: '10px 20px',
              borderBottom: '1px solid #e4e4e4',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              background: '#fff',
              flexWrap: 'wrap',
              flexShrink: 0,
            }}>
              {/* Date */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={s.label}>Date</span>
                <input
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  placeholder="Mar 2026"
                  style={{ ...s.input, width: 90 }}
                />
              </label>

              {/* Tags */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={s.label}>Tags</span>
                <input
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="AI, Design"
                  style={{ ...s.input, width: 160 }}
                />
              </label>

              {/* Thumbnail colour */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={s.label}>Colour</span>
                <input
                  type="color"
                  value={thumbBg}
                  onChange={e => setThumbBg(e.target.value)}
                  style={{
                    width: 28, height: 26,
                    border: '1px solid #e4e4e4', borderRadius: 5,
                    cursor: 'pointer', padding: 2, background: '#fff',
                  }}
                />
                <span style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{thumbBg}</span>
              </label>

              {/* Cover image (thumbnail in list) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={s.label}>Cover</span>
                {image ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={image} alt="" style={{ width: 26, height: 26, borderRadius: 5, objectFit: 'cover', border: '1px solid #e4e4e4' }} />
                    <button onClick={() => setImage(null)} style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT }}>Remove</button>
                  </div>
                ) : (
                  <>
                    <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    <button onClick={() => imgInputRef.current?.click()} style={{ ...s.btnGhost, fontSize: 11 }}>Upload</button>
                  </>
                )}
              </div>

            </div>

            {/* Hero image — full-width drop zone */}
            <div style={{ padding: '0 20px 10px', background: '#fff', flexShrink: 0 }}>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => setHeroImage(reader.result as string);
                  reader.readAsDataURL(f);
                }}
                style={{ display: 'none' }}
              />
              {heroImage ? (
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #e4e4e4' }}>
                  <img src={heroImage} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => setHeroImage(undefined)}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      padding: '4px 10px', fontSize: 11, fontFamily: FONT,
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      border: 'none', borderRadius: 5, cursor: 'pointer',
                    }}
                  >
                    Remove hero
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => heroInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); setHeroDragging(true); }}
                  onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setHeroDragging(true); }}
                  onDragLeave={e => { e.preventDefault(); setHeroDragging(false); }}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHeroDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (!file?.type.startsWith('image/')) return;
                    const reader = new FileReader();
                    reader.onload = () => setHeroImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    height: 72,
                    border: `1.5px dashed ${heroDragging ? '#555' : '#d0d0d0'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: heroDragging ? '#f0f0f0' : '#fafafa',
                    transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: heroDragging ? '#333' : '#888', fontFamily: FONT }}>
                    {heroDragging ? 'Drop image here' : 'Hero image'}
                  </span>
                  <span style={{ fontSize: 11, color: '#bbb', fontFamily: FONT }}>
                    {heroDragging ? '' : 'Drag & drop or click to upload'}
                  </span>
                </div>
              )}
            </div>

            {/* Preview text */}
            <div style={{
              padding: '8px 20px',
              borderBottom: '1px solid #e4e4e4',
              background: '#fff',
              flexShrink: 0,
            }}>
              <div style={s.label}>Preview text (shown in article list)</div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Short teaser visible in the Thoughts column on your portfolio…"
                rows={2}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  border: 'none',
                  outline: 'none',
                  fontSize: 13,
                  color: '#555',
                  fontFamily: FONT,
                  background: 'transparent',
                  lineHeight: 1.55,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Formatting toolbar */}
            <div style={{
              padding: '6px 20px',
              borderBottom: '1px solid #e4e4e4',
              background: '#fff',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <button
                title="Bold (⌘B)"
                onMouseDown={e => {
                  e.preventDefault(); // don't blur editor
                  document.execCommand('bold', false);
                }}
                style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #e4e4e4', borderRadius: 5,
                  background: '#fff', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, color: '#333',
                  fontFamily: 'Georgia, serif',
                }}
              >
                B
              </button>
              <span style={{ fontSize: 11, color: '#bbb', marginLeft: 6 }}>
                ⌘B for bold · paste images directly into the editor
              </span>
            </div>

            {/* Editor + Preview split */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

              {/* Content editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="admin-editor"
                data-placeholder="Write your article here… You can paste text, images, and use ⌘B to bold."
                onKeyDown={e => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                    e.preventDefault();
                    document.execCommand('bold', false);
                  }
                }}
                onInput={() => {
                  const el = editorRef.current;
                  if (el) {
                    el.querySelectorAll('figcaption').forEach(fc => {
                      fc.setAttribute('data-empty', fc.textContent?.trim() ? 'false' : 'true');
                    });
                  }
                  setEditorHtml(el?.innerHTML ?? '');
                }}
                onPaste={handleEditorPaste}
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  padding: '20px 24px',
                  outline: 'none',
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: '#111',
                  overflowY: 'auto',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  background: '#fff',
                  borderRight: '1px solid #e4e4e4',
                  wordBreak: 'break-word',
                }}
              />

              {/* Live preview */}
              <div style={{
                flex: '0 0 38%',
                minWidth: 220,
                maxWidth: 360,
                overflowY: 'auto',
                background: '#f7f7f7',
                padding: '20px 20px',
              }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#bbb',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}>
                  Preview
                </div>

                {/* Thumbnail */}
                <div style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 10,
                  background: thumbBg || '#F0EFED',
                  marginBottom: 14,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {image && (
                    <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Hero image */}
                {heroImage && (
                  <div style={{ width: '100%', marginBottom: 12, borderRadius: 8, overflow: 'hidden' }}>
                    <img src={heroImage} alt="" style={{ width: '100%', objectFit: 'cover', maxHeight: 160, display: 'block' }} />
                  </div>
                )}

                {/* Date */}
                <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{date}</div>

                {/* Title */}
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: '#111',
                  marginBottom: 12,
                  fontFamily: FONT,
                }}>
                  {title || <span style={{ color: '#bbb' }}>Untitled</span>}
                </div>

                {/* Article body */}
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: '#333',
                    fontFamily: 'Georgia, serif',
                  }}
                  dangerouslySetInnerHTML={{ __html: editorHtml || `<p style="color:#bbb">Article content will appear here…</p>` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
