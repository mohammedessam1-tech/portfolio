# Hostinger DNS Setup Guide for mohammedessam.site

This guide explains how to configure the DNS settings for your custom domain `mohammedessam.site` inside your Hostinger account to connect it to your GitHub Pages website.

---

## Step 1: Log in to Hostinger
1. Go to [Hostinger hPanel](https://hpanel.hostinger.com/) and log in.
2. Navigate to the **Domains** section at the top menu.
3. Click **Manage** next to your domain `mohammedessam.site`.

---

## Step 2: Access DNS Zone Editor
1. In the left-hand sidebar, click on **DNS / Nameservers**.
2. Make sure you are using Hostinger's default nameservers (if not, reset them to default).
3. Scroll down to the **DNS Records** management area.

---

## Step 3: Configure DNS Records

You need to add/update two types of records: **A records** (for the root domain `mohammedessam.site`) and a **CNAME record** (for the `www.mohammedessam.site` subdomain).

> [!WARNING]
> If you see any existing **A records** with the host `@` or **CNAME records** with the host `www`, edit them or delete them first to avoid conflicts.

### 1. Add A Records (Root Domain)
Create **four** separate A records with the following details:

| Type | Name (Host) | Points to (IP Address) | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` | **`185.199.108.153`** | Default (or 14400) |
| **A** | `@` | **`185.199.109.153`** | Default (or 14400) |
| **A** | `@` | **`185.199.110.153`** | Default (or 14400) |
| **A** | `@` | **`185.199.111.153`** | Default (or 14400) |

*These IPs are the official servers for GitHub Pages.*

### 2. Add CNAME Record (Subdomain)
Create a CNAME record so that `www.mohammedessam.site` redirects to your site:

| Type | Name (Host) | Points to (Target) | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` | **`mohammedessam1-tech.github.io`** | Default (or 14400) |

> [!NOTE]
> Make sure the CNAME target is exactly `mohammedessam1-tech.github.io` without `http://`, `https://`, or any slashes.

---

## Step 4: Verify on GitHub
Once you save the DNS records in Hostinger:
1. DNS propagation can take anywhere from **5 minutes to a few hours**.
2. Go to your GitHub repository: `mohammedessam1-tech/portfolio`.
3. Go to **Settings** -> **Pages** (in the sidebar).
4. Under **Custom domain**, ensure `mohammedessam.site` is entered and click **Save** (it should automatically show up if the `CNAME` file is in your repository).
5. Tick the checkbox for **Enforce HTTPS** (this may take a few minutes to become clickable while GitHub provisions your SSL certificate).

---

## Done! 🚀
You can check if the DNS settings have propagated by visiting [DNSChecker](https://dnschecker.org/#A/mohammedessam.site).
