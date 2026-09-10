import '../../core/network/api_client.dart';
import 'patient_profile.dart';

/// 2.1 Миний бүртгэл.
///
/// Эдгээр endpoint **үйлчлүүлэгчийн танигч хүлээж авдаггүй** — хэн болохыг
/// токеноос уншина. Өөр хүний дугаарыг тавих газар байхгүй нь энэ гадаргууны
/// гол зорилго (API.md §3).
class ProfileRepository {
  ProfileRepository(this._api);

  final ApiClient _api;

  Future<PatientProfile> fetchMe() async {
    final data = await _api.getObject('/api/patient/me');
    return PatientProfile.fromJson(data);
  }
}
