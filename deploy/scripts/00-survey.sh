#!/usr/bin/env bash
# READ-ONLY survey of the target server. Changes nothing.
# Run this first and read the output before anything else touches the box:
# it already serves other sites, and it decides which SQL Server branch we take.
echo "===== host ====="
hostname; lsb_release -ds 2>/dev/null || cat /etc/os-release | head -2
echo "arch: $(uname -m)   kernel: $(uname -r)   cores: $(nproc)"
echo
echo "===== resources ====="
free -m | head -2
df -h / /var 2>/dev/null | sort -u
echo
echo "===== what is listening ====="
(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | sed 's/  */ /g'
echo
echo "===== nginx ====="
nginx -v 2>&1
echo "-- sites-enabled --"
ls -l /etc/nginx/sites-enabled/ 2>/dev/null
echo "-- server_name / root / proxy_pass per site --"
grep -rHnE 'server_name|listen |root |proxy_pass' /etc/nginx/sites-enabled/ 2>/dev/null | sed 's/^/  /'
echo "-- is \$connection_upgrade already defined? --"
grep -rn 'connection_upgrade' /etc/nginx/ 2>/dev/null | head
echo
echo "===== existing certs ====="
certbot certificates 2>/dev/null | grep -E 'Certificate Name|Domains|Expiry' || echo "certbot not installed or no certs"
echo
echo "===== toolchain ====="
for c in node npm pm2 docker certbot git sqlcmd unzip; do
  printf '%-10s ' "$c"; command -v $c >/dev/null 2>&1 && $c --version 2>/dev/null | head -1 || echo "NOT INSTALLED"
done
echo
echo "===== is SQL Server already here? ====="
systemctl is-active mssql-server 2>/dev/null || echo "mssql-server: not present"
ls -d /opt/mssql /var/opt/mssql 2>/dev/null || echo "no /opt/mssql"
echo
echo "===== running services (non-system) ====="
systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null \
  | grep -vE 'systemd|dbus|cron|rsyslog|polkit|udev|getty|networkd|resolved|logind|accounts|unattended' | head -25
echo
echo "===== web roots in use ====="
ls -ld /var/www/* 2>/dev/null
echo
echo "===== survey complete - nothing was modified ====="
