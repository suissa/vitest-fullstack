import neo4j from "neo4j-driver"

const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687"
const NEO4J_USER = process.env.NEO4J_USER || "neo4j"
const NEO4J_PASS = process.env.NEO4J_PASS || "password"

let driver: neo4j.Driver | null = null

export async function connectGraph() {
  if (!driver) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS))
    console.log("🧩 Conectado ao Neo4j com sucesso.")
  }
  return driver
}

/**
 * Salva uma entrada de memória como grafo:
 * (Prompt)-[:GENERATED]->(Patch)-[:APPLIED_TO]->(TestFile)
 */
export async function saveGraphMemory(entry: any) {
  const driver = await connectGraph()
  const session = driver.session()

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (p:Prompt {hash: $hash})
        SET p.text = $prompt, p.timestamp = $timestamp

        MERGE (f:TestFile {path: $testFile})
        MERGE (p)-[:GENERATED]->(f)

        FOREACH (patch IN $patches |
          MERGE (c:Patch {id: patch.id})
          SET c.diff = patch.diff, c.timestamp = $timestamp
          MERGE (p)-[:CREATED]->(c)
          MERGE (c)-[:APPLIED_TO]->(f)
        )
      `,
        {
          hash: createHash(entry.prompt),
          prompt: entry.prompt,
          testFile: entry.testFile,
          patches: entry.patches.map((p: string, i: number) => ({
            id: `${entry.testFile}-${i}`,
            diff: p,
          })),
          timestamp: entry.timestamp,
        },
      )
    })
  } catch (err) {
    console.error("❌ Erro ao gravar no Neo4j:", err)
  } finally {
    await session.close()
  }
}

function createHash(str: string) {
  const crypto = await import("crypto")
  return crypto.createHash("sha1").update(str).digest("hex")
}
