# Backup da zona DNS — arghoagrosciences.com
**Capturado em:** 12/08/2026, antes da correção que reapontou o site para a Vercel.
**Nameservers:** ns1.dns-parking.com / ns2.dns-parking.com (Hostinger)

## Estado ANTES da alteração (20 registros)

| Tipo | Nome | Conteúdo | TTL | Observação |
|---|---|---|---|---|
| ALIAS | @ | arghoagrosciences.com.cdn.hstgr.net | 300 | **REMOVIDO** — apontava o site p/ o CDN da Hostinger (WordPress "em manutenção") |
| CNAME | www | www.arghoagrosciences.com.cdn.hstgr.net | 300 | **REMOVIDO** — idem |
| CNAME | colheita | 794e3974305c9d57.vercel-dns-016.com | 14400 | preservado (portal Vercel) |
| A | ftp | 45.152.46.243 | 1800 | preservado |
| A | evo | 68.183.16.252 | 300 | preservado (Evolution API / SAFRA) |
| A | n8n | 68.183.16.252 | 300 | preservado (n8n / SAFRA) |
| MX | @ | mx1.hostinger.com | 14400 | preservado (e-mail) |
| MX | @ | mx2.hostinger.com | 14400 | preservado (e-mail) |
| TXT | @ | "v=spf1 include:_spf.mail.hostinger.com ~all" | 3600 | preservado (SPF) |
| TXT | _dmarc | "v=DMARC1; p=none" | 3600 | preservado (DMARC) |
| CNAME | hostingermail-a._domainkey | hostingermail-a.dkim.mail.hostinger.com | 300 | preservado (DKIM) |
| CNAME | hostingermail-b._domainkey | hostingermail-b.dkim.mail.hostinger.com | 300 | preservado (DKIM) |
| CNAME | hostingermail-c._domainkey | hostingermail-c.dkim.mail.hostinger.com | 300 | preservado (DKIM) |
| CNAME | autodiscover | autodiscover.mail.hostinger.com | 300 | preservado (e-mail) |
| CNAME | autoconfig | autoconfig.mail.hostinger.com | 300 | preservado (e-mail) |
| CNAME | hostingermail-a._domainkey.loja | hostingermail-a.dkim.mail.hostinger.com | 300 | preservado |
| CNAME | hostingermail-b._domainkey.loja | hostingermail-b.dkim.mail.hostinger.com | 300 | preservado |
| CNAME | hostingermail-c._domainkey.loja | hostingermail-c.dkim.mail.hostinger.com | 300 | preservado |
| CNAME | autodiscover.loja | autodiscover.mail.hostinger.com | 300 | preservado |
| CNAME | autoconfig.loja | autoconfig.mail.hostinger.com | 300 | preservado |

## Alteração aplicada
- Removidos: `ALIAS @` e `CNAME www` (ambos apontavam para o CDN da Hostinger)
- Criados: `A @ → 76.76.21.21` e `A www → 76.76.21.21` (IP exigido pela Vercel,
  confirmado via `vercel domains inspect arghoagrosciences.com`)

## Como reverter
Apagar os dois registros A e recriar:
- `ALIAS` `@` → `arghoagrosciences.com.cdn.hstgr.net` (TTL 300)
- `CNAME` `www` → `www.arghoagrosciences.com.cdn.hstgr.net` (TTL 300)
