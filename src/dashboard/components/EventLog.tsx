import { useEffect, useRef } from "react"

export default function EventLog({ events }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0
  }, [events])

  return (
    <div ref={ref} className="max-h-80 overflow-y-auto text-xs space-y-1 bg-muted p-2 rounded">
      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sem eventos ainda...</p>
      ) : (
        events.map((e, i) => (
          <pre key={i} className="bg-card p-1 rounded border border-border">
            {JSON.stringify(e, null, 2)}
          </pre>
        ))
      )}
    </div>
  )
} 
