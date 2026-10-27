import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api.js';
import AboutModal from './components/AboutModal.jsx';
import Tabs from './components/Tabs.jsx';
import Toolbar from './components/Toolbar.jsx';
import { LANGUAGE_ID, registerBmlang, THEME_ID } from './editor/bmlangLanguage.js';
import { DEFAULT_CODE } from './examples.js';
import { readBmlFile, saveBmlFile } from './fileOps.js';

const MARKER_OWNER = 'bmlang';
const now = () => new Date().toLocaleTimeString('es-GT', { hour12: false });

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [fileName, setFileName] = useState('programa.bml');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(null); // null | 'check' | 'tac' | ...
  const [log, setLog] = useState([]);
  const [stdin, setStdin] = useState('');
  const [rightTab, setRightTab] = useState('tac');
  const [bottomTab, setBottomTab] = useState('output');
  const [showAbout, setShowAbout] = useState(false);
  const [toast, setToast] = useState(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [health, setHealth] = useState(null);
  // Salidas de las fases futuras (se llenarán cuando existan /api/tac y /api/asm).
  const [tacOutput] = useState('');
  const [asmOutput] = useState('');

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const fileHandleRef = useRef(null);
  const fileInputRef = useRef(null);
  const actionsRef = useRef({});

  const print = useCallback((type, text, line = null) => {
    setLog((prev) => [...prev.slice(-199), { id: crypto.randomUUID(), time: now(), type, text, line }]);
  }, []);

  const notify = useCallback((text) => {
    setToast({ text, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    api.getHealth().then((h) => {
      setHealth(h);
      if (!h.ok) print('error', h.message);
    });
  }, [print]);

  useEffect(() => {
    const warn = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // ---------- Marcas de error en Monaco ----------
  const clearMarks = useCallback(() => {
    const model = editorRef.current?.getModel();
    if (model) monacoRef.current.editor.setModelMarkers(model, MARKER_OWNER, []);
    decorationsRef.current?.clear();
  }, []);

  const markErrors = useCallback((errors) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const model = editor?.getModel();
    if (!model) return;
    const lines = errors.filter((e) => Number.isInteger(e.line) && e.line >= 1 && e.line <= model.getLineCount());
    monaco.editor.setModelMarkers(
      model,
      MARKER_OWNER,
      lines.map((e) => ({
        severity: monaco.MarkerSeverity.Error,
        message: e.message,
        startLineNumber: e.line,
        endLineNumber: e.line,
        startColumn: model.getLineFirstNonWhitespaceColumn(e.line) || 1,
        endColumn: model.getLineMaxColumn(e.line),
      })),
    );
    decorationsRef.current?.set(
      lines.map((e) => ({
        range: new monaco.Range(e.line, 1, e.line, 1),
        options: { isWholeLine: true, className: 'error-line', glyphMarginClassName: 'error-glyph', glyphMarginHoverMessage: { value: e.message } },
      })),
    );
    if (lines.length) editor.revealLineInCenter(lines[0].line);
  }, []);

  const goToLine = useCallback((line) => {
    const editor = editorRef.current;
    if (!editor || !line) return;
    editor.revealLineInCenter(line);
    editor.setPosition({ lineNumber: line, column: 1 });
    editor.focus();
  }, []);

  // ---------- Acciones ----------
  const loadText = useCallback((text, name, handle = null) => {
    setCode(text);
    setFileName(name);
    setDirty(false);
    fileHandleRef.current = handle;
    clearMarks();
  }, [clearMarks]);

  const handleFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      loadText(await readBmlFile(file), file.name);
      print('info', `Archivo abierto: ${file.name}`);
    } catch (err) {
      print('error', err.message);
      notify(err.message);
    }
  };

  const openFile = useCallback(() => fileInputRef.current?.click(), []);

  const save = useCallback(async () => {
    try {
      const saved = await saveBmlFile(editorRef.current?.getValue() ?? code, fileName, fileHandleRef.current);
      if (!saved) return;
      fileHandleRef.current = saved.handle;
      setFileName(saved.name);
      setDirty(false);
      print('info', saved.handle ? `Guardado: ${saved.name}` : `Descargado: ${saved.name}`);
    } catch (err) {
      print('error', `No se pudo guardar: ${err.message}`);
    }
  }, [code, fileName, print]);

  const validate = useCallback(async () => {
    if (busy) return;
    const source = editorRef.current?.getValue() ?? code;
    setBusy('check');
    setBottomTab('output');
    clearMarks();
    print('info', 'Validando sintaxis…');
    try {
      const result = await api.checkSyntax(source);
      if (result.ok) {
        print('ok', '✔ Sintaxis correcta');
      } else {
        for (const err of result.errors) {
          const where = err.line ? `Línea ${err.line}: ` : '';
          print('error', `✖ ${where}${err.message}`, err.line ?? null);
        }
        if (!result.unavailable && result.errors.some((e) => !e.line)) {
          print('hint', 'El analizador no reporta el número de línea, por eso no se puede marcar en el editor.');
        }
        markErrors(result.errors);
      }
      if (result.raw) print('raw', result.raw);
    } finally {
      setBusy(null);
    }
  }, [busy, code, clearMarks, markErrors, print]);

  const pending = useCallback((label) => notify(`${label}: disponible próximamente`), [notify]);

  const loadExample = useCallback((ex) => {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Reemplazar el código con el ejemplo?')) return;
    loadText(ex.code, `${ex.id}.bml`);
    print('info', `Ejemplo cargado: ${ex.name}`);
  }, [dirty, loadText, print]);

  actionsRef.current = { save, validate, openFile };

  // ---------- Monaco ----------
  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    decorationsRef.current = editor.createDecorationsCollection();
    const { KeyMod, KeyCode } = monaco;
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => actionsRef.current.save());
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyO, () => actionsRef.current.openFile());
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => actionsRef.current.validate());
    editor.onDidChangeCursorPosition((e) => setCursor({ line: e.position.lineNumber, column: e.position.column }));
    editor.focus();
  };

  const handleChange = (value) => {
    setCode(value ?? '');
    setDirty(true);
    clearMarks(); // las líneas marcadas ya no corresponden al código editado
  };

  // ---------- Render ----------
  const placeholder = (what, endpoint) => (
    <div className="placeholder">
      <p>{what} estará disponible próximamente.</p>
      <p className="muted">Se generará con <code>{endpoint}</code>.</p>
    </div>
  );

  return (
    <div className="app">
      <Toolbar
        busy={busy}
        onOpen={openFile}
        onSave={save}
        onLoadExample={loadExample}
        onValidate={validate}
        onPending={pending}
        onAbout={() => setShowAbout(true)}
      />
      <input ref={fileInputRef} type="file" accept=".bml" hidden onChange={handleFileChosen} />

      <main className="workspace">
        <section className="editor-pane">
          <div className="pane-title">
            <span>{fileName}{dirty && <span className="dirty" title="Cambios sin guardar"> ●</span>}</span>
          </div>
          <div className="editor-host">
            <Editor
              language={LANGUAGE_ID}
              theme={THEME_ID}
              value={code}
              beforeMount={registerBmlang}
              onMount={handleMount}
              onChange={handleChange}
              loading={<div className="placeholder">Cargando editor…</div>}
              options={{
                fontSize: 14,
                lineNumbers: 'on',
                glyphMargin: true,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                renderWhitespace: 'selection',
              }}
            />
          </div>
        </section>

        <Tabs
          className="side-pane"
          active={rightTab}
          onChange={setRightTab}
          tabs={[
            { id: 'tac', label: 'Código intermedio', content: tacOutput ? <pre className="code-out">{tacOutput}</pre> : placeholder('El código intermedio', 'POST /api/tac') },
            { id: 'asm', label: 'NASM', content: asmOutput ? <pre className="code-out">{asmOutput}</pre> : placeholder('El código NASM', 'POST /api/asm') },
          ]}
        />

        <Tabs
          className="console-pane"
          active={bottomTab}
          onChange={setBottomTab}
          tabs={[
            {
              id: 'output',
              label: 'Salida',
              content: (
                <div className="console">
                  {log.length === 0 && <div className="muted">Presiona “Validar” (Ctrl+Enter) para analizar el programa.</div>}
                  {log.map((entry) => (
                    <div
                      key={entry.id}
                      className={`log log-${entry.type}${entry.line ? ' clickable' : ''}`}
                      onClick={entry.line ? () => goToLine(entry.line) : undefined}
                      title={entry.line ? 'Ir a la línea' : undefined}
                    >
                      <span className="time">[{entry.time}]</span>
                      {entry.type === 'raw' ? <pre>{entry.text}</pre> : <span>{entry.text}</span>}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: 'stdin',
              label: 'Entrada (stdin)',
              content: (
                <textarea
                  className="stdin"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Valores para READ al ejecutar el programa (uno por línea). Disponible cuando esté listo “Ejecutar”."
                  spellCheck={false}
                />
              ),
            },
          ]}
        />
      </main>

      <footer className="statusbar">
        <span className={`status ${busy ? 'busy' : 'ready'}`}>
          <span className="dot" /> {busy ? 'Validando…' : 'Listo'}
        </span>
        <span title={health?.bmlangPath}>
          {health == null ? 'Comprobando analizador…' : health.ok ? `Analizador: bmlang (${health.mode})` : 'Analizador no disponible'}
        </span>
        <span className="spacer" />
        <span>Ln {cursor.line}, Col {cursor.column}</span>
        <span>BMLang</span>
      </footer>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {toast && <div className="toast" key={toast.id} role="status">{toast.text}</div>}
    </div>
  );
}
