import telnetlib from 'telnetlib'
import cache from '../cache.mjs'
import config from '../config.mjs'

// console.log(JSON.stringify(config, null, 2))

const COMMANDS = Object.freeze([
  {
    name: 'config',
    description: 'dump config',
    action(connection, data) {
      connection.write(JSON.stringify(config, null, 2) + '\n')
      return ""
    }
  },
  {
    name: 'cache',
    description: 'dump dns cache',
    action(connection, data) {
      connection.write(JSON.stringify(cache, null, 2) + '\n')
      return ""
    }
  },
  {
    name: 'quit',
    description: 'close telnet connection',
    action(connection, data) {
      connection.end()
      return ""
    }
  },
  {
    name: 'reload',
    description: 'reload config',
    action(connection, data) {
      connection.write('not implemented\n')
      return ""
    }
  },
])

let connHandler = (c) => {
  c.on('negotiated', () => {
    for (let cmd of COMMANDS) {
      c.write(`${cmd.name} -> ${cmd.description}\n`)
    }
  });

  c.on('data', (data) => {
    let command = String(data).toLowerCase().trim()
    for (let cmd of COMMANDS) {
      if (cmd.name === command) {
        cmd.action(c, data)
        return
      }
    }
    c.write(`unknown command ${command}\n`)
  });
  c.on('close', (data) => {
    console.log(`close: ${data}`)
  })
  console.log(Object.keys(c))
  console.log(c)
}

let addressList = config.telnetServerAddresses || []

if (addressList.length == 0) {
  console.error('None telnet addresses specified')
} else {
  for (let telnetAddress of new Set(addressList)) {
    let parts = telnetAddress.split(':')
    let host = parts[0]
    let port = parts[1] || 10024
    const server = telnetlib.createServer({}, connHandler);
    server.listen(port, host);
    console.log(`listening on ${host}:${port}`)
  }
}