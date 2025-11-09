/**
 * MAX Bridge утилиты для работы с MAX Mini App
 * Документация: https://dev.max.ru/docs/webapps/bridge
 */

/**
 * Получение initData для авторизации
 * @returns {string} - строка initData
 */
export function getInitData() {
  if (typeof window === 'undefined') return ''
  
  const WebApp = window.WebApp
  if (!WebApp) {
    console.warn('[MAX Bridge] WebApp не найден. Возможно, приложение открыто не в MAX.')
    return ''
  }

  // Разные версии API могут использовать разные имена
  return WebApp.InitData || WebApp.initData || ''
}

/**
 * Получение информации о пользователе
 * @returns {object|null} - данные пользователя
 */
export function getUserInfo() {
  if (typeof window === 'undefined') return null
  
  const WebApp = window.WebApp
  if (!WebApp) return null

  return WebApp.initDataUnsafe?.user || null
}

/**
 * Проверка, открыто ли приложение в MAX
 * @returns {boolean}
 */
export function isInMaxApp() {
  return typeof window !== 'undefined' && !!window.WebApp
}

/**
 * Закрытие мини-приложения
 */
export function closeApp() {
  if (window.WebApp?.close) {
    window.WebApp.close()
  }
}

/**
 * Показ главной кнопки MAX
 */
export function showMainButton(text, onClick) {
  const WebApp = window.WebApp
  if (!WebApp?.MainButton) return

  WebApp.MainButton.setText(text)
  WebApp.MainButton.onClick(onClick)
  WebApp.MainButton.show()
}

/**
 * Скрытие главной кнопки MAX
 */
export function hideMainButton() {
  if (window.WebApp?.MainButton) {
    window.WebApp.MainButton.hide()
  }
}

/**
 * Отправка initData на backend для авторизации
 */
export async function authenticateUser(apiBase) {
  const initData = getInitData()
  
  if (!initData) {
    console.warn('[MAX] InitData пуст. Авторизация пропущена.')
    return null
  }

  try {
    const response = await fetch(`${apiBase}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ initData })
    })

    if (!response.ok) {
      console.error('[MAX] Ошибка авторизации:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[MAX] Ошибка запроса авторизации:', error)
    return null
  }
}

/**
 * Уведомление о готовности приложения
 */
export function ready() {
  if (window.WebApp?.ready) {
    window.WebApp.ready()
  }
}

/**
 * Развернуть приложение на весь экран
 */
export function expand() {
  if (window.WebApp?.expand) {
    window.WebApp.expand()
  }
}

