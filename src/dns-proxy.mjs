import packet from 'native-dns-packet'
import dgram from 'dgram'
import config from './config.mjs'
import { logdebug, logerror, loginfo, logquery } from './logger.mjs'
import axios from 'axios'
import { getType, toHexString, CODE_TO_RR_TYPE } from './utils.mjs'
import './telnet.mjs'
import { addToCache, getFromCache } from './cache.mjs'
const dohUrl = 'https://cloudflare-dns.com/dns-query'
const axiosOptions = { headers: { 'Content-Type': 'application/dns-message' }, responseType: 'arraybuffer' }

let addressList = config.dnsListenAddresses || ['0.0.0.0:10053']
if (addressList.length == 0) {
  logerror('listen addresses not specified. Exiting')
  process.exit(5)
}

const errorHandler = (err) => logerror(err)
const createListeningHandler = (host, port) => () => loginfo('dns: listening on %s:%s', host, port)

function createMessageHandler(server) {
  return (query, rInfo) => {
    let queryParsed = packet.parse(query)
    logquery(
      '%s query for %s from %s:%s',
      CODE_TO_RR_TYPE[queryParsed.question[0].type],
      queryParsed.question[0].name,
      rInfo.address,
      rInfo.port
    )
    logdebug('parsed query %s', JSON.stringify(queryParsed, null, 2))
    let answer = getFromCache(query, queryParsed)
    if (answer) {
      logdebug('serving from cache')
      server.send(answer, rInfo.port, rInfo.address)
      return
    }
    
    axios
      .post(dohUrl, query, axiosOptions)
      .then((answer) => {
        answer = answer.data
        logdebug('answer is %s of type %s', toHexString(answer), getType(answer))
        server.send(answer, rInfo.port, rInfo.address)
        let answerParsed = packet.parse(answer)
        logdebug('parsed answer is %s', JSON.stringify(answerParsed, null, 2))
        addToCache(answer, answerParsed)
      })
      .catch((err) => {
        logerror('ERROR: %j', err)
        const errorResponse = Buffer.from([])
        server.send(errorResponse, rInfo.port, rInfo.address, (sendErr) => {
          if (sendErr) {
            console.error('error sending empty answer: ', sendErr)
          }
        })
      })
  }
}

//

// function createMessageHandler(server) {
//   return (message, rInfo) => {
//     let encodedUri = message.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '%3D')
//     logdebug('query is %j of type %s', toHexString(message), getType(message))
//     axios
//       .get(`${dohUrl}?dns=${encodedUri}`)
//       .then((response) => {
//         let responseBody = response.data
//         logdebug(
//           'answer is\n',
//           responseBody,
//           '(',
//           getType(responseBody),
//           ')\n',
//           toHexString(responseBody),
//           ' (',
//           getType(Buffer.from(responseBody)),
//           ')'
//         )
//         let finalAnswer = Buffer.from(responseBody)
//         logdebug('sending %j of lenght %d to %s:%s', finalAnswer, finalAnswer.length, rInfo.address, rInfo.port)
//         server.send(finalAnswer, 0, finalAnswer.length, rInfo.port, rInfo.address)
//         // try {
//         //   const query = packet.parse(message)
//         //   logdebug('parsed query %s', JSON.stringify(query, null, 2))
//         // } catch (e) {
//         //   logerror(`error parsing query: ${e}`)
//         // }
//         // try {
//         //   const answer = packet.parse(Buffer.from(resp.data))
//         //   logdebug('parsed answer %s', JSON.stringify(answer, null, 2))
//         // } catch (e) {
//         //   logerror(`error parsing answer: ${e}`)
//         // }
//       })
//       .catch((err) => logerror('ERROR: %j', err))
//   }
// }

for (let address of addressList) {
  let parts = address.split(':')
  let host = parts[0]
  let port = parts[1] || 10053
  const server = dgram.createSocket('udp4')

  server.on('listening', createListeningHandler(host, port))
  server.on('error', errorHandler)
  server.on('message', createMessageHandler(server))
  server.bind(port, host)
}

// axios
//   .get(`${dohUrl}?dns=AAABAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB`)
//   .then((resp) => {
//     logdebug('got answer', resp)
//     logdebug('typeof data:', typeof resp.data)
//     const answer = packet.parse(resp.data)
//     logdebug('parsed answer %s', JSON.stringify(answer, null, 2))
//   })
//   .catch((err) => logerror('ERROR: %j', err))

// let packetB64 = 'AAABAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB'
// let rawPacket = fromBase64(packetB64)
// console.log(rawPacket)
// let parsedPacket = packet.parse(rawPacket)
// logdebug('parsed packet %j', parsedPacket)

// query for example.com (from Rfc) <Buffer 00 00 01 00 00 01 00 00 00 00 00 00 03 77 77 77 07 65 78 61 6d 70 6c 65 03 63 6f 6d 00 00 01 00 01>
// query for example.com (from dig) [76,151,1,32,0,1,0,0,0,0,0,1,3,119,119,119,7,101,120,97,109,112,108,101,3,99,111,109,0,0,1,0,1,0,0,41,4,208,0,0,0,0,0,12,0,10,0,8,48,139,136,166,131,100,124,185]
