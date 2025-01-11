import { createRtNetlink } from 'netlink'
import { getType, reflection } from '../utils.mjs'

const socket = createRtNetlink()

// socket.newRoute()

// // List addresses
// const addrs = await socket.getAddresses()
// console.log('Addresses:', addrs)

// // List routes
// let routes = await socket.getRoutes()
// routes = routes.filter(r => r.kind == 'route' && r.data.family == 2 && r.data.dstLen == 32)
// for (let route of routes) {
//   route.attrs.dstStr = buffer2Ip(route.attrs.dst)
//   console.log(route)
// }
// console.log('Routes:', routes)

// // Set eth0 up
// const links = await socket.getLinks()
// const eth0 = links.filter(x => x.attrs.ifname === 'eth0')[0]
// await socket.setLink({
//   index: eth0.index,
//   change: { up: true },
//   flags: { up: true },
// })


// function addRoute() {
//   let routeData= {
//       family: 2,
//       dstLen: 32,
//       srcLen: 0,
//       tos: 0,
//       table: 254,
//       protocol: 'BOOT',
//       scope: 'UNIVERSE',
//       type: 'UNICAST',
//       flags: {}
//     }
//     let routeAttrs = {
//       table: 254,
//       dst: <Buffer 0a 01 01 01>,
//       gateway: <Buffer c0 a8 c8 fe>,
//       oif: 2
//     }
// }

function buffer2Ip(buf) {
  let result = ''
  let view = new DataView(buf)
  for (let i = 0; i < view.byteLength; i++) { 
    if (i != 0) result += '.'
    result += Number(view.getUint8(i))
  }
  return result
}

let buf = new ArrayBuffer(4)
let view = new DataView(buf)
view.setUint8(0, 192)
view.setUint8(1, 168)
view.setUint8(2, 200)
view.setUint8(3, 20)
// console.log('Members of DataView:\n%s', reflection(view))

console.log(buffer2Ip(buf))
