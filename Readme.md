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
- [dns-over-http-resolver](https://www.npmjs.com/package/dns-over-http-resolver)
- [wireguard-tools](https://www.npmjs.com/package/wireguard-tools)
- [native-dns-packet](https://github.com/tjfontaine/native-dns-packet)
- [tangerine](https://www.npmjs.com/package/tangerine)
- [rfc8484](https://datatracker.ietf.org/doc/html/rfc8484)

## TODO
The work is at the very beginning, so many things to be done:
- [*] embedded telnet server for debug purposes
- [*] listener to plain DNS requests
- [*] requests by DNS-over-HTTPS
- [ ] external config files
- [ ] manage linux routes on DNS requests for 'VPN resources'
- [ ] manage wireguard network interface on DNS requests for 'VPN resources'

### DNS record types
| Name | id | RFC | description | function |
|------|----|-----|-------------|----------|
| A | 1 | RFC 1035[1] | Address record | Returns a 32-bit IPv4 address, most commonly used to map hostnames to an IP address of the host, but it is also used for DNSBLs, storing subnet masks in RFC 1101, etc. |
| NS | 2 | RFC 1035[1] | Name server record | Delegates a DNS zone to use the given authoritative name servers |
| CNAME | 5 | RFC 1035[1] | Canonical name record | Alias of one name to another: the DNS lookup will continue by retrying the lookup with the new name. |
| SOA | 6 | RFC 1035[1] and RFC 2308[11] | Start of [a zone of] authority record | Specifies authoritative information about a DNS zone, including the primary name server, the email of the domain administrator, the domain serial number, and several timers relating to refreshing the zone. |
| PTR | 12 | RFC 1035[1] | PTR Resource Record [de] | Pointer to a canonical name. Unlike a CNAME, DNS processing stops and just the name is returned. The most common use is for implementing reverse DNS lookups, but other uses include such things as DNS-SD. |
| HINFO | 13 | RFC 8482 | Host Information | Providing Minimal-Sized Responses to DNS Queries That Have QTYPE=ANY |
| MX | 15 | RFC 1035[1] and RFC 7505 | Mail exchange record | List of mail exchange servers that accept email for a domain |
| TXT | 16 | RFC 1035[1] | Text record | Originally for arbitrary human-readable text in a DNS record. Since the early 1990s, however, this record more often carries machine-readable data, such as specified by RFC 1464, opportunistic encryption, Sender Policy Framework, DKIM, DMARC, DNS-SD, etc. |
| RP | 17 | RFC 1183 | Responsible Person | Information about the responsible person(s) for the domain. Usually an email address with the @ replaced by a . |
| AFSDB | 18 | RFC 1183 | AFS database record | Location of database servers of an AFS cell. This record is commonly used by AFS clients to contact AFS cells outside their local domain. A subtype of this record is used by the obsolete DCE/DFS file system. |
| SIG | 24 | RFC 2535 | Signature | Signature record used in SIG(0) (RFC 2931) and TKEY (RFC 2930).[7] RFC 3755 designated RRSIG as the replacement for SIG for use within DNSSEC.[7] |
| KEY | 25 | RFC 2535[3] and RFC 2930[4] | Key record | Used only for SIG(0) (RFC 2931) and TKEY (RFC 2930).[5] RFC 3445 eliminated their use for application keys and limited their use to DNSSEC.[6] RFC 3755 designates DNSKEY as the replacement within DNSSEC.[7] RFC 4025 designates IPSECKEY as the replacement for use with IPsec.[8] |
| AAAA | 28 | RFC 3596[2] | IPv6 address record | Returns a 128-bit IPv6 address, most commonly used to map hostnames to an IP address of the host. |
| LOC | 29 | RFC 1876 | Location record | Specifies a geographical location associated with a domain name |
| SRV | 33 | RFC 2782 | Service locator | Generalized service location record, used for newer protocols instead of creating protocol-specific records such as MX. |
| NAPTR | 35 | RFC 3403 | Naming Authority Pointer | Allows regular-expression-based rewriting of domain names which can then be used as URIs, further domain names to lookups, etc. |
| KX | 36 | RFC 2230 | Key Exchanger record | Used with some cryptographic systems (not including DNSSEC) to identify a key management agent for the associated domain-name. Note that this has nothing to do with DNS Security. It is Informational status, rather than being on the IETF standards-track. It has always had limited deployment, but is still in use. |
| CERT | 37 | RFC 4398 | Certificate record | Stores PKIX, SPKI, PGP, etc. |
| DNAME | 39 | RFC 6672 | Delegation name record | Alias for a name and all its subnames, unlike CNAME, which is an alias for only the exact name. Like a CNAME record, the DNS lookup will continue by retrying the lookup with the new name. |
| APL | 42 | RFC 3123 | Address Prefix List | Specify lists of address ranges, e.g. in CIDR format, for various address families. Experimental. |
| DS | 43 | RFC 4034 | Delegation signer | The record used to identify the DNSSEC signing key of a delegated zone |
| SSHFP | 44 | RFC 4255 | SSH Public Key Fingerprint | Resource record for publishing SSH public host key fingerprints in the DNS, in order to aid in verifying the authenticity of the host. RFC 6594 defines ECC SSH keys and SHA-256 hashes. See the IANA SSHFP RR parameters registry for details. |
| IPSECKEY | 45 | RFC 4025 | IPsec Key | Key record that can be used with IPsec |
| RRSIG | 46 | RFC 4034 | DNSSEC signature | Signature for a DNSSEC-secured record set. Uses the same format as the SIG record. |
| NSEC | 47 | RFC 4034 | Next Secure record | Part of DNSSEC—used to prove a name does not exist. Uses the same format as the (obsolete) NXT record. |
| DNSKEY | 48 | RFC 4034 | DNS Key record | The key record used in DNSSEC. Uses the same format as the KEY record. |
| DHCID | 49 | RFC 4701 | DHCP identifier | Used in conjunction with the FQDN option to DHCP |
| NSEC3 | 50 | RFC 5155 | Next Secure record version 3 | An extension to DNSSEC that allows proof of nonexistence for a name without permitting zonewalking |
| NSEC3PARAM | 51 | RFC 5155 | NSEC3 parameters | Parameter record for use with NSEC3 |
| TLSA | 52 | RFC 6698 | TLSA certificate association | A record for DANE. RFC 6698 defines "The TLSA DNS resource record is used to associate a TLS server certificate or public key with the domain name where the record is found, thus forming a 'TLSA certificate association'". |
| SMIMEA | 53 | RFC 8162[9] | S/MIME cert association[10] | Associates an S/MIME certificate with a domain name for sender authentication. |
| HIP | 55 | RFC 8005 | Host Identity Protocol | Method of separating the end-point identifier and locator roles of IP addresses. |
| CDS | 59 | RFC 7344 | Child DS | Child copy of DS record, for transfer to parent |
| CDNSKEY | 60 | RFC 7344 | | Child copy of DNSKEY record, for transfer to parent |
| OPENPGPKEY | 61 | RFC 7929 | OpenPGP public key record | A DNS-based Authentication of Named Entities (DANE) method for publishing and locating OpenPGP public keys in DNS for a specific email address using an OPENPGPKEY DNS resource record. |
| CSYNC | 62 | RFC 7477 | Child-to-Parent Synchronization | Specify a synchronization mechanism between a child and a parent DNS zone. Typical example is declaring the same NS records in the parent and the child zone |
| ZONEMD | 63 | RFC 8976 | Message Digests for DNS Zones | Provides a cryptographic message digest over DNS zone data at rest. |
| SVCB | 64 | RFC 9460 | Service Binding | RR that improves performance for clients that need to resolve many resources to access a domain. |
| HTTPS | 65 | RFC 9460 | HTTPS Binding | RR that improves performance for clients that need to resolve many resources to access a domain. |
| EUI48 | 108 | RFC 7043 | MAC address (EUI-48) | A 48-bit IEEE Extended Unique Identifier. |
| EUI64 | 109 | RFC 7043 | MAC address (EUI-64) | A 64-bit IEEE Extended Unique Identifier. |
| TKEY | 249 | RFC 2930 | Transaction Key record | A method of providing keying material to be used with TSIG that is encrypted under the public key in an accompanying KEY RR.[12] |
| TSIG | 250 | RFC 2845 | Transaction Signature | Can be used to authenticate dynamic updates as coming from an approved client, or to authenticate responses as coming from an approved recursive name server[13] similar to DNSSEC. |
| URI | 256 | RFC 7553 | Uniform Resource Identifier | Can be used for publishing mappings from hostnames to URIs. |
| CAA | 257 | RFC 6844 | Certification Authority Authorization | DNS Certification Authority Authorization, constraining acceptable CAs for a host/domain |
| TA | 32768 | — | DNSSEC Trust Authorities | Part of a deployment proposal for DNSSEC without a signed DNS root. See the IANA database and Weiler Spec for details. Uses the same format as the DS record. |
| DLV | 32769 | RFC 4431 | DNSSEC Lookaside Validation record | For publishing DNSSEC trust anchors outside of the DNS delegation chain. Uses the same format as the DS record. RFC 5074 describes a way of using these records.  |

### DNS check commands
```bash
# Эта команда пойдёт напрямую, без явного использования DoH:
dig rt.pornhub.com # 82.209.230.73 Адрес заглушки белтелекома

apt install knot-dnssecutils knot-dnsutils -y

# Следующие команды используют явно указанный DoH сервер:
kdig -d @8.8.8.8 +tls-ca +tls-host=dns.google.com rt.pornhub.com # 66.254.114.41 реальный IP
dig @cloudflare-dns.com +https rt.pornhub.com
curl -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=rt.pornhub.com&type=A' | jq .
````
### Список публичных DoH/DoT серверов
- https://github.com/curl/curl/wiki/DNS-over-HTTPS
- [DNSCrypt.info: Interactive list of public DNS servers](https://dnscrypt.info/public-servers/)

- Adguard dns:
  - простые:
    - 94.140.14.14 или 94.140.15.15 для режима «По умолчанию»;
    - 94.140.14.15 или 94.140.15.16 для режима «Семейный»;
    - 94.140.14.140 или 94.140.14.141 для режима «Без фильтрации».
    - 2a00:5a60::ad1:0ff
    - 2a10:50c0::bad2:ff
  - DoT
    - dns.adguard.com для режима «По умолчанию»
    - dns-family.adguard.com для режима «Семейный».
  - DoH
    - https://dns.adguard.com/dns-query для режима «По умолчанию»
    - https://dns-family.adguard.com/dns-query для режима «Семейный».
- Cloudflare
  - простые
    - 1.1.1.1
    - 1.0.0.1
    - 2606:4700:4700::1111
    - 2606:4700:4700::1001
  - DoH
    - https://cloudflare-dns.com/dns-query
  - DoT
    - cloudflare-dns.com
- google
  - простые
    - 8.8.8.8
    - 8.8.4.4
  - DoH
  - DoT
    - dns.google
- Quad9
  - простые
    - 9.9.9.9
    - 149.112.112.112
    - 2620:fe::fe
    - 2620:fe::9
  - DoT
    - dns.quad9.net
- CleanBrowsing
  - простые
    - 185.228.168.9
    - 185.228.168.168
    - 185.228.168.10
    - 2a0d:2a00:1::2
    - 2a0d:2a00:1::
    - 2a0d:2a00:1::1
  - DoT
    - security-filter-dns.cleanbrowsing.org
    - family-filter-dns.cleanbrowsing.org
    - adult-filter-dns.cleanbrowsing.org 
- yandex.dns
  - простые
    - 77.88.8.1
    - 77.88.8.8
  - DoT
    - common.dot.dns.yandex.net
    - safe.dot.dns.yandex.net
    - family.dot.dns.yandex.net
