# flutter_secure_storage -> Google Tink: эдгээр нь зөвхөн compile-time annotation,
# ажиллах үед хэрэглэгддэггүй. R8 олдохгүй гэж release build-ийг зогсоодог тул
# анхааруулгыг л хаана. Flutter gradle plugin энэ файлыг автоматаар ашигладаг.
-dontwarn com.google.errorprone.annotations.CanIgnoreReturnValue
-dontwarn com.google.errorprone.annotations.CheckReturnValue
-dontwarn com.google.errorprone.annotations.Immutable
-dontwarn com.google.errorprone.annotations.RestrictedApi
-dontwarn javax.annotation.Nullable
-dontwarn javax.annotation.concurrent.GuardedBy
