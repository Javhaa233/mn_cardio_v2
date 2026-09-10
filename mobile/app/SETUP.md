# Ажлын орчин бэлтгэх

Энэ агуулахад **`lib/` бүрэн бичигдсэн**, харин `android/` ба `ios/` хавтас
байхгүй. Тэдгээрийг Flutter SDK өөрөө үүсгэнэ — Gradle wrapper-ийн `.jar`,
Xcode төслийн файл зэрэг хоёртын файлыг эх бичвэрээр нөхөх боломжгүй.

---

## 1. Урьдчилсан шаардлага

| Хэрэгсэл | Хувилбар | Тэмдэглэл |
|---|---|---|
| Flutter SDK | 3.27 буюу түүнээс дээш | `flutter doctor` цэвэр байх |
| Android Studio | сүүлийн | Android SDK + platform-tools |
| JDK | 17 | Android Gradle Plugin 8.x шаардана |
| Xcode | 15+ | Зөвхөн iOS билд, macOS дээр |

`flutter doctor` дээр Android лиценз хүлээгдэж байвал:
`flutter doctor --android-licenses`.

---

## 2. Автомат тохиргоо

```powershell
cd mobile/app
powershell -ExecutionPolicy Bypass -File tool/bootstrap.ps1
```

Скрипт дараах зүйлийг хийнэ:

1. `flutter create --platforms=android,ios --org mn.telemedicine --project-name mncardio .`
   — байгаа файлыг дарж бичихгүй, зөвхөн платформын хавтсыг нөхнө.
2. `AndroidManifest.xml` дээр эрхүүд ба мэдэгдлийн хүлээн авагчид нэмнэ.
3. Debug манифест үүсгэж, зөвхөн хөгжүүлэлтийн билд дээр HTTP-г зөвшөөрнө.
4. `minSdk = 23` болгоно.
5. `Info.plist` дээр зөвшөөрлийн монгол тайлбарууд нэмнэ.
6. `flutter pub get`.

Скрипт **давтан ажиллуулахад аюулгүй**.

---

## 3. Гараар хийх шаардлагатай ганц зүйл — core library desugaring

`flutter_local_notifications` нь Java 8+ API-г хуучин Android дээр ажиллуулахын
тулд desugaring шаарддаг. Үүнийг скрипт автоматаар хийхгүй, учир нь Gradle
файлын бүтэц Flutter-ийн хувилбар бүрд өөр байдаг.

`android/app/build.gradle.kts` дотор:

```kotlin
android {
    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.2")
}
```

Хэрэв `build.gradle` (Groovy) бол:

```groovy
android {
    compileOptions {
        coreLibraryDesugaringEnabled true
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.2'
}
```

Үүнийг хийхгүй бол билд `Dependency ... requires desugaring` гэсэн алдаагаар
унана.

---

## 4. Сервер — юу ч тохируулах шаардлагагүй

Апп анхдагчаар **амьд туршилтын сервер** рүү холбогдоно:

```
https://mncardio.itsystem.mn
```

Тиймээс локал backend, SQL Server өргөтгөх шаардлагагүй. Дэлгэрэнгүйг
[../QUICKSTART.md](../QUICKSTART.md).

**Нэвтрэх бүртгэл** (эмч, үйлчлүүлэгч, админ) нь `test-environment.env` дотор
бөгөөд аль ч агуулахад **байхгүй**. ITsystem-ээс тусад нь авна.

> Нууц үг, бүртгэлийг энэ хавтас дотор файлд **хэзээ ч бичихгүй**.
> `verify-no-secrets.js` тэдгээрийг хайж олоод export-ыг унагаана.

### Үйлчлүүлэгчийн нэвтрэх нэр нь кирилл — анхаараарай

Үйлчлүүлэгч **регистрийн дугаараар** нэвтэрдэг бөгөөд эхний хоёр үсэг нь
кирилл: `ПП83011709`, латин `PP` **биш**. Хоёр нь ихэнх фонтод ялгагдахгүй ч
өөр байт.

Аппын хувьд асуудалгүй — `dio` UTF-8-ыг зөв илгээдэг. Харин гараар curl,
PowerShell-ээр туршихад `Get-Content -Encoding UTF8` хэрэглэхгүй бол нэр
эвдэрч, "нууц үг буруу" мэт харагдана.

### Локал backend рүү холбогдох бол

```bash
cd ../../backend
cp config/Config-Template.env config/Config.env   # утгуудыг бөглөнө
npm install
npm run dev                                       # http://localhost:5001
```

Дараа нь аппыг `--dart-define` -ээр чиглүүлнэ (доор), эсвэл хөгжүүлэлтийн
билд дээр нэвтрэх дэлгэцийн **лого дээр удаан дарж** хаягийг сольж болно.

---

## 5. Ажиллуулах

```bash
# Анхдагч — туршилтын сервер рүү холбогдоно, нэмэлт тохиргоогүй
flutter run

# Локал backend (Android эмулятор хостыг 10.0.2.2 гэж хардаг)
flutter run --dart-define=MNCARDIO_API_BASE_URL=http://10.0.2.2:5001

# Локал backend, бодит төхөөрөмж — компьютерийн LAN IP
flutter run --dart-define=MNCARDIO_API_BASE_URL=http://192.168.1.10:5001
```

**`localhost` ажиллахгүй** — утас болон эмулятор өөрсдийн `localhost`-ыг хардаг.

---

## 6. Эхлээд холболтоо шалгах

Аппыг ажиллуулахаас өмнө сервер хариулж байгааг батлах хамгийн хурдан зам:

```bash
cd ..                 # mobile/
node client/smoke.js  # долоон дуудлага, нэмэлт багцгүй
```

Эсвэл гараар:

```bash
# 1) Нэвтрэх
curl -X POST https://mncardio.itsystem.mn/api/PatientUser/Login \
  -H "Content-Type: application/json" \
  -d '{"UserName":"<регистр>","Password":"<нууц үг>"}'

# 2) Токеноор өөрийн бүртгэлийг унших
curl https://mncardio.itsystem.mn/api/patient/me \
  -H "Authorization: Bearer <token>"
```

`403 PATIENT_NOT_RESOLVED` ирвэл энэ нь **кодын алдаа биш**: тухайн бүртгэлд
холбогдох `Patient` мөр байхгүй байна. Өгөгдлийн асуудал — эмнэлгийн
бүртгэлийн хэсэгт хандана.

---

## 7. Билд

```bash
# Android — туршилтад
flutter build apk --release --dart-define=MNCARDIO_API_BASE_URL=https://mncardio.itsystem.mn

# Android — Play Store
flutter build appbundle --release --dart-define=MNCARDIO_API_BASE_URL=https://<үйлдвэрлэлийн сервер>

# iOS
flutter build ipa --release --dart-define=MNCARDIO_API_BASE_URL=https://<үйлдвэрлэлийн сервер>
```

> **Дэлгүүрийн бүртгэл хараахан байхгүй.** Apple Developer ба Google Play
> бүртгэлийг **ЗСҮТ-ийн нэр дээр** нээх шаардлагатай (BLOCKERS.md §2). Apple-ийн
> байгууллагын бүртгэлд D-U-N-S дугаар шаардагдах бөгөөд долоо хоногоор
> үргэлжилдэг.

---

## 8. Гарын үсгийн түлхүүр

`android/key.properties` ба `.jks` файлыг **хэзээ ч git-д оруулахгүй** —
`.gitignore` дээр аль хэдийн хаасан. Түлхүүрийг ЗСҮТ эзэмшинэ, эс бөгөөс
хүлээлгэн өгөх үед аппыг шинэчлэх боломжгүй болно.
