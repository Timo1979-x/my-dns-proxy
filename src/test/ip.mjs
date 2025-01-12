import { execSync } from 'child_process'
import config from '../config.mjs'

try {
  let result = execSync(`ip route show dev ${config.wg.ifname}`)
  result = String(result)
    .split('\n')
    .map(e => e.trim())
    .filter(e => e !== '')
    .map(e => e.split(' ')[0])
  console.log(result)
} catch (e) {
  console.error('execSync error: %j', String(e.output[2]))
}

