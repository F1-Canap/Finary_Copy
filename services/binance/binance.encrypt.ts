import crypto from "crypto"

const ALGO = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

const getKey = () => {
  const key = process.env.BINANCE_ENCRYPTION_KEY
  if (!key) throw new Error("BINANCE_ENCRYPTION_KEY manquant dans .env")
  return crypto.createHash("sha256").update(key).digest()
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString("base64")
}

export function decrypt(encryptedText: string): string {
  const data = Buffer.from(encryptedText, "base64")
  const iv = data.subarray(0, IV_LENGTH)
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString("utf8")
}
