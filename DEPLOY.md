# دليل النشر وربط الدومين

## ٠. اقرأ هذا أولاً: أي استضافة تصلح؟

هذا الموقع **تطبيق Next.js يحتاج بيئة تشغيل Node.js**، وليس صفحات HTML
ثابتة. السبب ليس اختياراً تقنياً بل متطلبات المنتج نفسه:

| ما يحتاج خادماً | لماذا |
|---|---|
| `POST /api/register` و `/api/contact` | استقبال التسجيلات وإرسال البريد والواتساب |
| `middleware.ts` | كشف لغة الزائر وإعادة توجيهه إلى `/ar` أو `/en` |
| لوحة الدفعات وصفحة التسجيل | تُعرض خارج الكاش حتى لا يظهر مقعد محجوز كمتاح |
| `/studio` | لوحة تحرير المحتوى |
| صور المشاركة | تُولَّد عند الطلب |

**لن يعمل** على استضافة مشتركة تقدّم PHP فقط (cPanel التقليدي بلا Node)،
ولا على رفع مجلد HTML عبر FTP. إن كانت استضافتك من هذا النوع، فأمامك:
الانتقال إلى Vercel (§١)، أو خادم VPS بـ Node (§٢).

> **هل يمكن تصديره ثابتاً؟** تقنياً نعم بحذف نموذج التسجيل ونظام اللغة
> التلقائي — أي بحذف سبب وجود الموقع. لا أنصح به.

---

## ١. Vercel — المسار الموصى به

من صنع Next.js، ويغطي كل متطلبات الجدول أعلاه بلا إعداد، والخطة المجانية
تكفي هذا الموقع تماماً.

### ١.١ النشر

1. ارفع المشروع إلى مستودع على GitHub (أو GitLab / Bitbucket).
2. ادخل [vercel.com/new](https://vercel.com/new) واختر المستودع.
3. اترك كل الإعدادات كما هي — Vercel يتعرّف على Next.js تلقائياً:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: (يُترك فارغاً)
4. اضغط **Deploy**. خلال دقيقتين تقريباً ستحصل على رابط
   `اسم-المشروع.vercel.app`.

الموقع يعمل من أول نشر بلا أي متغيّر بيئة (يقرأ المحتوى التجريبي).

### ١.٢ ربط الدومين

من لوحة المشروع → **Settings → Domains** → أضف دومينك، ثم اضبط
سجلات DNS عند مسجّل الدومين (GoDaddy، Namecheap، Cloudflare…):

| النوع | الاسم | القيمة |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

> تحقّق من القيم في لوحة Vercel وقت الإضافة — قد تتغيّر، واللوحة تعرض
> القيم الصحيحة لحسابك.

بعد انتشار DNS (من دقائق إلى ٤٨ ساعة) يصدر Vercel شهادة SSL تلقائياً.
اختر في اللوحة أي النسختين هي الأساسية (`example.com` أو
`www.example.com`) ليعيد التوجيه من الأخرى بـ 301 ثابتة.

### ١.٣ متغيّرات البيئة

Settings → Environment Variables. **أضف على الأقل:**

```
NEXT_PUBLIC_SITE_URL = https://your-domain.com
```

بدونه تشير روابط canonical وصور المشاركة إلى `localhost`، فينكسر SEO.
البقية اختيارية وموثّقة في `.env.example`، وكل مجموعة تُفعّل ميزتها:

| المجموعة | بدونها |
|---|---|
| Sanity | يعمل بالمحتوى التجريبي، ولا تُحفظ التسجيلات في مخزن دائم |
| Resend | لا تصلك إشعارات بريدية |
| Meta WhatsApp | يعمل بزر `wa.me` بدل الإرسال التلقائي |
| Turnstile | لا يُحمَّل، والحماية تبقى بحقل الشرك وحد المعدّل |

> **تحذير مهم:** لا تعتمد التسجيلات على الإنتاج قبل ضبط **Sanity أو
> Resend** على الأقل. بدون أي منهما يرفض الخادم الطلب بخطأ صريح (وهذا
> مقصود: أن يختفي تسجيل بصمت أسوأ من أن يفشل بصوت عالٍ).

بعد إضافة أي متغيّر أعد النشر (Deployments → أحدث نشر → Redeploy).

---

## ٢. خادم VPS خاص (Node.js)

يصلح إن كان لديك خادم على DigitalOcean أو Hetzner أو Contabo أو ما شابه.

### ٢.١ المتطلبات

- Node.js 20 أو أحدث (الموصى به 22)
- مدير عمليات مثل PM2
- خادم وكيل عكسي مثل Nginx
- شهادة SSL عبر Let's Encrypt (Certbot)

### ٢.٢ خطوات النشر

```bash
# على الخادم
git clone <رابط-المستودع> /var/www/trainer-site
cd /var/www/trainer-site

npm ci
cp .env.example .env.local   # ثم عدّل القيم
npm run build

npm install -g pm2
pm2 start "npm run start" --name trainer-site
pm2 save
pm2 startup            # لتشغيله تلقائياً بعد إعادة تشغيل الخادم
```

التطبيق يستمع على المنفذ `3000` افتراضياً. لتغييره:
`pm2 start "npx next start -p 8080" --name trainer-site`

### ٢.٣ إعداد Nginx

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # مطلوب: تحديد معدّل الطلبات يعتمد على عنوان الزائر الحقيقي
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
    }
}
```

ثم:

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

### ٢.٤ ربط الدومين

عند مسجّل الدومين:

| النوع | الاسم | القيمة |
|---|---|---|
| `A` | `@` | عنوان IP الخاص بخادمك |
| `A` | `www` | نفس العنوان |

### ٢.٥ التحديثات اللاحقة

```bash
cd /var/www/trainer-site
git pull
npm ci
npm run build
pm2 reload trainer-site
```

---

## ٣. لوحة المحتوى (Sanity)

الموقع يعمل بلا Sanity، لكنك ستحتاجها لتعديل الدورات والأسعار والمقاعد
دون لمس الكود.

1. أنشئ مشروعاً على [sanity.io/manage](https://www.sanity.io/manage).
2. انسخ **Project ID** إلى `NEXT_PUBLIC_SANITY_PROJECT_ID`.
3. أنشئ توكن كتابة (Editor) وضعه في `SANITY_API_WRITE_TOKEN` — **خادمي
   فقط، لا يُسبق بـ `NEXT_PUBLIC_`**.
4. أضف دومينك إلى قائمة CORS المسموحة في لوحة Sanity.
5. اللوحة تصبح متاحة على `https://your-domain.com/studio`.

