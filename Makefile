host = vpn
dnsPort = 10053
telnetPort = 10054

telnet:
	telnet $(host) ${telnetPort}

dig:
	dig -p $(dnsPort) -t A +short @$(host) ya.ru
	dig -p $(dnsPort) -t AAAA +short @$(host) ya.ru
	dig -p $(dnsPort) -t NS +short @$(host) ya.ru
	dig -p $(dnsPort) -t MX +short @$(host) ya.ru
	dig -p $(dnsPort) -t PTR +short @$(host) 242.44.88.77.in-addr.arpa
	dig -p $(dnsPort) -t A +short @$(host) rt.pornhub.com
