# Андройд билд хийх үед илэрсэн зүйлс — 2026-09-16

Аппликейшнийг **анх удаа** билд хийж, туршилтын сервер дээр тавих явцад илэрсэн жагсаалт.

`mobile/app/lib/**` (Dart код) дотор бид **юу ч өөрчлөөгүй**. Зөвхөн нэг файлын нэг
мөрийг өөрчилсөн — доорх §0-г үзнэ үү. Бусад нь зөвхөн мэдээлэл.

Билдийн бүрэн заавар: [`APK-RELEASE.md`](APK-RELEASE.md).
Татах хуудас: <https://mncardio.itsystem.mn/apk>

---

## 0. БИД НЭГ МӨР ӨӨРЧИЛСӨН — `compileSdk = 37`

`android/app/build.gradle.kts:9`

```kotlin
compileSdk = 37            // өмнө нь: flutter.compileSdkVersion
```

**Яагаад.** `permission_handler_android` 14.1.0 нь `compileSdk = 37`-оор
эмхэтгэгддэг бөгөөд өөрөөс нь хамаарах бүх төслөөс мөн адилыг шаарддаг AAR
metadata нийтэлдэг. Flutter 3.44-ийн анхдагч утга нь 36 тул билд дараах
алдаагаар зогсоно:

```
Execution failed for task ':app:checkReleaseAarMetadata'.
> Dependency ':permission_handler_android' requires ... version 37 or later
  :app is currently compiled against android-36.
```

Flutter өөрөө яг энэ мөрийг нэмэхийг зөвлөдөг.

**Аюулгүй эсэх.** `compileSdk` нь зөвхөн *ямар API-д хандаж болохыг* тодорхойлно.
`minSdk` (ямар төхөөрөмж дээр суулгаж болох) ба `targetSdk` (ямар ажиллагааны
дүрмийг сонгох) хоёр **хөндөгдөөгүй**, хэвээрээ Flutter-ээс ирсээр байна.

**Анхаарах.** AGP 9.0.1 нь 36-г "хамгийн их *зөвлөмжтэй*" гэж үздэг тул
сэрэмжлүүлэг гарч болно — алдаа биш. Flutter-ийн анхдагч утга 37 болмогц
`flutter.compileSdkVersion` рүү буцаах нь зүйтэй. Файл дотор яг энэ тайлбарыг
бичсэн байгаа.

> Хэрэв та энэ өөрчлөлтийг **хүсэхгүй** бол өөр арга бол `permission_handler`-ийг
> 12.x рүү буулгах (тэр нь `compileSdk 34`) — гэхдээ энэ нь хамаарлыг доош
> нь татах тул бид сонгоогүй.

---

## 1. Dart кодын алдаанаас болж билд зогсоогүй

Нэг ч Dart/Kotlin эмхэтгэлийн алдаа гараагүй. Билд дөрвөн удаа зогссон боловч
шалтгаан бүр нь **орчны** асуудал байсан:

| # | Шалтгаан | Шийдэл |
|---|---|---|
| 1 | Сүлжээ — `dl.google.com` timeout | `GRADLE_OPTS` timeout уртасгасан |
| 2 | Android SDK 37 байхгүй | SDK дотор засварласан (доор) |
| 3 | Gradle daemon хуучин SDK мэдээллийг кэшэлсэн | daemon-уудыг унтраасан |
| 4 | `compileSdk` 36 байсан | §0 — нэг мөр өөрчилсөн |

**Сүлжээ.** Хэд хэдэн plugin өөрсдийн хуучин AGP хувилбарыг шаарддаг —
`flutter_timezone` нь 7.3.0, `open_filex` нь 8.1.0. Тиймээс анхны билд маш их
файл татдаг:

```
Could not download gradle-7.3.0.jar (com.android.tools.build:gradle:7.3.0)
   > Read timed out
```

Timeout-ыг уртасгаж давтахад шийдэгдсэн. Дэлгэрэнгүйг `APK-RELEASE.md`-аас үзнэ үү.

**SDK 37.** Flutter нь 37-г өөрөө татдаг боловч `platforms/android-37.0/` нэрээр,
дотроо `AndroidVersion.ApiLevel=37.0` гэсэн буруу утгатай тавьдаг. AGP энэ талбарыг
бүхэл тоо гэж уншдаг тул `android-37`-г олохгүй. Энэ нь Android-ын шинэ
"minor SDK version" журам (upstream дээр `37.0`, `37.1`, `37.2` байгаа ч цэвэр
`android-37` байхгүй). Билдийн компьютерийн SDK дотор засварласан — **төсөлд
хамаарахгүй**.

**Танаас хийх зүйл алга** (§0-оос бусад). Зөвхөн мэдээлэл.

## 2. `android:label` нь латинаар бичигдсэн

`android/app/src/main/AndroidManifest.xml:27`

```xml
<application android:label="mncardio" ...>
```

Утасны дэлгэц дээр аппын нэр **`mncardio`** гэж жижиг латин үсгээр харагдана.
Систем даяар `МнКардио` гэж бичдэгтэй таарахгүй байна.

**Санал:** `android:label="МнКардио"`. iOS тал дээр
`ios/Runner/Info.plist`-ийн `CFBundleDisplayName` нь `Mncardio` — мөн адил.

Дэлгүүрт тавихаас өмнө засах нь зүйтэй.

## 3. Шинэчлэлтийн дэлгэц холбоосыг зөвхөн хуулж авдаг

`lib/features/update/update_required_screen.dart:68-72`

