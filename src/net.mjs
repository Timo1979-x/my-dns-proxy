import packet from 'native-dns-packet'
import { ROUTABLE_RR_TYPES } from './utils.mjs'
import wcMatch from 'wildcard2'
import config from './config.mjs'

/**
 * remove routes to hosts.
 * @param {Array<String>} ipv4addresses ip v4 addresses to remove routes to
 * @param {Array<String>} ipv6addresses ip v6 addresses to remove routes to
 */
export function deleteRoutes(ipv4addresses, ipv6addresses) {
  let allAddresses = []
  
  // get existing routes
  // remove routes that needs to remove
}

/**
 * If necessary, add routes for hosts
 * @param {Array<Buffer>} dnsAnswers binary dns answers to analyze and remove from routes
 */
export function addRoutes(...dnsAnswers) {
  for (let dnsAnswerBinary of dnsAnswers) {
    let parsedAnswer = packet.parse(dnsAnswerBinary)
    let addresses = parsedAnswer.answer.filter((entry) => ROUTABLE_RR_TYPES.includes(entry.type)).map((e) => e.address)
    allAddresses = allAddresses.concat(addresses)
  }
}
