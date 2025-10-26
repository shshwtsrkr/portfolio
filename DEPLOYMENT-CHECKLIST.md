# ✅ VPS Deployment Checklist

Follow this order for a smooth deployment:

## Pre-Deployment

- [ ] **Purchase VPS** (Hetzner/DigitalOcean)
  - Ubuntu 22.04 LTS
  - At least 2GB RAM
  - Note your VPS IP address

- [ ] **Domain Ready**
  - You have your domain credentials
  - DNS access ready

## Step-by-Step Deployment Order

### 1. Domain Configuration (Do First!)
- [ ] Add A records for @ and www pointing to VPS IP
- [ ] Wait 10-15 minutes for DNS propagation

### 2. Cloudflare Setup (Optional but Recommended)
- [ ] Create Cloudflare account
- [ ] Add your domain
- [ ] Update nameservers at registrar
- [ ] Set DNS records to "Proxied" (orange cloud)
- [ ] SSL/TLS → Full (strict)
- [ ] Enable Auto Minify, Brotli

### 3. VPS Initial Setup
- [ ] SSH into VPS: `ssh root@YOUR_VPS_IP`
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Docker: `curl -fsSL https://get.docker.com | sh`
- [ ] Install Docker Compose: `apt install docker-compose-plugin -y`
- [ ] Install Git: `apt install git -y`

### 4. Clone Repository
- [ ] Create directory: `mkdir -p /var/www && cd /var/www`
- [ ] Clone repo: `git clone YOUR_REPO_URL`
- [ ] CD into project: `cd portfolio`

### 5. Configuration Files
- [ ] Get your IP: `curl ifconfig.me`
- [ ] Edit `nginx/admin-ips.conf` → Add your IP
- [ ] Copy `.env.example` → `.env`
- [ ] Edit `.env` → Set passwords and domain
- [ ] Edit `nginx/nginx.conf` → Replace YOUR_DOMAIN

### 6. Initial Deployment (HTTP Only)
- [ ] Comment out HTTPS block in `nginx/nginx.conf`
- [ ] Start containers: `docker compose up -d --build`
- [ ] Check status: `docker ps` (3 containers running?)
- [ ] Check logs: `docker compose logs -f`
- [ ] Test HTTP: `http://YOUR_DOMAIN` (should work)

### 7. SSL Certificate
- [ ] Run certbot: `docker compose run --rm certbot`
- [ ] Uncomment HTTPS block in `nginx/nginx.conf`
- [ ] Restart nginx: `docker compose restart nginx`
- [ ] Test HTTPS: `https://YOUR_DOMAIN`
- [ ] Setup auto-renewal cron job

### 8. Clean Demo Data
- [ ] Run cleanup script:
  ```bash
  docker cp cleanup-demo-data.sql portfolio-mysql:/tmp/
  docker exec -it portfolio-mysql mysql -u portfolio_user -pYOUR_PASSWORD portfolio_db < /tmp/cleanup-demo-data.sql
  ```

### 9. Admin Access & Content
- [ ] Visit `https://yourdomain.com/admin` from whitelisted IP
- [ ] Login (default or set credentials)
- [ ] Upload profile image
- [ ] Upload resume PDF
- [ ] Add your name, title, about
- [ ] Configure typing animation
- [ ] Add social links
- [ ] Test all features

### 10. CI/CD Setup
- [ ] Generate SSH key for GitHub Actions
- [ ] Add public key to VPS: `ssh-copy-id root@VPS_IP`
- [ ] Add GitHub secrets:
  - VPS_HOST
  - VPS_USER
  - VPS_SSH_KEY (private key)
- [ ] Push to main → Watch GitHub Actions

### 11. Testing & Verification
- [ ] Frontend loads: `https://yourdomain.com`
- [ ] Admin accessible from your IP
- [ ] Admin blocked from other IPs
- [ ] Upload image works
- [ ] Upload PDF works
- [ ] Download resume works
- [ ] All pages load correctly
- [ ] Mobile responsive
- [ ] SSL certificate valid

### 12. Monitoring & Backups
- [ ] Setup UptimeRobot monitoring
- [ ] Configure upload backups
- [ ] Enable Cloudflare analytics
- [ ] Document any customizations

## Quick Commands Reference

```bash
# View logs
docker compose logs -f

# Restart all services
docker compose restart

# Restart specific service
docker compose restart nginx

# Rebuild after code changes
docker compose up -d --build

# Clean up
docker system prune -af

# Database backup
docker exec portfolio-mysql mysqldump -u portfolio_user -p portfolio_db > backup.sql

# Check container status
docker ps -a

# Stop everything
docker compose down

# Start everything
docker compose up -d
```

## Estimated Time

- **VPS Setup**: 30 minutes
- **Domain/DNS**: 15 minutes (+ waiting time)
- **Cloudflare**: 20 minutes
- **Deployment**: 45 minutes
- **SSL Setup**: 15 minutes
- **Content Upload**: 30 minutes
- **CI/CD**: 20 minutes

**Total**: ~3 hours (excluding DNS propagation wait times)

## Important Notes

✅ **File Uploads**: No changes needed! Docker volumes handle everything.

✅ **Admin Security**: Only accessible from whitelisted IPs.

✅ **Automatic Deployments**: Push to main → Auto-deploys.

✅ **Free CDN**: Cloudflare provides free SSL + CDN + DDoS protection.

✅ **Backups**: Setup automated backups for database and uploads.

## Need Help?

Refer to `DEPLOYMENT.md` for detailed instructions on each step.

---

Good luck! 🚀
