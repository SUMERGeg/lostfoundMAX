import 'dotenv/config'

const MAX_API_BASE = process.env.MAX_API_BASE || 'https://platform-api.max.ru'
const MAX_BOT_TOKEN = process.env.MAX_BOT_TOKEN

/**
 * Отправка сообщения пользователю через MAX Bot API
 */
export async function sendMessage(userId, text, buttons = null) {
  if (!MAX_BOT_TOKEN) {
    console.error('[MAX] Токен бота не настроен')
    return null
  }

  const body = {
    text: text
  }

  if (buttons) {
    // Buttons в attachments как inline_keyboard
    body.attachments = [{
      type: 'inline_keyboard',
      payload: {
        buttons: [buttons.map(btn => ({
          type: 'link',
          text: btn.text,
          url: btn.url
        }))]
      }
    }]
  }

  try {
    const response = await fetch(`${MAX_API_BASE}/messages?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MAX_BOT_TOKEN
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[MAX] Ошибка отправки сообщения:', error)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[MAX] Ошибка запроса:', error)
    return null
  }
}

/**
 * Обработка событий от MAX Bot
 */
export async function handleBotEvent(update) {
  const type = update?.type ?? 'unknown'
  console.log(`[MAX] Событие: ${type}`, update)

  switch (type) {
    case 'bot_started': {
      // Новый пользователь запустил бота
      const userId = update?.user?.id
      if (userId) {
        console.log('[MAX] Новый пользователь:', userId)
        
        // Приветствуем и отправляем кнопку для запуска мини-приложения
        const frontUrl = process.env.FRONT_ORIGIN || 'http://localhost:5173'
        await sendMessage(
          userId,
          '👋 Добро пожаловать в Lost&Found!\n\nЗдесь вы можете найти потерянные вещи или помочь вернуть находки владельцам.',
          [{
            text: '🗺️ Открыть карту',
            url: frontUrl
          }]
        )
      }
      break
    }

    case 'message_created': {
      // Получено текстовое сообщение
      const message = update?.message
      const userId = message?.from_id
      const text = message?.text || ''

      console.log('[MAX] Сообщение от', userId, ':', text)

      // Простая обработка команд (пока без FSM)
      if (text === '/start' || text.toLowerCase() === 'старт') {
        const frontUrl = process.env.FRONT_ORIGIN || 'http://localhost:5173'
        await sendMessage(
          userId,
          'Используйте кнопку ниже для открытия мини-приложения:',
          [{
            text: '🗺️ Открыть Lost&Found',
            url: frontUrl
          }]
        )
      } else {
        // TODO: Добавить FSM для обработки диалогов
        await sendMessage(
          userId,
          'Пока я не умею обрабатывать сообщения. Используйте мини-приложение! 😊'
        )
      }
      break
    }

    case 'message_callback': {
      // Нажатие на inline-кнопку
      console.log('[MAX] Callback:', update?.callback)
      break
    }

    default:
      console.log('[MAX] Неизвестное событие:', type)
  }
}

