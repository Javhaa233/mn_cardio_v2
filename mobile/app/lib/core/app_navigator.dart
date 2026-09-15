import 'package:flutter/material.dart';

/// Аппын үндсэн Navigator-ын түлхүүр.
///
/// Мэдэгдэл дээр дарах нь **виджетийн модноос гадна** болдог үйлдэл —
/// `BuildContext` байхгүй. Тиймээс `MaterialApp`-д энэ түлхүүрийг өгч,
/// мэдэгдлийн чиглүүлэгч түүгээр дамжин шилжүүлнэ.
final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();
