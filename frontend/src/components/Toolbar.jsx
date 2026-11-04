import { useEffect, useRef, useState } from 'react';
import { EXAMPLES } from '../examples.js';

function Logo() {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="logo-placeholder" title="Coloca el logo en frontend/public/logo-umes.png">
        UMES
      </div>
    );
  }
  return <img className="logo" src="/logo-umes.png" alt="Universidad Mesoamericana" onError={() => setFailed(true)} />;
}

function ExamplesMenu({ disabled, onLoad }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button type="button" disabled={disabled} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Cargar ejemplo ▾
      </button>
      {open && (
        <ul className="menu-list" role="menu">
          {EXAMPLES.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLoad(ex);
                }}
              >
                <strong>{ex.name}</strong>
                <span>{ex.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * `steps`: botones de generación en orden [{ id, label, busyLabel, enabled, title }].
 * Un paso se habilita cuando el anterior terminó bien para el código actual.
 */
export default function Toolbar({ busy, steps, onOpen, onSave, onLoadExample, onValidate, onStep, onAbout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <Logo />
        <h1>BMLang IDE</h1>
      </div>

      <nav className="actions">
        <div className="group">
          <button type="button" disabled={Boolean(busy)} onClick={onOpen} title="Abrir archivo .bml (Ctrl+O)">Abrir</button>
          <button type="button" disabled={Boolean(busy)} onClick={onSave} title="Guardar como .bml (Ctrl+S)">Guardar</button>
          <ExamplesMenu disabled={Boolean(busy)} onLoad={onLoadExample} />
        </div>

        <div className="group">
          <button type="button" className="primary" disabled={Boolean(busy)} onClick={onValidate} title="Análisis léxico y sintáctico (F5)">
            {busy === 'check' ? 'Validando…' : 'Validar'}
          </button>
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              data-step={step.id}
              disabled={Boolean(busy) || !step.enabled}
              onClick={() => onStep(step.id)}
              title={step.title}
            >
              {busy === step.id ? step.busyLabel : step.label}
            </button>
          ))}
        </div>

        <div className="group">
          <button type="button" onClick={onAbout}>Acerca de</button>
        </div>
      </nav>
    </header>
  );
}
