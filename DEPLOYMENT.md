# 🚀 VPS Deployment Guide

Complete guide to deploy your portfolio website to a VPS with Docker, SSL, CDN, and CI/CD.

---

## 📋 Table of Contents

1. [VPS Setup](#1-vps-setup)
2. [Domain Configuration](#2-domain-configuration)
3. [Cloudflare CDN Setup](#3-cloudflare-cdn-setup-free)
4. [Server Preparation](#4-server-preparation)
5. [Admin IP Whitelist](#5-admin-ip-whitelist-security)
6. [Deploy Application](#6-deploy-application)
7. [SSL Certificate](#7-ssl-certificate-setup)
8. [Clean Demo Data](#8-clean-demo-data)
9. [CI/CD Setup](#9-cicd-setup-github-actions)
10. [File Uploads on VPS](#10-file-uploads-verification)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. VPS Setup

### Purchase VPS (Recommended: Hetzner)

1. Go to https://www.hetzner.com/cloud
2. Create account
3. Create new project
4. **Select Server:**
   - Location: Choose closest to your users
   - Image: **Ubuntu 22.04 LTS**
   - Type: CPX11 (2 vCPU, 4GB RAM, €4.49/month)
   - SSH Key: Add your SSH public key

5. **Create Server** and note the IP address

---

## 2. Domain Configuration

### Add DNS Records

Go to your domain registrar's DNS settings and add:

```
Type    Name    Value               TTL
A       @       YOUR_VPS_IP         3600
A       www     YOUR_VPS_IP         3600
```

**Wait 10-15 minutes** for DNS propagation.

---

## 3. Cloudflare CDN Setup (FREE)

### Option A: Cloudflare as CDN + DNS (Recommended)

1. Go to https://www.cloudflare.com/
2. Sign up for free account
3. **Add Site** → Enter your domain
4. Select **Free Plan**
5. **Update Nameservers:**
   - Cloudflare will show you 2 nameservers
   - Go to your domain registrar
   - Replace nameservers with Cloudflare's
   - Wait 24-48h for nameserver propagation

6. **Cloudflare DNS Settings:**
   ```
   Type    Name    Content         Proxy Status
   A       @       YOUR_VPS_IP     Proxied (orange cloud)
   A       www     YOUR_VPS_IP     Proxied (orange cloud)
   ```

7. **SSL/TLS Settings:**
   - SSL/TLS → Overview → Set to **Full (strict)**
   - Edge Certificates → Always Use HTTPS: **ON**

8. **Speed Settings:**
   - Auto Minify: Enable HTML, CSS, JS
   - Brotli: ON
   - Rocket Loader: ON

9. **Caching:**
   - Browser Cache TTL: 4 hours or more
   - Always Online: ON

### Option B: Without Cloudflare (Just DNS)

Keep your current DNS settings from Step 2.

---

## 4. Server Preparation

### SSH into your VPS

```bash
ssh root@YOUR_VPS_IP
```

### Update System

```bash
apt update && apt upgrade -y
```

### Install Required Software

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Install Git
apt install git -y

# Verify installations
docker --version
docker compose version
git --version
```

### Create Application Directory

```bash
mkdir -p /var/www
cd /var/www
```

### Clone Your Repository

```bash
# Option 1: HTTPS (you'll need to enter credentials)
git clone https://github.com/YOUR_USERNAME/portfolio.git

# Option 2: SSH (recommended, set up SSH keys first)
git clone git@github.com:YOUR_USERNAME/portfolio.git

cd portfolio
```

---

## 5. Admin IP Whitelist (Security)

### Get Your IP Address

```bash
curl ifconfig.me
```

### Add Your IP to Whitelist

Edit the file:

```bash
nano nginx/admin-ips.conf
```

Add your IPs:

```nginx
# Your Home IP
allow 203.0.113.1;

# Your Office IP
allow 198.51.100.50;

# Your VPN IP (if using VPN)
allow 192.0.2.100;

# Localhost
allow 127.0.0.1;
allow ::1;
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

## 6. Deploy Application

### Create Environment File

```bash
cp .env.example .env
nano .env
```

Update with your values:

```env
MYSQL_ROOT_PASSWORD=your_super_strong_root_password_123
MYSQL_PASSWORD=your_strong_password_456

BACKEND_URL=https://yourdomain.com

DOMAIN=yourdomain.com
SSL_EMAIL=your-email@example.com
```

Save and exit (`Ctrl+X`, `Y`, `Enter`).

### Update Nginx Config with Your Domain

```bash
nano nginx/nginx.conf
```

Find `YOUR_DOMAIN` and replace with your actual domain (e.g., `example.com`).

### Build and Start Containers

```bash
# Build and start all services
docker compose up -d --build

# Check if all containers are running
docker ps

# View logs
docker compose logs -f
```

You should see 3 containers running:
- portfolio-nginx
- portfolio-backend
- portfolio-mysql

---

## 7. SSL Certificate Setup

### Initial HTTP Setup (Before SSL)

First, comment out the HTTPS server block temporarily:

```bash
nano nginx/nginx.conf
```

Comment out or remove the entire `server { listen 443 ssl http2; ... }` block for now.

Restart Nginx:

```bash
docker compose restart nginx
```

### Obtain SSL Certificate

```bash
# Run certbot to get certificate
docker compose run --rm certbot

# Wait for certificate to be issued
```

### Enable HTTPS

Uncomment the HTTPS block in nginx.conf:

```bash
nano nginx/nginx.conf
```

Restart Nginx:

```bash
docker compose restart nginx
```

### Auto-Renewal Setup

Add cron job for auto-renewal:

```bash
crontab -e
```

Add this line:

```
0 0 * * * docker compose -f /var/www/portfolio/docker-compose.yml run --rm certbot renew && docker compose -f /var/www/portfolio/docker-compose.yml restart nginx
```

---

## 8. Clean Demo Data

### Remove Test Data

```bash
# Copy cleanup script into MySQL container
docker cp cleanup-demo-data.sql portfolio-mysql:/tmp/

# Execute cleanup
docker exec portfolio-mysql mysql -u portfolio_user -p portfolio_db < /tmp/cleanup-demo-data.sql
```

Enter the password from your `.env` file when prompted.

**Note:** This deletes ALL existing data. Do this ONCE before adding your own content.

---

## 9. CI/CD Setup (GitHub Actions)

### Create Repository Secrets

Go to GitHub → Your Repository → Settings → Secrets and variables → Actions

Add these secrets:

1. **VPS_HOST**: Your VPS IP address
2. **VPS_USER**: `root` (or your SSH user)
3. **VPS_SSH_KEY**: Your private SSH key

```bash
# Generate SSH key on your local machine (if you don't have one)
ssh-keygen -t ed25519 -C "github-actions"

# Copy the PRIVATE key
cat ~/.ssh/id_ed25519

# Copy the PUBLIC key to VPS
ssh-copy-id root@YOUR_VPS_IP
```

Paste the **private key** as `VPS_SSH_KEY` secret.

### Test CI/CD

```bash
# Push to main branch
git add .
git commit -m "Initial deployment"
git push origin main
```

Go to GitHub → Actions tab → Watch the deployment!

Every push to `main` will now auto-deploy! 🎉

---

## 10. File Uploads Verification

### ✅ Images and PDFs Will Work Automatically

Your file upload system uses:
- **Local filesystem** with Docker volume mount
- **Uploads directory** is mapped: `uploads-data:/app/uploads`
- **Nginx serves uploads** from `/uploads/` path

**What this means:**
- Upload images via admin → Saved to Docker volume
- Upload resume PDF → Saved to Docker volume
- Files persist across container restarts
- No code changes needed!

### Test Uploads

1. Go to `https://yourdomain.com/admin` (from whitelisted IP)
2. Upload profile image → Check if it appears on homepage
3. Upload resume PDF → Check if download button works
4. Upload blog/project images → Verify they load

If uploads work, **you're all set!** ✅

### Backup Uploads (Recommended)

```bash
# Create backup script
nano /root/backup-uploads.sh
```

Add:

```bash
#!/bin/bash
docker run --rm -v portfolio_uploads-data:/data -v /root/backups:/backup alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz /data
```

Make executable:

```bash
chmod +x /root/backup-uploads.sh
```

Schedule daily backups:

```bash
crontab -e
```

Add:

```
0 2 * * * /root/backup-uploads.sh
```

---

## 11. Troubleshooting

### Check Container Status

```bash
docker ps -a
docker compose logs backend
docker compose logs nginx
docker compose logs mysql
```

### Restart Services

```bash
docker compose restart
```

### Check Disk Space

```bash
df -h
```

### Clean Docker

```bash
docker system prune -af
```

### Check Nginx Config

```bash
docker exec portfolio-nginx nginx -t
```

### Database Connection Issues

```bash
# Access MySQL container
docker exec -it portfolio-mysql mysql -u portfolio_user -p
```

### Admin Access Blocked?

Check your IP:

```bash
curl ifconfig.me
```

Add to `nginx/admin-ips.conf` and restart:

```bash
docker compose restart nginx
```

---

## 🎉 Deployment Complete!

Your website should now be live at:
- **Frontend**: https://yourdomain.com
- **Admin**: https://yourdomain.com/admin (IP restricted)
- **API**: https://yourdomain.com/api

### Next Steps

1. Access admin panel and add your content
2. Upload your profile image
3. Upload your resume PDF
4. Add projects, blogs, publications
5. Test everything!

### Monitoring

- Set up uptime monitoring: https://uptimerobot.com (free)
- Enable Cloudflare analytics
- Monitor Docker logs: `docker compose logs -f`

---

## 📞 Support

If you encounter issues:
1. Check troubleshooting section above
2. Review container logs
3. Verify all environment variables
4. Ensure DNS has propagated
5. Check firewall rules

Good luck with your deployment! 🚀
