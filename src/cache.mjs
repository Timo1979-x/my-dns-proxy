import packet from 'native-dns-packet'
import { CODE_TO_RR_TYPE } from './utils.mjs'
import { logdebug, logerror } from './logger.mjs'
/**
 * cached DNS records
 * format:
 * @example
 * {
 *   A: {
 *     "example.com": { // DNS host name
 *       expires: 1736256104062, // milliseconds from UNIX era
 *       values: ['1.2.3.4', '4.3.2.1'], // values (ip addresses or names or text or something else)
 *       payload: <Buffer> // answer from upstream DNS server
 *     }
 *   }
 * }
 */
const cache = {
  A: {},
  AAAA: {},
  PTR: {},
  MX: {},
  NS: {},
}

/**
 * adds records to DNS cache (only A, AAAA, MX, NS and PTR).
 * @param {Buffer} payload answer from upstream dns server
 * @param {Object} parsedPayload answer from upstream dns server in the form of JS object. if it presents, payload is not parsed again
 * @returns newly added cache record
 */
export function addToCache(payload, parsedPayload) {
  parsedPayload = parsedPayload || packet.parse(payload)
  if (parsedPayload.answer.length === 0) return null
  let type = CODE_TO_RR_TYPE[parsedPayload.answer[0].type]
  if (typeof type === 'undefined') return null

  let name = parsedPayload.answer[0].name
  let expires = Date.now() + parsedPayload.answer[0].ttl * 1000

  let result = { expires, payload }
  if (process.env.DEBUG) {
    result = {
      ...result,
      values: parsedPayload.answer.map((e) => e.address || e.exchange || e.data),
      expiresText: new Date(expires).toISOString(),
    }
  }
  cache[type][name] = result
  return result
}

export function purgeCache() {
  let timeline = new Date().getTime()
  for (let type of Object.keys(cache)) {
    for (let name of Object.keys(cache[type])) {
      if (cache[type][name].expiration < timeline) {
        delete cache[type][name]
      }
    }
  }
}
export default cache

// setInterval(() => {
//   try {
//     purgeCache()
//     logdebug('cache purged')
//   } catch (e) {
//     logerror('cache purge error: %j ', e)
//   }
// }, 10 * 60 * 1000)

// A: name, type, ttl, address
// AAAA: name, type, ttl, address
// MX: name, type, ttl, exchange
// NS: name, type, ttl, data
// PTR: name, type, ttl, data
