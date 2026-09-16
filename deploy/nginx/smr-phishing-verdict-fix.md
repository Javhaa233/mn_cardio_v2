# smr.telemedicine.mn — Avast «URL:Phishing» хориг: шалтгаан ба засвар

**Хэнд:** `smr.telemedicine.mn` (103.87.69.175) серверийн root эрхтэй администратор.
**Огноо:** 2026-09-16
**Яаралтай эсэх:** Тийм. Avast суулгасан бүх компьютер системд нэвтэрч чадахгүй байна.

---

## 1. Юу болсон бэ

2026-09-16-нд Avast `smr.telemedicine.mn` рүү холбогдохыг хориглож эхэлсэн.
Ангилал: **URL:Phishing**. Detection ID: `154dfdf7b2bd / 2026-09-16T01:55:28.874Z`.

Худал илрүүлэлтийн мэдэгдлийг Avast-руу илгээсэн
(`4173edb9fb43 / 2026-09-16T02:18:25.656Z`). Avast 24 цагийн дотор дахин шалгана.

**Гэхдээ мэдэгдэл илгээх нь шалтгааныг арилгахгүй.** Доорх тохиргоог зассангүй
бол хориг дахин давтагдана.

## 2. Серверийг шалгасан дүн (2026-09-16, гаднаас уншсан хүсэлтээр)

| Шалгасан зүйл | Үр дүн |
|---|---|
| DNS | `103.87.69.175`, nginx/1.26.3 (Ubuntu) |
| SSL гэрчилгээ | Хүчинтэй — Sectigo DV wildcard `*.telemedicine.mn`, **2026-11-29** хүртэл |
| `http://` → `https://` | 301 redirect ажиллаж байна |
| Нүүр хуудас | Жинхэнэ MnCardio build, сүүлд **2026-09-03**-нд шинэчлэгдсэн |
| Аюулгүй байдлын header | **Огт байхгүй** — HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Байхгүй хаяг руу хандах | **Бүх хаяг HTTP 200 буцааж, нэвтрэх хуудсыг харуулж байна** |

Сервер эвдрээгүй, хортой контент байхгүй. Асуудал сүүлийн мөрөнд байна:

```
GET /health                          -> 200  text/html  2819 bytes
GET /this-path-does-not-exist-12345  -> 200  text/html  2819 bytes
GET /secure/verify-account/login     -> 200  text/html  2819 bytes
GET /wp-login.php                    -> 200  text/html  2819 bytes
```

Ямар ч хаяг 404 буцаахгүй. nginx-ийн SPA fallback (`try_files $uri $uri/ /index.html`)
хэн ямар ч хаяг зохиосон нэвтрэх маягтыг үзүүлнэ. Өөрөөр хэлбэл
`https://smr.telemedicine.mn/secure/verify-account/login` гэсэн хаяг жинхэнэ
эмнэлгийн домэйн дээр ажиллаж байгаа нэвтрэх хуудас шиг харагдана — энэ нь
фишингийн автомат ангилагч яг хайдаг загвар мөн.

Нэмэлт сөрөг дохио: аюулгүй байдлын header байхгүй, нэвтрэх хуудас 4 өөр гадны
CDN-ээс скрипт татдаг (тэдгээрийн нэг нь `html2canvas.hertzen.com` — хувь хүний
домэйн). Эдгээр скриптүүд өөрсдөө цэвэр, гэхдээ домэйний нэр хүндийн үнэлгээг
бууруулдаг.

## 3. Хийх засвар

### 3.1 Байхгүй хаяг 404 буцаадаг болгох (гол засвар)

`/etc/nginx/sites-available/` доторх `smr.telemedicine.mn`-ий server блокт:

```nginx
# Файл шиг харагдах хаяг заавал 404 буцаана — нэвтрэх хуудас БУЦААХГҮЙ.
# Яг энэ зан нь домэйныг фишинг гэж ангилуулсан.
location ~* \.(php|asp|aspx|jsp|cgi|pl|env|git|sql|bak|old|zip|tar|gz)$ {
    access_log off;
    return 404;
}

# Фишингийн түгээмэл замууд
location ~* ^/(wp-admin|wp-includes|wp-content|xmlrpc|cgi-bin|vendor|\.git|\.env) {
    access_log off;
    return 404;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

Илүү найдвартай хувилбар: fallback-ийг зөвхөн аппын жинхэнэ prefix-үүдээр
хязгаарлах (`/admin`, `/auth`, `/patient`, `/assets` гэх мэт), бусад бүхэн 404.

### 3.2 Аюулгүй байдлын header нэмэх

Мөн server блокт:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options    "nosniff" always;
add_header X-Frame-Options           "SAMEORIGIN" always;
add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
```

CSP-г одоохондоо нэмэхгүй: аппын одоогийн нэвтрэх хуудас гадны 4 CDN-ээс
скрипт татдаг тул CSP нь аппыг эвдэх магадлалтай. Эхлээд 3.3-ыг хий.

### 3.3 Шинэ build тавих

Одоогийн production build 2026-09-03-ынх. Репод байгаа шинэ `frontend/index.html`
ашиглагдаагүй 4 гадны CDN хамаарлыг аль хэдийн хассан (chartist CSS+JS,
давхардсан html2canvas, jvectormap CSS, dataTables CSS — ойролцоогоор 250 KB,
5 блоклох хүсэлт). Гадны эх сурвалж цөөрөх тусам нэр хүндийн үнэлгээ сайжирна,
нэвтрэх хуудас ч хурдан нээгдэнэ.

### 3.4 Шалгах

```bash
nginx -t && systemctl reload nginx

curl -s -o /dev/null -w '%{http_code}\n' https://smr.telemedicine.mn/wp-login.php   # 404 байх ёстой
curl -s -o /dev/null -w '%{http_code}\n' https://smr.telemedicine.mn/              # 200
curl -sI https://smr.telemedicine.mn/ | grep -i strict-transport                   # header гарч ирнэ
```

`/wp-login.php` нь 200 биш **404** буцаавал засвар амжилттай.

## 4. Эмнэлгийн компьютерууд дээрх түр шийдэл

Avast цагаан жагсаалтад оруулах хүртэл (24 цаг) эмч нар ажиллах боломжтой байх:

Avast → Menu → Settings → General → **Exceptions** → Add Exception →
`smr.telemedicine.mn` болон `https://smr.telemedicine.mn/*` нэмэх.

Энэ нь тухайн компьютер дээр л үйлчилнэ. Олон компьютер дээр хийх бол
Avast Business ашиглаж байгаа бол бодлогоор нэг дор тараах боломжтой.

## 5. 24 цагийн дараа

```
https://smr.telemedicine.mn/ нээж үзэх
```

Хэрэв хориг арилаагүй бол:
1. Дээрх detection ID-нуудыг хавсаргаж https://www.avast.com/false-positive-file-form.php
   дээр дахин мэдэгдэх.
2. https://www.virustotal.com дээр домэйныг шалгаж, зөвхөн Avast мөн үү, эсвэл
   Google Safe Browsing ч бас жагсаасан уу гэдгийг тогтоох. Google жагсаасан бол
   Chrome өөрөө хориглож эхэлнэ — тэр тохиолдолд Google Search Console-оор
   дамжуулан Security Issues хэсгээс дахин шалгуулах хүсэлт илгээх шаардлагатай.
```
