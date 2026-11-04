import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from './api.js';
import AboutModal from './components/AboutModal.jsx';
import ResultView from './components/ResultView.jsx';
import Tabs from './components/Tabs.jsx';
import Toolbar from './components/Toolbar.jsx';
import { LANGUAGE_ID, registerBmlang, THEME_ID } from './editor/bmlangLanguage.js';
import { DEFAULT_CODE } from './examples.js';
import { downloadBinary, readBmlFile, saveBmlFile } from './fileOps.js';

const MARKER_OWNER = 'bmlang';
const now = () => new Date().toLocaleTimeString('es-GT', { hour12: false });

// Etapas del flujo: cada botón exige que la anterior haya terminado bien para el código actual.
const STAGE = { NONE: 0, VALID: 1, ASM: 2, BUILT: 3 };

const STEPS = [
  { id: 'tac', label: 'Código intermedio', busyLabel: 'Generando…', status: 'Generando código intermedio…', needs: STAGE.VALID, missing: 'Primero valida el programa' },
  { id: 'asm', label: 'Código NASM', busyLabel: 'Generando…', status: 'Generando código NASM…', needs: STAGE.VALID, missing: 'Primero valida el programa' },
  { id: 'build', label: 'Generar ejecutable', busyLabel: 'Generando…', status: 'Generando ejecutable…', needs: STAGE.ASM, missing: 'Primero genera el código NASM' },
  { id: 'run', label: 'Ejecutar', busyLabel: 'Ejecutando…', status: 'Ejecutando…', needs: STAGE.BUILT, missing: 'Primero genera el ejecutable' },
];

const CALLS = {
  tac: (code) => api.generateTac(code),
  asm: (code) => api.generateAsm(code),
  build: (code) => api.buildExecutable(code),
  run: (code, stdin) => api.runProgram(code, stdin),
};

