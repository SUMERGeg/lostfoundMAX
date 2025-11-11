import crypto from 'node:crypto'

const SECRET_KEY = resolveSecretKey(process.env.SECRETS_KEY)
const SECRET_ALGO = 'aes-256-gcm'
const IV_LENGTH = 12

function resolveSecretKey(source) {
  if (!source) {
    console.warn('[security] SECRETS_KEY не задан — секреты будут храниться без шифрования.')
    return null
  }

  const trimmed = source.trim()

  try {
    if (/^[0-9a-f]{64}$/i.test(trimmed)) {
      return Buffer.from(trimmed, 'hex')
    }

    if (trimmed.length === 32) {
      return Buffer.from(trimmed, 'utf8')
    }

    const base64 = Buffer.from(trimmed, 'base64')
    if (base64.length === 32) {
      return base64
    }
  } catch (error) {
    console.error('[security] Не удалось разобрать SECRETS_KEY:', error)
    return null
  }

  console.error('[security] Неверный формат SECRETS_KEY. Используйте 32-байтовый ключ (hex, base64 или ASCII).')
  return null
}

export function encryptSecrets(values = []) {
  return values
    .filter(value => typeof value === 'string')
    .map(value => value.trim())
    .filter(value => value.length > 0)
    .map(value => encryptSecret(value))
}

export function encryptSecret(value) {
  if (!SECRET_KEY) {
    return {
      type: 'plain',
      value
    }
  }

  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(SECRET_ALGO, SECRET_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    type: SECRET_ALGO,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64')
  }
}

export function isEncryptionEnabled() {
  return Boolean(SECRET_KEY)
}



