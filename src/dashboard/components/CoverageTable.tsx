export default function CoverageTable({ coverage }) {
  if (!coverage?.length) return <p>Nenhum dado de cobertura encontrado.</p>
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b bg-muted/40">
          <th className="text-left p-1">Arquivo</th>
          <th>Stmts</th>
          <th>Funcs</th>
          <th>Branches</th>
          <th>Lines</th>
        </tr>
      </thead>
      <tbody>
        {coverage.map((c, i) => (
          <tr key={i} className="border-b hover:bg-muted/20">
            <td className="text-left p-1">{c.file}</td>
            <td>{c.statements}%</td>
            <td>{c.functions}%</td>
            <td>{c.branches}%</td>
            <td>{c.lines}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
} 
