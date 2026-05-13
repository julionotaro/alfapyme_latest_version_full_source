export function List({ title, rows, cols }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      {rows.length ? (
        rows.map((row) => (
          <div className="row" key={row.id}>
            {cols.map((col) => (
              <span key={col}>{String(row[col] ?? '')}</span>
            ))}
          </div>
        ))
      ) : (
        <p>Sin registros.</p>
      )}
    </section>
  )
}
