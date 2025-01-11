import packet from 'native-dns-packet'
import { CODE_TO_RR_TYPE, CACHEABLE_RR_CODES, CACHEABLE_RR_TYPES } from './utils.mjs'
import { logdebug, logerror, loginfo } from './logger.mjs'
import { modifyRoutes } from './net.mjs'
/**
 * cached DNS records
 * format:
 * @example
 * {
 *   A: { // type of DNS request (A, AAAA)
 *     "example.com": { // DNS host name
 *       expires: 1736256104062, // milliseconds from UNIX era
 *       payload: <Buffer> // answer from upstream DNS server
 *     }
 *   }
 * }
 */
const cache = Object.freeze(
  Object.fromEntries(CACHEABLE_RR_TYPES.map((key) => [key, {}]))
)

/**
 * adds records to DNS cache (only A, AAAA, MX, NS and PTR).
 * @param {Buffer} payload answer from upstream dns server
 * @param {Object} parsedPayload answer from upstream dns server in the form of JS object. if it presents, payload is not parsed again
 * @returns newly added cache record
 */
export function addToCache(payload, parsedPayload) {
  parsedPayload = parsedPayload || packet.parse(payload)
  if (parsedPayload.answer.length === 0) return null
  let type = parsedPayload.answer.find((el) => CACHEABLE_RR_CODES.includes(Number(el.type)))
  logdebug(type)
  if(!type) return null
  type = CODE_TO_RR_TYPE[type.type]
  logdebug('caching %s anwer for %s', CODE_TO_RR_TYPE[parsedPayload.question[0].type], parsedPayload.question[0].name)

  let name = parsedPayload.answer[0].name
  let expires = Date.now() + parsedPayload.answer[0].ttl * 1000

  return (cache[type][name] = { expires, payload })
}

/**
 * return cached record, if any.
 * If there is no cached record of requested type for requested name, or such record expired, returns null.
 * expired records purged.
 */
/*
parsed query {
  "header": {
    "id": 50586,
    "qr": 0,
    "opcode": 0,
    "aa": 0,
    "tc": 0,
    "rd": 1,
    "ra": 0,
    "res1": 0,
    "res2": 1,
    "res3": 0,
    "rcode": 0
  },
  "question": [
    {
      "name": "rt.pornhub.com",
      "type": 1,
      "class": 1
    }
  ],
  "answer": [],
  "authority": [],
  "additional": [
    {
      "name": "",
      "type": 41,
      "class": 1232,
      "ttl": 0,
      "rcode": 0,
      "version": 0,
      "do": 0,
      "z": 0,
      "options": [
        {
          "code": 10,
          "data": {
            "type": "Buffer",
            "data": [
              209,
              204,
              130,
              66,
              57,
              237,
              109,
              135
            ]
          }
        }
      ]
    }
  ],
  "edns_options": [
    {
      "code": 10,
      "data": {
        "type": "Buffer",
        "data": [
          209,
          204,
          130,
          66,
          57,
          237,
          109,
          135
        ]
      }
    }
  ],
  "payload": 1232,
  "edns": {
    "name": "",
    "type": 41,
    "class": 1232,
    "ttl": 0,
    "rcode": 0,
    "version": 0,
    "do": 0,
    "z": 0,
    "options": [
      {
        "code": 10,
        "data": {
          "type": "Buffer",
          "data": [
            209,
            204,
            130,
            66,
            57,
            237,
            109,
            135
          ]
        }
      }
    ]
  },
  "edns_version": 0
}
*/
export function getFromCache(query, parsedQuery) {
  parsedQuery = parsedQuery || packet.parse(query)
  let q = parsedQuery.question[0]
  let type = CODE_TO_RR_TYPE[q.type]
  if (!type) return null
  let r = cache[type][q.name]
  if (!r) return null
  if (Date.now() > r.expires) {
    modifyRoutes(r.payload)
    delete cache[type][q.name]
    return null
  }
  return r.payload
}


export function purgeCache() {
  let timeline = Date.now()
  for (let type of Object.keys(cache)) {
    for (let name of Object.keys(cache[type])) {
      if (timeline > cache[type][name].expiration) {
        modifyRoutes(cache[type][name].payload)
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
