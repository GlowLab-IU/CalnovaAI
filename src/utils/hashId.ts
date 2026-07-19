// A simple custom obfuscation algorithm for numeric IDs
const SECRET_SALT = 987654321; // Large number for XOR obfuscation

export function encodeId(id: number): string {
  if (!id || isNaN(id)) return "";
  // XOR the ID with the salt
  const cipher = id ^ SECRET_SALT;
  // Convert cipher to base36 to get a nice short string (e.g. "gc4tcs")
  return cipher.toString(36);
}

export function decodeId(hash: string): number | null {
  if (!hash) return null;
  try {
    const cipher = parseInt(hash, 36);
    if (isNaN(cipher)) return null;
    const id = cipher ^ SECRET_SALT;
    // Check if ID is a positive integer
    if (id <= 0 || isNaN(id)) return null;
    return id;
  } catch (e) {
    return null;
  }
}