**إبطال الكاش فور التعديل:** في Sanity → API → Webhooks:

- URL: `https://your-domain.com/api/revalidate`
- Trigger on: Create, Update, Delete
- HTTP method: `POST`
- Secret header: `x-revalidate-secret` بنفس قيمة `SANITY_REVALIDATE_SECRET`

---

## ٤. واتساب (WhatsApp Cloud API)

هذا المسار الأطول لأنه يعتمد على موافقة Meta. **ابدأه مبكراً**، والموقع
يعمل بزر `wa.me` البديل حتى يكتمل.

1. حساب Meta Business موثّق.
2. رقم واتساب مخصّص للأعمال (لا يكون مستخدماً على تطبيق واتساب العادي).
3. أنشئ قالبَي رسالة واطلب اعتمادهما:
   `registration_confirmation_ar` و `registration_confirmation_en`،
   بأربعة متغيّرات: الاسم، اسم الدورة، تاريخ البدء، النمط.
4. ضع `WHATSAPP_PHONE_NUMBER_ID` و `WHATSAPP_ACCESS_TOKEN` في متغيّرات
   البيئة.

الاعتماد يستغرق عادة من ساعات إلى ٢٤ ساعة، وقد يُرفض ويحتاج إعادة صياغة.

---

## ٥. قائمة تحقق قبل الإعلان عن الموقع

- [ ] `NEXT_PUBLIC_SITE_URL` مضبوط على الدومين الفعلي
- [ ] Sanity أو Resend مضبوط (وإلا فشلت التسجيلات عمداً)
- [ ] استُبدل كل محتوى `[PLACEHOLDER]` — راجع `content/PLACEHOLDERS.md`
- [ ] `npm run check:placeholders` يمرّ بعد البناء
- [ ] رُفعت صور الشهادات وروابط التحقق الرسمية
- [ ] لقطات آراء المتدربين منشورة **بموافقة أصحابها**
- [ ] السيرة الذاتية PDF مرفوعة بالنسختين
- [ ] رقم الواتساب والبريد الحقيقيان في الإعدادات
- [ ] سياسة الخصوصية روجعت قانونياً
- [ ] الدومين يعمل مع SSL، وتوجيه `www` ثابت
- [ ] أُضيف الموقع إلى Google Search Console وأُرسل `sitemap.xml`
- [ ] فُعِّل Vercel Analytics من لوحة المشروع

---

## ٦. أخطاء شائعة عند النشر

| العرض | السبب والحل |
|---|---|
| روابط canonical تشير إلى `localhost` | `NEXT_PUBLIC_SITE_URL` غير مضبوط، أو أُضيف بعد النشر بلا Redeploy |
| صور المشاركة فارغة من النص | تعذّر جلب الخط العربي — تحقق من أن الخادم يصل إلى `fonts.googleapis.com` |
| التسجيل يعيد خطأ 500 | لا Sanity ولا Resend مضبوط: الطلب لا يصل إلى أي مكان فيفشل عمداً |
| المحتوى لا يتحدث بعد التعديل في Sanity | webhook الإبطال غير مضبوط أو السرّ غير متطابق |
| حد المعدّل يمنع مستخدمين خلف نفس الشبكة | على VPS: تأكد من تمرير `X-Forwarded-For` في Nginx |
| `/studio` يعطي خطأ CORS | أضف الدومين في إعدادات CORS بلوحة Sanity |
