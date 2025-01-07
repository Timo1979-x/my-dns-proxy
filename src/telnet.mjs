import telnetlib from 'telnetlib'
import cache, { purgeCache } from './cache.mjs'
import config from './config.mjs'
import { loginfo } from './logger.mjs'

const COMMANDS = Object.freeze(
  [
    {
      name: ['help', 'h', '?'],
      description: 'show command list',
      action(connection, data) {
        printUsage(connection)
        return ''
      },
    },
    {
      name: ['config', 'co'],
      description: 'dump config',
      action(connection, data) {
        connection.write(JSON.stringify(config, null, 2) + '\n')
        return ''
      },
    },
    {
      name: ['cache', 'ca'],
      description: 'dump dns cache',
      action(connection, data) {
        connection.write(JSON.stringify(cache, null, 2) + '\n')
        return ''
      },
    },
    {
      name: ['quit', 'q'],
      description: 'close telnet connection',
      action(connection, data) {
        connection.end()
        return ''
      },
    },
    {
      name: ['reload', 'r'],
      description: 'reload config',
      action(connection, data) {
        connection.write('not implemented\n')
        return ''
      },
    },
    {
      name: ['purge', 'p'],
      description: 'purge old records from cache',
      action(connection, data) {
        try {
          purgeCache()
          connection.write('cache purged\n')
        } catch (e) {
          connection.write('error:\n' + JSON.stringify(e, null, 2) + '\n')
        }
        return ''
      },
    },
  ].map((e) => {
    if (typeof e.name === 'string') {
      return { ...e, name: [e.name] }
    } else {
      return e
    }
  })
)

function printUsage(c) {
  for (let cmd of COMMANDS) {
    c.write(`${cmd.name} -> ${cmd.description}\n`)
  }
}

let connHandler = (c) => {
  c.on('negotiated', () => {
    printUsage(c)
  })

  c.on('data', (data) => {
    let command = String(data).toLowerCase().trim()
    if (command === '') return
    for (let cmd of COMMANDS) {
      if (cmd.name.includes(command)) {
        cmd.action(c, data)
        return
      }
    }
    c.write(`unknown command ${command}\n`)
  })

  c.on('close', () => console.log('telnet connection closed'))
}

let addressList = config.telnetServerAddresses || []
if (addressList.length == 0) {
  console.error('None telnet addresses specified')
} else {
  for (let telnetAddress of new Set(addressList)) {
    let parts = telnetAddress.split(':')
    let host = parts[0]
    let port = parts[1] || 10024
    const server = telnetlib.createServer({}, connHandler)
    server.listen(port, host)
    loginfo(`telnet: listening on ${host}:${port}`)
  }
}