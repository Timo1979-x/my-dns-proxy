import { createRtNetlink } from 'netlink'
import { getType, reflection, buffer2Ip, array2Ip } from '../utils.mjs'

const socket = createRtNetlink()

// socket.newRoute()

// // List addresses
// const addrs = await socket.getAddresses()
// console.log('Addresses:', addrs)

// // List routes
// let routes = await socket.getRoutes()
// routes = routes.filter(r => r.kind == 'route' && r.data.family == 2 && r.data.dstLen == 32)
// for (let route of routes) {
//   route.attrs.dstStr = array2Ip(route.attrs.dst)
// }

// console.log('Routes:', routes)

// // Set eth0 up
const links = await socket.getLinks()
let ifindex = [
    links.find((i) => i.attrs.ifname === 'wg0'),
    links.find((i) => i.attrs.ifname.startsWith('wg'))
  ]
  .filter(i => i)
  .map(i => i.data.index).find(() => true)
if (!ifindex) {
  throw new Error('wireguard iface not found')
}
console.log(ifindex)


async function addRoute() {
  let route = {
    kind: 'route',
    data: {
      family: 2,
      dstLen: 32,
      srcLen: 0,
      tos: 0,
      table: 254,
      protocol: 'BOOT',
      scope: 'LINK',
      type: 'UNICAST',
      flags: {}
    },
    attrs: {
      table: 254,
      dst: Buffer.from([10, 1, 1, 2]),
      oif: 5,
    }
  }
  console.log(route)
  try {
    let result = await socket.newRoute(route.data, route.attrs)
    console.log(result)
  } catch (e) {
    console.error('Error: %s', e)
  }
}

await addRoute()
