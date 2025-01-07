import DnsOverHttpResolver from 'dns-over-http-resolver'

let options = {
  // maximum number of cached dns records
  maxCache: 100,
}

const dohResolver = new DnsOverHttpResolver(options)
console.log(`servers: ${dohResolver.getServers()}`) //  https://cloudflare-dns.com/dns-query,https://dns.google/resolve
let examples = [
  { hostname: 'ya1.ru', rrType: 'AAAA' }, // Error: Could not resolve ya1.ru record AAAA
  { hostname: 'ya.ru', rrType: 'AAAA' }, // [ '2a02:6b8::2:242' ]
  { hostname: 'ya.ru', rrType: 'A' }, // [ '5.255.255.242', '77.88.44.242', '77.88.55.242' ]
  { hostname: 'ya.ru', rrType: 'TXT' },
  // resolved TXT for ya.ru: [
  // [
  //   '_globalsign-domain-verification=eLi0_-xATuNmRfuTIX8VQIvgfyi7Od7Hph4V0yNisF'
  // ],
  // [
  //   '_globalsign-domain-verification=CDv6QikC1RWeYQzV2KgfWJFaezFJ6rDbFXR5Kt9gMf'
  // ],
  // [
  //   '_globalsign-domain-verification=xUUDG4u7Zo56EmmFewz7Y4UK3MfAU7QSjAgBsy0w6q'
  // ],
  // [
  //   'google-site-verification=SVTEeUiCU4KV-5qGw4o4JPok7mfsP8NtQTIdN6tt6Nw'
  // ],
  // [ 'v=spf1 redirect=_spf.yandex.ru' ],
  // [ 'e1c8e4dd3d13fad0dd9e8ed54a1813ececd3d5412fb16c4ed2c0612332950fe' ],
  // [
  //   '_globalsign-domain-verification=dHoe580bPQ-lfi_vh-BEIwB4NAtUwURIzrzsivByVL'
  // ]
  { hostname: 'yandex.ru', rrType: 'MX' }, // Error: MX is not supported
  { hostname: 'yandex.ru', rrType: 'NS' }, // Error: NS is not supported
  { hostname: '242.44.88.77.in-addr.arpa', rrType: 'PTR' }, // Error: PTR is not supported
]
for (let example of examples) {
  let hostname = example.hostname
  let rrType = example.rrType
  dohResolver
    .resolve(hostname, rrType)
    .then((d) => {
      console.log(`resolved ${rrType} for ${hostname}: `, d)
    })
    .catch((e) => {
      console.log(e)
    })
}
