# Tradebd — Trading Academy, Chart Analysis & Paper Trading Platform

**Tradebd** হলো একটি আধুনিক মাল্টি-ল্যাঙ্গুয়েজ (বাংলা ও আন্তর্জাতিক ৮টি ভাষা) ট্রেডিং একাডেমি, টেকনিক্যাল অ্যানালাইসিস চার্ট ওয়ার্কস্টেশন (**CRYPTO** ও **FOREX** আলাদা সেকশনসহ), পেপার ট্রেডিং সিমুলেটর এবং এআই ট্রেড মেন্টর প্ল্যাটফর্ম।

---

## GitHub Repo-এর মাধ্যমে Procloudify.com (cPanel)-এ হোস্ট করার সম্পূর্ণ গাইড

এই প্রজেক্টটি **Procloudify.com**-এর cPanel হোস্টিংয়ে দুইভাবে হোস্ট করা যাবে—**পদ্ধতি ১: Node.js App (AI Backend-সহ সম্পূর্ণ ফুল-স্ট্যাক)** এবং **পদ্ধতি ২: Static / Git Version Control (`public_html`)**।

---

### পদ্ধতি ১: cPanel "Setup Node.js App" ও GitHub Repo ব্যবহার করে হোস্টিং (প্রস্তাবিত)

১. **GitHub রেপোজিটরি ক্লোন করুন:**
   - আপনার **Procloudify cPanel**-এ লগইন করে **Git™ Version Control** অপশনে যান।
   - **Create**-এ ক্লিক করে আপনার GitHub রেপোজিটরি URL দিন।
   - **Repository Path** দিন (যেমন: `/home/yourusername/tradebd`) এবং **Create** বাটনে ক্লিক করুন।

২. **Node.js অ্যাপ সেটআপ করুন:**
   - cPanel থেকে **Setup Node.js App**-এ যান এবং **Create Application**-এ ক্লিক করুন।
   - **Node.js version:** `20.x` অথবা `22.x` নির্বাচন করুন।
   - **Application mode:** `Production` দিন।
   - **Application root:** `tradebd` (আপনার ক্লোন করা রেপো ফোল্ডার)।
   - **Application URL:** আপনার ডোমেইন নির্বাচন করুন।
   - **Application startup file:** `app.cjs` লিখুন (এটি রেপোজিটরিতে আগে থেকেই তৈরি করা আছে)।
   - **Environment variables (ঐচ্ছিক কিন্তু প্রস্তাবিত):**
     - `NODE_ENV` = `production`
     - `GEMINI_API_KEY` = `আপনার_জেমিনি_এপিআই_কি` (না দিলেও রুল-বেসড ফলোব্যাক ইঞ্জিন স্বয়ংক্রিয়ভাবে কাজ করবে)
   - **Create** বাটনে ক্লিক করুন।

৩. **ডিপেন্ডেন্সি ইনস্টল ও বিল্ড করুন:**
   - Node.js App পেজে **Run NPM Install** বাটনে ক্লিক করুন।
   - এরপর cPanel **Terminal** (অথবা SSH)-এ গিয়ে নিচের কমান্ডটি চালান (অথবা **Run JS script** থেকে `build` নির্বাচন করে রান করুন):
     ```bash
     npm run build
     ```
   - সর্বশেষে Node.js App পেজ থেকে **Restart** বাটনে ক্লিক করুন। আপনার সাইটটি লাইভ হয়ে যাবে!

---

### পদ্ধতি ২: cPanel Git™ Version Control বা সরাসরি `public_html`-এ হোস্টিং (Node.js ছাড়াও চলবে)

আপনার হোস্টিং প্যাকেজে যদি Node.js না থাকে, তবুও সাইটটির চার্ট, ফরেক্স ও ক্রিপ্টো সিমুলেটর, একাডেমি, রিস্ক ক্যালকুলেটর এবং ক্লায়েন্ট-সাইড এআই মেন্টর সম্পূর্ণ কাজ করবে:

১. আপনার কম্পিউটারে রেপোজিটরিটি ক্লোন করে বিল্ড করুন:
   ```bash
   npm install
   npm run build
   ```
২. বিল্ড হওয়ার পর তৈরি হওয়া `dist/` ফোল্ডারের ভেতরের সব ফাইল (`.htaccess`-সহ) প্রোক্লাউডিফাই cPanel-এর `public_html` ফোল্ডারে আপলোড করুন, অথবা `dist/` ফোল্ডারটি GitHub-এ পুশ করে cPanel **Git™ Version Control -> Manage -> Pull or Deploy -> Deploy HEAD Commit**-এ ক্লিক করুন (`.cpanel.yml` স্বয়ংক্রিয়ভাবে `public_html`-এ ফাইল কপি করে দেবে)।

---

## লোকাল ডেভেলপমেন্ট কমান্ডসমূহ

```bash
# ডিপেন্ডেন্সি ইনস্টল
npm install

# ডেভেলপমেন্ট সার্ভার চালু (Port 3000)
npm run dev

# প্রোডাকশন বিল্ড (dist/ এবং server.js তৈরি করবে)
npm run build

# প্রোডাকশন সার্ভার চালু
npm run start:prod
```
