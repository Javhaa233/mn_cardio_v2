<#
  МнКардио мобайл апп — платформын хавтас үүсгэх, тохируулах скрипт.

  Энэ агуулахад `lib/`, `pubspec.yaml` бүрэн бичигдсэн боловч `android/` ба
  `ios/` хавтас БАЙХГҮЙ: тэдгээрийг Flutter SDK өөрөө үүсгэх ёстой (Gradle
  wrapper-ийн jar, Xcode төслийн файл зэрэг хоёртын файлуудыг гараар бичих
  боломжгүй).

  Ажиллуулах:
      cd mobile/app
      powershell -ExecutionPolicy Bypass -File tool/bootstrap.ps1

  Скрипт нь ДАВТАН ажиллуулахад аюулгүй: аль хэдийн хийгдсэн өөрчлөлтийг
  дахин хийхгүй.
#>

param(
    [switch]$SkipCreate
)

$ErrorActionPreference = 'Stop'

function Write-Step($message) {
    Write-Host ''
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Write-Ok($message) {
    Write-Host "    OK: $message" -ForegroundColor Green
}

function Write-Skip($message) {
    Write-Host "    Аль хэдийн хийгдсэн: $message" -ForegroundColor DarkGray
}

# --- 0. Flutter байгаа эсэх --------------------------------------------------

Write-Step 'Flutter SDK шалгаж байна'
$flutter = Get-Command flutter -ErrorAction SilentlyContinue
if (-not $flutter) {
    Write-Host @'
Flutter SDK олдсонгүй.

    1. https://docs.flutter.dev/get-started/install/windows -ээс татаж задлана
    2. <flutter>\bin -ийг PATH-д нэмнэ
    3. Шинэ терминал нээгээд `flutter doctor` ажиллуулна

Android билд хийхэд Android Studio (эсвэл Android SDK + JDK 17) бас хэрэгтэй.
'@ -ForegroundColor Red
    exit 1
}
Write-Ok $flutter.Source

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Write-Ok "Ажлын хавтас: $root"

# --- 1. Платформын хавтас үүсгэх --------------------------------------------

if (-not $SkipCreate) {
    Write-Step 'android/ ба ios/ хавтас үүсгэж байна'
    # `flutter create .` нь байгаа файлыг дарж бичихгүй — lib/ ба pubspec.yaml
    # хэвээр үлдэнэ, зөвхөн дутуу платформын хэсгийг нөхнө.
    & flutter create --platforms=android,ios --org mn.telemedicine --project-name mncardio .
    if ($LASTEXITCODE -ne 0) { throw 'flutter create амжилтгүй боллоо' }
    Write-Ok 'Платформын хавтас бэлэн'
}

# --- 2. Android: эрхийн тохиргоо --------------------------------------------

Write-Step 'AndroidManifest.xml тохируулж байна'

$manifestPath = 'android/app/src/main/AndroidManifest.xml'
if (-not (Test-Path $manifestPath)) { throw "$manifestPath олдсонгүй" }

$manifest = Get-Content $manifestPath -Raw -Encoding UTF8

# Тайлбар бүрийг эрх бүрийн хажууд бичсэн нь санаатай: дэлгүүрийн хяналтад
# "яагаад энэ эрх хэрэгтэй вэ" гэдэгт хариулах шаардлагатай.
$permissions = @'
    <!-- Backend-тэй харилцах -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Хурууны хээ / царайгаар нэвтрэх (Техникийн шаардлага §35) -->
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />

    <!-- Эм уух, дасгал хийх сануулга (Техникийн шаардлага §37).
         SCHEDULE_EXACT_ALARM: Android 12+ дээр яг цагт нь сэрээхэд шаардлагатай.
         RECEIVE_BOOT_COMPLETED: утас унтарч асахад сануулгыг дахин төлөвлөнө. -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Чатын хавсралт: зураг авах, дуу бичих -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
'@

if ($manifest -match 'android\.permission\.USE_BIOMETRIC') {
    Write-Skip 'эрхүүд'
} else {
    $manifest = $manifest -replace '(?s)(<manifest[^>]*>)', "`$1`r`n$permissions"
    Write-Ok 'эрхүүд нэмэгдлээ'
}

# flutter_local_notifications: сануулгыг цагт нь хүргэх, дахин ачаалсны дараа
# сэргээх хүлээн авагчид.
$receivers = @'
        <!-- Сануулгыг цагт нь хүргэх (flutter_local_notifications) -->
        <receiver
            android:exported="false"
            android:name="com.dexterous.flutterlocalnotifications.ScheduledNotificationReceiver" />
        <receiver
            android:exported="false"
            android:name="com.dexterous.flutterlocalnotifications.ScheduledNotificationBootReceiver">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
                <action android:name="android.intent.action.QUICKBOOT_POWERON" />
                <action android:name="com.htc.intent.action.QUICKBOOT_POWERON" />
            </intent-filter>
        </receiver>
'@

if ($manifest -match 'ScheduledNotificationBootReceiver') {
    Write-Skip 'мэдэгдлийн хүлээн авагчид'
} else {
    $manifest = $manifest -replace '(?s)(\s*</application>)', "`r`n$receivers`$1"
    Write-Ok 'мэдэгдлийн хүлээн авагчид нэмэгдлээ'
}

Set-Content -Path $manifestPath -Value $manifest -Encoding UTF8 -NoNewline

# --- 3. Android: туршилтын орчны HTTP -----------------------------------------

Write-Step 'Debug манифест (HTTP зөвшөөрөл) тохируулж байна'

$debugManifestPath = 'android/app/src/debug/AndroidManifest.xml'
$debugManifest = @'
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />

    <!--
        Зөвхөн ХӨГЖҮҮЛЭЛТИЙН билд дээр шифрлэгдээгүй HTTP-г зөвшөөрнө:
        локал backend нь http://10.0.2.2:5001 хаягаар ажилладаг.

        Үйлдвэрлэлийн билдэд энэ файл ОРОХГҮЙ — эмнэлгийн мэдээлэл зөвхөн
        HTTPS-ээр дамжина.
    -->
    <application android:usesCleartextTraffic="true" />
</manifest>
'@

if (Test-Path $debugManifestPath) {
    $existing = Get-Content $debugManifestPath -Raw -Encoding UTF8
    if ($existing -match 'usesCleartextTraffic') {
        Write-Skip 'debug манифест'
    } else {
        Set-Content -Path $debugManifestPath -Value $debugManifest -Encoding UTF8 -NoNewline
        Write-Ok 'debug манифест шинэчлэгдлээ'
    }
} else {
    New-Item -ItemType Directory -Force -Path (Split-Path $debugManifestPath) | Out-Null
    Set-Content -Path $debugManifestPath -Value $debugManifest -Encoding UTF8 -NoNewline
    Write-Ok 'debug манифест үүслээ'
}

# --- 4. Android: minSdk ба desugaring ----------------------------------------

Write-Step 'Gradle тохиргоо шалгаж байна'

$gradleKts = 'android/app/build.gradle.kts'
$gradleGroovy = 'android/app/build.gradle'
$gradlePath = if (Test-Path $gradleKts) { $gradleKts } elseif (Test-Path $gradleGroovy) { $gradleGroovy } else { $null }

if (-not $gradlePath) {
    Write-Host '    build.gradle олдсонгүй — SETUP.md -ийн 4-р алхмыг гараар хийнэ үү.' -ForegroundColor Yellow
} else {
    $gradle = Get-Content $gradlePath -Raw -Encoding UTF8
    $changed = $false

    # local_auth 23+ шаарддаг, flutter_local_notifications desugaring шаарддаг.
    if ($gradle -match 'minSdk\s*=?\s*23') {
        Write-Skip 'minSdk'
    } else {
        $gradle = $gradle -replace 'minSdk\s*=\s*flutter\.minSdkVersion', 'minSdk = 23'
        $gradle = $gradle -replace 'minSdkVersion\s+flutter\.minSdkVersion', 'minSdkVersion 23'
        $changed = $true
        Write-Ok 'minSdk = 23'
    }

    if ($gradle -match 'isCoreLibraryDesugaringEnabled|coreLibraryDesugaringEnabled') {
        Write-Skip 'core library desugaring'
    } else {
        Write-Host @'
    ГАРААР ХИЙХ ШААРДЛАГАТАЙ: flutter_local_notifications нь core library
    desugaring шаарддаг. SETUP.md -ийн 4-р алхмыг үзнэ үү.
'@ -ForegroundColor Yellow
    }

    if ($changed) {
        Set-Content -Path $gradlePath -Value $gradle -Encoding UTF8 -NoNewline
    }
}

# --- 5. iOS: Info.plist тайлбарууд -------------------------------------------

Write-Step 'iOS Info.plist тохируулж байна'

$plistPath = 'ios/Runner/Info.plist'
if (-not (Test-Path $plistPath)) {
    Write-Host '    ios/Runner/Info.plist олдсонгүй (macOS дээр үүсгэнэ). Алгаслаа.' -ForegroundColor Yellow
} else {
    $plist = Get-Content $plistPath -Raw -Encoding UTF8

    # Хэрэглэгчид харагдах текст тул монголоор. App Store хяналт эдгээрийг
    # уншдаг бөгөөд ойлгомжгүй бол апп татгалздаг.
    $usage = @'
	<key>NSFaceIDUsageDescription</key>
	<string>МнКардио аппад нууц үг оруулахгүйгээр аюулгүй нэвтрэхэд Face ID ашиглана.</string>
	<key>NSCameraUsageDescription</key>
	<string>Эмчдээ зураг илгээхийн тулд камер ашиглана.</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>Эмчдээ зураг хавсаргахын тулд зургийн санд хандана.</string>
	<key>NSMicrophoneUsageDescription</key>
	<string>Эмчдээ дуут мессеж илгээхийн тулд микрофон ашиглана.</string>
'@

    if ($plist -match 'NSFaceIDUsageDescription') {
        Write-Skip 'Info.plist тайлбарууд'
    } else {
        $plist = $plist -replace '(?s)(<dict>)', "`$1`r`n$usage", 1
        Set-Content -Path $plistPath -Value $plist -Encoding UTF8 -NoNewline
        Write-Ok 'Info.plist тайлбарууд нэмэгдлээ'
    }
}

# --- 6. Багцууд --------------------------------------------------------------

Write-Step 'Багцуудыг татаж байна (flutter pub get)'
& flutter pub get
if ($LASTEXITCODE -ne 0) { throw 'flutter pub get амжилтгүй боллоо' }
Write-Ok 'Багцууд бэлэн'

# --- Дуусгавар ---------------------------------------------------------------

Write-Host ''
Write-Host 'Бэлэн боллоо.' -ForegroundColor Green
Write-Host @'

Дараагийн алхам:

  1. SETUP.md -ийн 4-р алхам (core library desugaring)-ыг гараар хийнэ.
  2. Backend-ээ асаана:   cd ../../backend && npm run dev
  3. Аппаа ажиллуулна:

     # Android эмулятор (хостыг 10.0.2.2 гэж хардаг)
     flutter run --dart-define=MNCARDIO_API_BASE_URL=http://10.0.2.2:5001

     # Бодит утас — компьютерийн LAN IP хаягийг бичнэ
     flutter run --dart-define=MNCARDIO_API_BASE_URL=http://192.168.X.X:5001

  localhost АЖИЛЛАХГҮЙ: утас болон эмулятор өөрсдийн localhost-ыг хардаг.

'@ -ForegroundColor Gray
