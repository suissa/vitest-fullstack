export default async function sumAction({ a, b }: { a: number; b: number }) {
  if (typeof a !== "number" || typeof b !== "number")
    throw new Error("Both 'a' and 'b' must be numbers")
  return { result: a + b }
}
