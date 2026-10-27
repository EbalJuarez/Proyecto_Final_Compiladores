/** Panel con pestañas simples. `tabs`: [{ id, label, content }] */
export default function Tabs({ tabs, active, onChange, className = '' }) {
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <section className={`panel ${className}`}>
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === current.id}
            className={t.id === current.id ? 'active' : ''}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="panel-body" role="tabpanel">{current.content}</div>
    </section>
  );
}
