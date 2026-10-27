import { useEffect } from 'react';
import { COURSE, TEAM } from '../team.js';

export default function AboutModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="about-title" onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="about-title">Acerca de BMLang IDE</h2>
        <p className="muted">{COURSE}</p>
        <table className="team">
          <thead>
            <tr>
              <th>Integrante</th>
              <th>Carné</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m) => (
              <tr key={m.carne}>
                <td>{m.name}</td>
                <td>{m.carne}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal-actions">
          <button type="button" className="primary" onClick={onClose} autoFocus>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