Одоогийн код нь `storeUrl`-ийг **clipboard руу хуулаад** зогсдог. Хэрэглэгч
гараар browser нээж, буулгаж, орох ёстой болно.

Өмнө нь `storeUrlAndroid` нь `null` байсан тул энэ нь асуудал биш байсан. Харин
**2026-09-16-наас эхлэн жинхэнэ холбоос орсон**:

```
GET /api/mobile/version?platform=android
  -> storeUrlAndroid = "https://mncardio.itsystem.mn/apk"
```

**Санал:** холбоосыг шууд нээх (`url_launcher`, эсвэл аль хэдийн байгаа
`share_plus`-аар). Одоо ард нь бодит татах хуудас байгаа тул нээх нь утга
учиртай боллоо.

> Серверийн тал дээр юу ч хийх шаардлагагүй — `update_controller.dart` аль
> хэдийн `storeUrlAndroid`-ийг уншиж байна. Зөвхөн дэлгэцийн үйлдэл л үлдсэн.

## 4. `tool/bootstrap.ps1` нь одоо `minSdk`-ийг **бууруулна**

`tool/bootstrap.ps1:190-197` нь `minSdk`-ийг `23` болгож бичихээр заасан байна —
шалтгаан нь `local_auth` 23+ шаарддаг гэсэн тайлбартай.

Гэвч `android/app/build.gradle.kts:23` нь `flutter.minSdkVersion` хэвээр бөгөөд
**Flutter 3.44 дээр энэ нь 24** байна. Өөрөөр хэлбэл одоогийн утга нь
`local_auth`-ын шаардлагаас аль хэдийн өндөр.

Хэрэв bootstrap-ыг одоо ажиллуулбал `24` → `23` болж **буурна**.

**Санал:** bootstrap.ps1-ийн тэр алхмыг устгах, эсвэл `24`-өөс доош болгохгүй
болгох. `build.gradle.kts`-ийг өөрчлөх шаардлагагүй — одоогийн байдал зөв.

## 5. Хуучирсан баримт бичиг

`mobile/app/SETUP.md:3-5` ба `tool/bootstrap.ps1:3-7` хоёулаа `android/` болон
`ios/` хавтас repo-д **байхгүй**, `flutter create`-ээр үүсгэх ёстой гэж бичсэн
байна.

Бодит байдалд хоёулаа repo-д бүрэн орсон, commit хийгдсэн байна (199 файл).
Шинэ хүн эдгээр зааврыг дагавал `flutter create` ажиллуулж, тохируулсан
файлуудыг дарж бичих эрсдэлтэй.

**Санал:** тэр хоёр хэсгийн эхний тайлбарыг шинэчлэх.

## 6. Гарын үсгийн түлхүүр — release билд debug түлхүүр ашиглаж байна

`android/app/build.gradle.kts:31-35`, Flutter-ийн анхны `TODO` хэвээр:

```kotlin
buildTypes {
    release {
        // TODO: Add your own signing config for the release build.
        signingConfig = signingConfigs.getByName("debug")
    }
}
```

Туршилтын хувилбарт энэ **зориудаар** ийм байгаа — `SETUP.md` §8-д заасанчлан
жинхэнэ түлхүүрийг **ЗСҮТ эзэмших** ёстой, эс бөгөөс хүлээлгэн өгсний дараа
аппыг шинэчлэх боломжгүй болно.

Гэхдээ нэг зүйлийг мэдэж байх хэрэгтэй:

> Debug түлхүүр нь **компьютер бүр дээр өөр** (`~/.android/debug.keystore`).
> Өөр компьютероос билд хийвэл гарын үсэг өөр болж, туршигчид бүгд хуучнаа
> **устгаж байж** шинийг суулгана.

Тиймээс түлхүүрийг нөөцөлж, release билдийг нэг компьютероос хийж байна.
Жинхэнэ түлхүүр, Google Play бүртгэл хоёр `BLOCKERS.md` §2-т бүртгэлтэй.

## 7. `pubspec.yaml`-ын хувилбар хөдөлдөггүй

`mobile/app/pubspec.yaml:4` — `version: 0.1.0+1`, анхны утгаасаа хөдлөөгүй.

`mobile/tools/bump-version.js` нь үүнийг **зориудаар хөнддөггүй** — тэр скрипт
backend болон frontend-ийн хувилбарыг web deploy-д зориулж нэмдэг.

Хэрэв хувилбарыг нэмэхгүй бол өөр өөр билд ижил дугаартай гарч,
`GET /api/mobile/version`-ийн шалгалт тэдгээрийг ялгаж чадахгүй.

**Санал:** APK гаргах бүрт `pubspec.yaml`-ын `version`-ийг нэмэх. Үүний дараа
серверийн `MobileSetting`-ийн `latestVersion` / `latestBuild`-ийг тааруулна
(`backend/scripts/set_mobile_apk_download_url.sql`).

---

## Серверийн тал дээр аль хэдийн хийгдсэн зүйлс

Танаас юу ч шаардахгүй, зөвхөн мэдээлэл:

| Юу | Хаана |
|---|---|
| `/apk` татах хуудас нэмэгдсэн | nginx, `mncardio.itsystem.mn` |
| `storeUrlAndroid` утга авсан | `MobileSetting` (MnCardio_test) |
| `latestVersion` `1.0.0` → `0.1.0` болж `pubspec.yaml`-тай таарсан | мөн тэнд |
| `minSupportedBuild`, `forceUpdate` — **хөндөөгүй** | хэнийг ч блоклохгүйн тулд |
