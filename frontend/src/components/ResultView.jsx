import Editor from '@monaco-editor/react';
import { registerBmlang, THEME_ID } from '../editor/bmlangLanguage.js';

const READ_ONLY = {
  readOnly: true,
  domReadOnly: true,
  fontSize: 13,
  lineNumbers: 'on',
  minimap: { enabled: false },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  renderLineHighlight: 'none',
};

/**
 * Resultado de una fase (TAC o NASM) en un Monaco de solo lectura.
 * `result`: { status: 'empty' | 'pending' | 'error' | 'ok', text }
 */
export default function ResultView({ result, what, action }) {
  if (result.status === 'ok') {
    return (
      <div className="result-editor" data-testid="result-editor">
        <Editor value={result.text} language="plaintext" theme={THEME_ID} beforeMount={registerBmlang} options={READ_ONLY} />
      </div>
    );
  }
  return (
    <div className="placeholder">
      {result.status === 'pending' && (
        <>
          <p className="log-hint">Generador aún no implementado</p>
          <p className="muted">{what} aparecerá aquí cuando <code>bmlang</code> soporte la opción.</p>
        </>
      )}
      {result.status === 'error' && (
        <>
          <p className="log-error">No se pudo generar {what.toLowerCase()}.</p>
          <p className="muted">Revisa los errores en la consola.</p>
        </>
      )}
      {result.status === 'empty' && (
        <>
          <p>{what} aparecerá aquí.</p>
          <p className="muted">Valida el programa y presiona “{action}”.</p>
        </>
      )}
    </div>
  );
}