const EMPTY_RESULT = { status: 'empty', text: '' };

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [fileName, setFileName] = useState('programa.bml');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(null); // null | 'check' | 'tac' | 'asm' | 'build' | 'run'
  const [stage, setStage] = useState(STAGE.NONE);
  const [log, setLog] = useState([]);
  const [stdin, setStdin] = useState('');
  const [rightTab, setRightTab] = useState('tac');
  const [bottomTab, setBottomTab] = useState('output');
  const [showAbout, setShowAbout] = useState(false);
  const [toast, setToast] = useState(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [health, setHealth] = useState(null);
  const [results, setResults] = useState({ tac: EMPTY_RESULT, asm: EMPTY_RESULT });

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const fileHandleRef = useRef(null);
  const fileInputRef = useRef(null);
  const actionsRef = useRef({});
  const logEndRef = useRef(null);

  const print = useCallback((type, text, line = null) => {
    setLog((prev) => [...prev.slice(-199), { id: crypto.randomUUID(), time: now(), type, text, line }]);
  }, []);

  // La consola sigue a la última línea.
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [log]);

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

  // Aviso al cerrar la pestaña con cambios sin guardar, y "●" en el título.
  useEffect(() => {
    document.title = `${dirty ? '● ' : ''}${fileName} — BMLang IDE`;
    const warn = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, fileName]);

  // Atajos globales (también con el foco en el editor): Ctrl+S, Ctrl+O, F5 y Ctrl+Enter.
  useEffect(() => {
    const onKey = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      let action = null;
      if (ctrl && e.key.toLowerCase() === 's') action = 'save';
      else if (ctrl && e.key.toLowerCase() === 'o') action = 'openFile';
      else if (e.key === 'F5' || (ctrl && e.key === 'Enter')) action = 'validate';
      if (!action) return;
      e.preventDefault(); // F5 no recarga la página; Ctrl+S/O no abren los diálogos del navegador
      e.stopPropagation();
      actionsRef.current[action]();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

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

  /** Muestra errores en la consola. Solo los del programa .bml se marcan en el editor. */
  const reportErrors = useCallback((result) => {
    const fromAsm = result.stage === 'nasm' || result.stage === 'ld';
    for (const err of result.errors) {
      const where = err.line ? `${fromAsm ? 'NASM, línea' : 'Línea'} ${err.line}: ` : '';
      print('error', `✖ ${where}${err.message}`, fromAsm ? null : err.line ?? null);
    }
    if (!fromAsm) markErrors(result.errors);
    if (result.raw) print('raw', result.raw);
  }, [markErrors, print]);

  // Cualquier cambio al código invalida los pasos ya hechos.
  const resetPipeline = useCallback(() => {
    clearMarks();
    setStage(STAGE.NONE);
  }, [clearMarks]);

  // ---------- Acciones ----------
  const loadText = useCallback((text, name, handle = null) => {
    setCode(text);
    setFileName(name);
    setDirty(false);
    fileHandleRef.current = handle;
    resetPipeline();
    setResults({ tac: EMPTY_RESULT, asm: EMPTY_RESULT });
  }, [resetPipeline]);

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
    resetPipeline();
    print('info', 'Validando sintaxis…');
    try {
      const result = await api.checkSyntax(source);
      if (result.ok) {
        print('ok', '✔ Sintaxis correcta');
        setStage(STAGE.VALID);
      } else {
        reportErrors(result);
        if (!result.unavailable && result.errors.some((e) => !e.line)) {
          print('hint', 'El analizador no reporta el número de línea, por eso no se puede marcar en el editor.');
        }
        return;
      }
      if (result.raw) print('raw', result.raw);
    } finally {
      setBusy(null);
    }
  }, [busy, code, reportErrors, resetPipeline, print]);

  const runStep = useCallback(async (id) => {
    const step = STEPS.find((s) => s.id === id);
    if (busy || stage < step.needs) return;
    const source = editorRef.current?.getValue() ?? code;
    setBusy(id);
    setBottomTab('output');
    if (id === 'tac' || id === 'asm') setRightTab(id);
    print('info', step.status);
    try {
      const result = await CALLS[id](source, stdin);
      const setResult = (status, text = '') => (id === 'tac' || id === 'asm') && setResults((r) => ({ ...r, [id]: { status, text } }));

      if (result.pending) {
        setResult('pending');
        print('hint', `${step.label}: Generador aún no implementado`);
        notify('Generador aún no implementado');
        return;
      }
      if (!result.ok) {
        setResult('error');
        if (id === 'run' && result.output) print('program', result.output);
        reportErrors(result);
        return;
      }

      if (id === 'tac' || id === 'asm') {
        setResult('ok', result.output);
        print('ok', `✔ ${step.label} generado`);
        if (id === 'asm') setStage((s) => Math.max(s, STAGE.ASM));
      } else if (id === 'build') {
        if (result.asm) setResults((r) => ({ ...r, asm: { status: 'ok', text: result.asm } }));
        downloadBinary(result.executable, result.fileName || 'programa');
        print('ok', `✔ ${result.output} Descargado como “${result.fileName || 'programa'}”.`);
        setStage(STAGE.BUILT);
      } else {
        print('program', result.output || '(el programa no imprimió nada)');
        print('ok', '✔ Ejecución terminada');
      }
    } finally {
      setBusy(null);
    }
  }, [busy, stage, code, stdin, notify, print, reportErrors]);

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
    editor.onDidChangeCursorPosition((e) => setCursor({ line: e.position.lineNumber, column: e.position.column }));
    editor.focus();
  };

  const handleChange = (value) => {
    setCode(value ?? '');
    setDirty(true);
    resetPipeline(); // las líneas marcadas y los pasos hechos ya no corresponden al código editado
  };

  // ---------- Render ----------
  const steps = STEPS.map((s) => ({
    ...s,
    enabled: stage >= s.needs,
    title: stage >= s.needs ? s.label : s.missing,
  }));
  const busyText = busy === 'check' ? 'Validando…' : STEPS.find((s) => s.id === busy)?.status;

  return (
    <div className="app">
      <Toolbar
        busy={busy}
        steps={steps}
        onOpen={openFile}
        onSave={save}
        onLoadExample={loadExample}
        onValidate={validate}
        onStep={runStep}
        onAbout={() => setShowAbout(true)}
      />
      <input ref={fileInputRef} type="file" accept=".bml" hidden onChange={handleFileChosen} />

      <main className="workspace">
        <section className="editor-pane">
          <div className="pane-title">
            <span data-testid="file-name">
              {fileName}
              {dirty && <span className="dirty" title="Cambios sin guardar"> ● sin guardar</span>}
            </span>
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
            { id: 'tac', label: 'Código intermedio', content: <ResultView result={results.tac} what="El código intermedio" action="Código intermedio" /> },
            { id: 'asm', label: 'NASM', content: <ResultView result={results.asm} what="El código NASM" action="Código NASM" /> },
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
                <div className="console" data-testid="console">
                  {log.length === 0 && <div className="muted">Presiona “Validar” (F5) para analizar el programa.</div>}
                  {log.map((entry) => (
                    <div
                      key={entry.id}
                      className={`log log-${entry.type}${entry.line ? ' clickable' : ''}`}
                      onClick={entry.line ? () => goToLine(entry.line) : undefined}
                      title={entry.line ? 'Ir a la línea' : undefined}
                    >
                      <span className="time">[{entry.time}]</span>
                      {entry.type === 'raw' || entry.type === 'program' ? <pre>{entry.text}</pre> : <span>{entry.text}</span>}
                    </div>
                  ))}
                  <div ref={logEndRef} />
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
                  placeholder="Valores para READ al ejecutar el programa, uno por línea."
                  spellCheck={false}
                />
              ),
            },
          ]}
        />
      </main>

      <footer className="statusbar">
        <span className={`status ${busy ? 'busy' : 'ready'}`} data-testid="status">
          <span className="dot" /> {busy ? busyText : 'Listo'}
        </span>
        <span title={health?.bmlangPath}>
          {health == null ? 'Comprobando analizador…' : health.ok ? `Analizador: bmlang (${health.mode})` : 'Analizador no disponible'}
        </span>
        <span className="spacer" />
        {dirty && <span>● Sin guardar</span>}
        <span>Ln {cursor.line}, Col {cursor.column}</span>
        <span>BMLang</span>
      </footer>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {toast && <div className="toast" key={toast.id} role="status">{toast.text}</div>}
    </div>
  );
}
