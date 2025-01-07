// import config from './config.mjs'
// import debug from 'debug'

// const appName = 'dnsproxy'
// let loglevels
// if (process.env.DEBUG) {
//   loglevels = ['error', 'query', 'info', 'debug']
// } else {
//   loglevels = config ? config.loglevels : null
//   loglevels = loglevels || ['error', 'query']
// }


// export const logdebug = loglevels.includes('debug') ? debug(`${appName}:debug`) : () => { }
// export const loginfo = loglevels.includes('info') ? debug(`${appName}:info`) : () => {}
// export const logquery = loglevels.includes('query') ? debug(`${appName}:query`) : () => {}
// export const logerror = loglevels.includes('error') ? debug(`${appName}:error`) : () => {}
        
export const logdebug = (...a) => (console.debug(...a))
export const loginfo = (...a) => (console.info(...a))
export const logquery = (...a) => (console.log(...a))
export const logerror = (...a) => (console.error(...a))
