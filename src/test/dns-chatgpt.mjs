import dgram from 'dgram'
import axios from 'axios'

const DNS_PORT = 10053 // UDP порт для получения запросов
const DOH_SERVER = 'https://cloudflare-dns.com/dns-query'

// Создаем UDP-сервер
const server = dgram.createSocket('udp4')

// Обрабатываем входящие сообщения
server.on('message', async (msg, rinfo) => {
  console.log(`Получен DNS-запрос от ${rinfo.address}:${rinfo.port}`)

  try {
    // Отправляем запрос к Cloudflare DoH
    const response = await axios.post(DOH_SERVER, msg, {
      headers: {
        'Content-Type': 'application/dns-message',
      },
      responseType: 'arraybuffer', // Получаем бинарные данные
    })

    // Отправляем ответ клиенту
    server.send(response.data, rinfo.port, rinfo.address, (err) => {
      if (err) {
        console.error('Ошибка отправки ответа:', err)
      } else {
        console.log('Ответ отправлен клиенту.')
      }
    })
  } catch (err) {
    console.error('Ошибка DoH-запроса:', err.message)

    // Отправляем пустой ответ клиенту в случае ошибки
    const errorResponse = Buffer.from([])
    server.send(errorResponse, rinfo.port, rinfo.address, (sendErr) => {
      if (sendErr) {
        console.error('Ошибка отправки пустого ответа:', sendErr)
      }
    })
  }
})

// Запуск сервера
server.on('listening', () => {
  const address = server.address()
  console.log(`DNS-прокси запущен на ${address.address}:${address.port}`)
})

server.on('error', (err) => {
  console.error('Ошибка сервера:', err)
  server.close()
})

// Слушаем порт 53
server.bind(DNS_PORT)
