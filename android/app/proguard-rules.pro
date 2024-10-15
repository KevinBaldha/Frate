# Keep all SLF4J Logger classes (Prevents ProGuard from removing them)
-keep class org.slf4j.** { *; }

# Optional: Prevent obfuscation of logging statements (if you want to keep logging behavior intact)
-dontwarn org.slf4j.**

# Keep classes and methods related to FastImage and react-native-video
-keep class com.dylanvann.fastimage.** { *; }
-keep class com.brentvatne.react.** { *; }
-keep class com.danikula.videocache.** { *; }

# Keep all classes related to your VideoShow components and video caching
-keep class com.danikula.videocache.** { *; }

# General rules for React Native libraries to avoid issues with ProGuard stripping code
-keep public class * extends ReactActivity
-keep class com.facebook.react.ReactPackage { *; }
-keepclassmembers class * extends ReactActivity {
   public void onActivityResult(int, int, android.content.Intent);
}
