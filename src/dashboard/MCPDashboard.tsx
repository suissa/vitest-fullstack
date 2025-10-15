import { useEffect, useState } from 'react' import { Button } from '@/components/ui/button' import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs' import { Input } from '@/components/ui/input' import { io } from 'socket.io-client'

export default function MCPDashboard() { const [tab, setTab] = useState('tests') const [events, setEvents] = useState([]) const [file, setFile] = useState('') const [prompt, setPrompt] = useState('') const [coverage, setCoverage] = useState([])

useEffect(() => { const socket = io('ws://localhost:5051') socket.on('connect', () => console.log('🔌 Connected to MCP WS')) socket.on('message', (msg) => { const event = JSON.parse(msg) setEvents((prev) => [event, ...prev]) if (event.type === 'coverage:update') setCoverage(event.payload.summary) }) return () => socket.close() }, [])

async function run(type) { await fetch('http://localhost:5050/mcp/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file, type }) }) }

async function edit() { await fetch('http://localhost:5050/mcp/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file, prompt }) }) }

return ( <div className="p-6 space-y-4"> <h1 className="text-2xl font-bold">MCP Dashboard ⚙️</h1> <Tabs value={tab} onValueChange={setTab}> <TabsList> <TabsTrigger value="tests">Tests</TabsTrigger> <TabsTrigger value="coverage">Coverage</TabsTrigger> <TabsTrigger value="events">Events</TabsTrigger> </TabsList>

<TabsContent value="tests">
      <Card>
        <CardHeader>
          <CardTitle>Run / Edit Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="path/to/test.ts" value={file} onChange={(e) => setFile(e.target.value)} />
          <Input placeholder="prompt for edit" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => run('unit')}>Run Unit</Button>
            <Button onClick={() => run('integration')}>Run Integration</Button>
            <Button onClick={() => run('e2e')}>Run E2E</Button>
            <Button variant="secondary" onClick={edit}>Edit w/ LLM</Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="coverage">
      <Card>
        <CardHeader>
          <CardTitle>Coverage Report</CardTitle>
        </CardHeader>
        <CardContent>
          {coverage.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b"><th>File</th><th>Stmts</th><th>Funcs</th><th>Branches</th><th>Lines</th></tr>
              </thead>
              <tbody>
                {coverage.map((c, i) => (
                  <tr key={i} className="border-b">
                    <td>{c.file}</td>
                    <td>{c.statements}%</td>
                    <td>{c.functions}%</td>
                    <td>{c.branches}%</td>
                    <td>{c.lines}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No coverage data yet.</p>
          )}
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="events">
      <Card>
        <CardHeader><CardTitle>Real-time Events</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto text-xs space-y-1">
            {events.map((e, i) => (
              <pre key={i} className="bg-muted p-1 rounded">{JSON.stringify(e, null, 2)}</pre>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>

) }

