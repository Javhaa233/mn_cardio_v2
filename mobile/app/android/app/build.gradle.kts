plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "mn.telemedicine.mncardio"
    // 37, not flutter.compileSdkVersion (which is 36 on Flutter 3.44).
    // permission_handler_android 14.1.0 sets compileSdk = 37 and publishes AAR
    // metadata requiring everything that depends on it to do the same, so :app
    // fails checkReleaseAarMetadata against 36. Flutter's own error message
    // asks for exactly this line.
    //
    // Safe: compileSdk only decides which APIs the code may reference. It does
    // not change minSdk (which devices can install the app) or targetSdk (which
    // runtime behaviour it opts into) - both still come from Flutter below.
    //
    // AGP 9.0.1 calls 36 its highest *recommended* compileSdk, so a warning
    // here is expected rather than a fault. Revert to flutter.compileSdkVersion
    // once Flutter's own default reaches 37.
    compileSdk = 37
    ndkVersion = flutter.ndkVersion

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "mn.telemedicine.mncardio"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.2")
}
