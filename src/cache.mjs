import packet from 'native-dns-packet'
import { CODE_TO_RR_TYPE, CACHEABLE_RR_CODES, CACHEABLE_RR_TYPES } from './utils.mjs'
import { logdebug, logerror, loginfo } from './logger.mjs'
import { deleteRoutes } from './net.mjs'
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
const dnsCache = Object.fromEntries(CACHEABLE_RR_TYPES.map((key) => [key, {}]))

/**
 * Cached records about added network routes. It is different from DNS cache because routes needs 
 * to live much longer than dns records.
 * format:
 * @example
 * {
 *  "ipv4": {
 *     "x.y.z.a": 1736256104062, // expiration time in milliseconds from UNIX era
 *   }
 *  "ipv6": {
 *     "fe80::cdc0:73a7:e10:840f": 1736256104062, // expiration time in milliseconds from UNIX era
 *   }
 * }
 */
const routesCache = { ipv4: {}, ipv6: {} }



/**
 * adds records to DNS cache (only types enlisted in CACHEABLE_RR_CODES).
 * @param {Buffer} payload answer from upstream dns server
 * @param {Object} parsedPayload answer from upstream dns server in the form of JS object. if it presents, payload is not parsed again
 * @returns newly added cache record
 */
export function addToCache(payload, parsedPayload) {
  parsedPayload = parsedPayload || packet.parse(payload)
  if (parsedPayload.answer.length === 0) return null
  let answerRecord = parsedPayload.answer.find((el) => CACHEABLE_RR_CODES.includes(Number(el.type)))
  if (!answerRecord) return null
  let type = CODE_TO_RR_TYPE[answerRecord.type]
  logdebug('caching %s anwer for %s', type, parsedPayload.question[0].name)

  let name = parsedPayload.question[0].name
  let expires = Date.now() + answerRecord.ttl * 1000

  return (dnsCache[type][name] = { expires, payload })
}

/**
 * return cached record, if any.
 * If there is no cached record of requested type for requested name, or such record expired, returns null.
 * expired records purged.
 */

/*
parsed query example
{
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

/*
parsed answer example
{
  "header": {
    "id": 53374,
    "qr": 1,
    "opcode": 0,
    "aa": 0,
    "tc": 0,
    "rd": 1,
    "ra": 1,
    "res1": 0,
    "res2": 0,
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
  "answer": [
    {
      "name": "rt.pornhub.com",
      "type": 5,
      "class": 1,
      "ttl": 74971,
      "data": "www.pornhub.com"
    },
    {
      "name": "www.pornhub.com",
      "type": 5,
      "class": 1,
      "ttl": 2971,
      "data": "pornhub.com"
    },
    {
      "name": "pornhub.com",
      "type": 1,
      "class": 1,
      "ttl": 2971,
      "address": "66.254.114.41"
    }
  ],
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
      "options": []
    }
  ],
  "edns_options": [],
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
    "options": []
  },
  "edns_version": 0
}
*/
export function getFromCache(query, parsedQuery) {
  parsedQuery = parsedQuery || packet.parse(query)
  let q = parsedQuery.question[0]
  let type = CODE_TO_RR_TYPE[q.type]
  if (!type) return null
  let r = dnsCache[type][q.name]
  if (!r) return null
  if (Date.now() > r.expires) {
    delete dnsCache[type][q.name]
    return null
  }
  // Modify cached id to match queried id
  let result = new Uint8Array(r.payload)
  result[0] = query[0]
  result[1] = query[1]
  return result
}


export function purgeCache() {
  let deadline = Date.now()
  // purge dns cache:
  for (let type of Object.keys(dnsCache)) {
    for (let name of Object.keys(dnsCache[type])) {
      if (deadline > dnsCache[type][name].expires) {
        delete dnsCache[type][name]
      }
    }
  }

  // purge routes cache (and remove routes themselves):
  let expiredIpv4 = Object.keys(routesCache.ipv4).filter(ip => routesCache.ipv4[ip] < deadline)
  let expiredIpv6 = Object.keys(routesCache.ipv6).filter(ip => routesCache.ipv6[ip] < deadline)
  deleteRoutes(expiredIpv4, expiredIpv6)
}
export default { routesCache, dnsCache }

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
