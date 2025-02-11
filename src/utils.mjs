import wcMatch from 'wildcard2'

const hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function toBase64(source) {
  Buffer.from(source).toString('base64')
}

export function fromBase64(encoded) {
  return Buffer.from(encoded, 'base64')
}

export function getType(thing) {
  if (thing === null) return '[object Null]'
  // special case
  return Object.prototype.toString.call(thing)
}

export function toHexString(source) {
  function hexByte(input) {
    return hexDigits[Math.floor(input / 16)] + hexDigits[input % 16]
  }
  let result = ''
  let first = true
  for (let x of Buffer.from(source)) {
    if (first) {
      first = false
    } else {
      result += ' '
    }
    result += hexByte(x)
  }
  return result
}

/**
 * Correspondence between numeric and literal DNS request types. Here comes only types of records cached by us
 */
export const CODE_TO_RR_TYPE = Object.freeze({
  1: 'A',
  // 2: 'NS',
  // 12: 'PTR',
  // 15: 'MX',
  28: 'AAAA',
})

/**
 * коды DNS-записей, связанные с модификацией маршрутов
 */
export const ROUTABLE_RR_TYPES = Object.freeze([
  1, // A
  28, // AAAA
])
/**
 * List of numeric DNS request codes to cache
 */
export const CACHEABLE_RR_CODES = Object.freeze(Object.keys(CODE_TO_RR_TYPE).map((e) => Number(e)))

/**
 * List of symbolic DNS request types to cache
 */
export const CACHEABLE_RR_TYPES = Object.freeze(Object.keys(CODE_TO_RR_TYPE).map((e) => CODE_TO_RR_TYPE[e]))

/**
 * Correspondence between literal and numeric DNS request types. Here comes only types of records cached by us
 */
export const RR_TYPES = Object.freeze(
  Object.fromEntries(Object.keys(CODE_TO_RR_TYPE).map((key) => [CODE_TO_RR_TYPE[key], Number(key)]))
)

export function reflection(obj) {
  let originalObj = obj
  let result = ''
  let indent = ''
  while (obj) {
    result += indent + getType(obj) + '\n'
    for (let prop of Reflect.ownKeys(obj)) {
      let type = typeof originalObj[prop]
      result += indent + String(prop) + ' (' + type + ')\n'
    }
    obj = Object.getPrototypeOf(obj)
    indent += '  '
  }
  return result
}

/**
 * test that input string matches any of patterns in the array.
 * @param {String} string The input string
 * @param {Array<String>} patterns list of patterns to match
 * @returns the matched pattern, or null if no matches.
 */
export function matchAny(string, patterns) {
  for (let pattern of patterns) {
    if(pattern === '') continue
    if (wcMatch(string, pattern)) return pattern
  }
  return null
}
