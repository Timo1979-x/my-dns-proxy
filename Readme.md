# my-dns-proxy
## Purpose
I needed some sort of 'policy-based VPN router'. The router must make vpn connection using wireguard. The router must send traffic to **selected** hosts through VPN connection, and traffic to all other hosts must go through regular ISP connection, unencrypted.

The problem is, that hosts change their IP addresses frequently. So I want to specify **selected** hosts by domain names, not by IP addresses. Additionally, I want to specify **dns zones** as **selected**, e.g. '\*.google.com'. For obvious reasons, nobody can enumerate names in zone '\*.google.com' and resolve their IP addresses. So this have to be done dynamically and on demand.

Say, we have this **selected** hosts list:
```
[
  '*.google.com',
  '*.some.porn.site'
]
```
initially, router configured to route all traffic through regular ISP connection. When client (web browser, for example) tries to get access to 'abcd.google.com', it first sends DNS request to this software (*my-dns-proxy*). *my-dns-proxy* resends this request to upstream DNS server, and returns their response to client. Additionally, because 'abcd.google.com' matches one of the **selected** hosts, *my-dns-proxy* dynamically reconfigures router's route table and 'allowedIps' for wireguard connection. so from now on, traffic between client and abcd.google.com will go through VPN.

## Sources of information
- [dns-proxy from Erik Kristensen](https://github.com/ekristen/dns-proxy)

## TODO
The work is at the very beginning, so many things to be done:
- [*] embedded telnet server for debug purposes
- [ ] listener to plain DNS requests
- [ ] requests by DNS-over-HTTPS
- [ ] external config files
- [ ] manage linux routes on DNS requests for 'VPN resources'
- [ ] manage wireguard network interface on DNS requests for 'VPN resources'
