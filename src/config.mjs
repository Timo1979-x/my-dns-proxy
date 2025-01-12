
/**
 * The default embedded config.
 */
let config = {
  /**
   * Binding IP address(es) and optional ports to listen to telnet connection.
   * Default port 10023.
   * There is no defaults for ip address. if array is undefined or empty, telnet listener won't be created.
   */
  telnetServerAddresses: ['0.0.0.0:10023'],
  /**
   *  Binding IP address(es) and optional ports to listen to dns requests
   *  default port is 10053.
   * There is no defaults for ip address. if array is undefined or empty, the server will refuse to start.
   */
  dnsListenAddresses: ['0.0.0.0:10053'],
  loglevels: ['query', 'info', 'debug', 'error'],
  /**
   * DNS host name templates for resources to be accessed through VPN.
   * Allowed wildcard symbols is * and ?. 
   * Javascript library 'wildcard2' used for matching.
   */
  vpnResources: [
    'chatgpt.com',
    '*.chatgpt.com',
    '*.devart.com',
    'devart.com',
    '*.jetbrains.com',
    'jetbrains.com',
    'pornhub.com',
    '*.pornhub.com',
  ],
  /**
   * Wireguard options
   */
  wg: {
    /**
     * Wireguard interface name.
     */
    ifname: 'wg0',
  },
}

export default config
