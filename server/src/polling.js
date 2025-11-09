import 'dotenv/config'
import { handleBotEvent } from './max.js'

const MAX_API_BASE = process.env.MAX_API_BASE || 'https://platform-api.max.ru'
const MAX_BOT_TOKEN = process.env.MAX_BOT_TOKEN

let lastMarker = null
let isPolling = false

/**
 * Получение обновлений через Long Polling
 */
async function getUpdates() {
  if (!MAX_BOT_TOKEN) {
    console.error('[Polling] Токен бота не настроен')
    return null
  }

  try {
    console.log('[Polling] Токен (первые 10 символов):', MAX_BOT_TOKEN.substring(0, 10))
    
    const params = new URLSearchParams({
      limit: '100',
      timeout: '30'
    })

    // Добавляем marker если есть
    if (lastMarker !== null) {
      params.append('marker', lastMarker.toString())
    }

    const url = `${MAX_API_BASE}/updates?${params.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': MAX_BOT_TOKEN
      }
    })

    if (!response.ok) {
      console.error('[Polling] Ошибка HTTP:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    
    // Обновляем marker для следующего запроса
    if (data.marker !== undefined && data.marker !== null) {
      lastMarker = data.marker
    }

    return data.updates || []
  } catch (error) {
    console.error('[Polling] Ошибка запроса:', error.message)
    return null
  }
}

/**
 * Запуск цикла опроса
 */
export async function startPolling() {
  if (isPolling) {
    console.log('[Polling] Уже запущен')
    return
  }

  isPolling = true
  console.log('[Polling] 🔄 Запуск Long Polling для MAX Bot...')
  console.log('[Polling] Ожидание событий...')

  while (isPolling) {
    try {
      const updates = await getUpdates()

      if (updates && updates.length > 0) {
        console.log(`[Polling] 📨 Получено обновлений: ${updates.length}`)

        // Обрабатываем каждое обновление
        for (const update of updates) {
          try {
            await handleBotEvent(update)
          } catch (error) {
            console.error('[Polling] Ошибка обработки события:', error)
          }
        }
      }

      // Небольшая пауза между запросами (если timeout не сработал)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('[Polling] Ошибка в цикле опроса:', error)
      // Пауза перед повтором при ошибке
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

/**
 * Остановка опроса
 */
export function stopPolling() {
  console.log('[Polling] 🛑 Остановка Long Polling...')
  isPolling = false
}

// Graceful shutdown
process.on('SIGINT', () => {
  stopPolling()
  process.exit(0)
})

process.on('SIGTERM', () => {
  stopPolling()
  process.exit(0)
})

