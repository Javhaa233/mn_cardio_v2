import Flutter
import UIKit
import UserNotifications

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    // Мэдэгдэл дээр дарсныг аппад дамжуулах цорын ганц зам.
    //
    // Энэ мөргүйгээр iOS мэдэгдлийг ХАРУУЛНА ч дарахад апп юу ч мэдэхгүй:
    // `onDidReceiveNotificationResponse` хэзээ ч дуудагдахгүй тул чатын
    // мэдэгдэл дарахад яриа нээгдэхгүй байв. flutter_local_notifications-ийн
    // iOS суулгацын заавал хийх алхам (README §iOS setup).
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self as UNUserNotificationCenterDelegate
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
  }
}
