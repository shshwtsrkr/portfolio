# 🎯 VPS Deployment - Quick Summary

## Your Questions Answered

### 1. ✅ VPS Recommendation

**Best Option: Hetzner Cloud CPX11**
- **Price**: €4.49/month (~$5)
- **Specs**: 2 vCPU, 4GB RAM, 40GB SSD, 20TB traffic
- **Why**: Best value, reliable, fast
- **Alternative**: DigitalOcean $6/month (easier UI)

### 2. ✅ Admin Security (IP Whitelist)

Admin panel is **protected** via Nginx IP whitelist in `nginx/admin-ips.conf`:

```nginx
# Add your IPs here
allow 203.0.113.1;      # Your home IP
allow 198.51.100.0/24;  # Your office network
```

Anyone NOT on the list gets **403 Forbidden** when accessing `/admin`.

### 3. ✅ Remove Demo Data

Run this script **ONCE** on VPS:

```bash
docker cp cleanup-demo-data.sql portfolio-mysql:/tmp/
docker exec -it portfolio-mysql mysql -u portfolio_user -p portfolio_db < /tmp/cleanup-demo-data.sql
```

This deletes ALL test data. Then use admin tool to add your own content.

### 4. ✅ Link Your Domain

**Step 1**: Add DNS A records at your registrar:

```
Type    Name    Value           TTL
A       @       YOUR_VPS_IP     3600
A       www     YOUR_VPS_IP     3600
```

**Step 2**: Update `.env` file:

```env
DOMAIN=yourdomain.com
BACKEND_URL=https://yourdomain.com
```

**Step 3**: Update `nginx/nginx.conf` (replace YOUR_DOMAIN)

Done! Your site will be at `https://yourdomain.com`

### 5. ✅ Free CDN + CI/CD

**CDN: Cloudflare (FREE)**
- Free SSL certificates
- Global CDN (faster loading)
- DDoS protection
- Auto minify CSS/JS
- Brotli compression
- Setup time: 20 minutes

**CI/CD: GitHub Actions (FREE)**
- Auto-deploy on push to main
- Build frontend + backend
- Deploy to VPS via SSH
- Included in `.github/workflows/deploy.yml`

### 6. ✅ Docker - YES, USE IT!

**Why Docker?**
- ✅ Quick setup (3 commands)
- ✅ Consistent environment
- ✅ Easy rollbacks
- ✅ Isolated services
- ✅ Simple updates

**Deployment is this simple:**

```bash
docker compose up -d --build
```

That's it! All services running.

### 7. ✅ File Uploads (Images & PDFs)

**NO MODIFICATIONS NEEDED!** ✅

Your upload system:
- Uses Docker volume: `uploads-data:/app/uploads`
- Nginx serves files from `/uploads/` path
- Persists across container restarts
- Works exactly like local development

**What this means:**
1. Deploy to VPS
2. Access admin tool
3. Upload images/PDFs
4. Everything works automatically!

**Backend already configured:**
- `FileUploadService.java` - handles uploads
- `AdminProfileController.java` - resume PDF upload
- Frontend - downloads from correct URL

**No changes needed!** Just upload via admin tool once deployed.

---

## 📝 Deployment Order (Correct Sequence)

Follow this exact order:

```
1. Purchase VPS (Hetzner/DigitalOcean)
   ↓
2. Add DNS A records (@ and www → VPS IP)
   ↓
3. [OPTIONAL] Setup Cloudflare CDN
   ↓
4. SSH into VPS + Install Docker
   ↓
5. Clone your repository to /var/www/portfolio
   ↓
6. Add your IP to nginx/admin-ips.conf
   ↓
7. Create .env file (passwords, domain)
   ↓
8. Update nginx.conf (replace YOUR_DOMAIN)
   ↓
9. Deploy with Docker: docker compose up -d --build
   ↓
10. Get SSL certificate: docker compose run --rm certbot
    ↓
11. Clean demo data: Run cleanup-demo-data.sql
    ↓
12. Access admin + Upload your content
    ↓
13. Setup GitHub Actions CI/CD
    ↓
14. Test everything!
```

---

## 📚 Documentation Files Created

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | **Detailed step-by-step guide** (read this!) |
| `DEPLOYMENT-CHECKLIST.md` | Quick checklist format |
| `docker-compose.yml` | Docker orchestration |
| `backend/Dockerfile` | Backend container |
| `nginx/nginx.conf` | Web server + reverse proxy |
| `nginx/admin-ips.conf` | **IP whitelist for admin** |
| `.env.example` | Environment variables template |
| `.github/workflows/deploy.yml` | **CI/CD auto-deployment** |
| `cleanup-demo-data.sql` | Remove test data |

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| VPS purchase + setup | 30 min |
| Domain DNS | 15 min |
| Cloudflare | 20 min |
| Docker deployment | 45 min |
| SSL setup | 15 min |
| Clean data + add content | 30 min |
| CI/CD | 20 min |
| **Total** | **~3 hours** |

*Note: DNS propagation may take 24-48 hours for Cloudflare nameservers*

---

## 🎉 What You Get

After deployment:

✅ **Production website** at `https://yourdomain.com`
✅ **Secure admin panel** (IP-restricted)
✅ **Free SSL certificate** (auto-renewing)
✅ **Free CDN** (Cloudflare)
✅ **Auto-deployments** (push to GitHub → live)
✅ **File uploads working** (images + PDFs)
✅ **Database backups** (automated)
✅ **Container orchestration** (Docker)
✅ **Nginx reverse proxy** (optimized)
✅ **Rate limiting** (DDoS protection)

---

## 🚀 Quick Start Command

Once you're on the VPS with everything configured:

```bash
cd /var/www/portfolio
docker compose up -d --build
```

That's literally it! Your full-stack app is live.

---

## 💡 Pro Tips

1. **Use Hetzner** for best price/performance
2. **Use Cloudflare** for free CDN + SSL
3. **Backup your `.env` file** securely
4. **Setup UptimeRobot** for monitoring
5. **Enable 2FA** on all accounts
6. **Keep Docker images updated** monthly
7. **Monitor logs** regularly
8. **Test uploads** after deployment

---

## ❓ Common Questions

**Q: Do I need to change upload code for VPS?**
A: **NO!** Docker volumes handle everything automatically.

**Q: How do I update the site after deployment?**
A: Just push to GitHub main branch. CI/CD auto-deploys!

**Q: Is admin panel safe?**
A: YES! Only whitelisted IPs can access /admin.

**Q: What if I change my IP?**
A: Edit `nginx/admin-ips.conf` and restart: `docker compose restart nginx`

**Q: Can I use a different domain later?**
A: Yes! Update `.env` and `nginx.conf`, then restart containers.

**Q: How do I backup data?**
A: Database: `docker exec portfolio-mysql mysqldump ...`
   Uploads: `docker run --rm -v uploads-data:/data ...`

---

## 📖 Next Steps

1. **Read**: `DEPLOYMENT.md` for detailed instructions
2. **Follow**: `DEPLOYMENT-CHECKLIST.md` step-by-step
3. **Deploy**: Your website to VPS
4. **Upload**: Your content via admin tool
5. **Enjoy**: Your live portfolio! 🎉

---

**Ready to deploy?** Start with `DEPLOYMENT.md`!

Good luck! 🚀
