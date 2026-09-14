/**
 * Who may see which асуумж, in one place.
 *
 * These three functions lived inside AdviceController, which exports only its
 * router - so nothing else could reuse them. /BaseObject/downloadFile needs the
 * same answer: whether a session may read a ticket decides whether it may read
 * that ticket's attachment. Sharing the rule is the only way the feed and the
 * download endpoint cannot drift apart.
 */
const { Models, Op } = require('../config/DB');
const PatientScope = require('./PatientScope');

/**
 * The visibility rule for a ticket, as one Sequelize `where`.
 *
 * This is the security boundary for the whole feed, so it is a pure function:
 * it takes the user and their organization and returns a fragment, with no IO
 * and no request object. GetFeed and GetStats both call it, which is what makes
 * the analytics rail's numbers reconcile with the feed rather than drift.
 *
 * It reproduces the union of the two existing endpoints - GetListCity OR
 * GetListSoum - because the feed is the one list that shows both:
 *
 *   admin                 -> level IN ('1','2','3')
 *   level 1, not city     -> level='1' AND addr_prov_city = org's
 *   level 1, city         -> level='1' AND addr_soum_dist = org's
 *   level 2, not city     -> level IN ('2','3') OR (level='1' AND prov match)
 *   level 2, city         -> level IN ('2','3') OR (level='1' AND soum match)
 *   level 3               -> level IN ('2','3')
 *   anything else         -> DENY
 *
 * That last line is a deliberate behaviour change. GetListCity adds no
 * predicate at all when the level is not 1, 2 or 3, so a null or malformed
 * organization level silently showed that user every ticket in the country.
 * Denying is the safe direction, and it was verified against live data first:
 * all 680 organizations carry a clean level, so no doctor loses access.
 */
function BuildAdviceScope({ LogedUser, Organization }) {
  const Base = { AppId: LogedUser.AppId, rec_status: { [Op.ne]: '2' } };

  if (String(LogedUser.RoleId) === '1') {
    return { ...Base, level: { [Op.in]: ['1', '2', '3'] } };
  }

  const Level = Organization ? Organization.level : null;
  const IsCity =
    Organization && Organization.DictProvinceCity
      ? Organization.DictProvinceCity.is_city === 'y'
      : false;

  if (!Organization) return { ...Base, id_data: -1 };

  const Geo = IsCity
    ? { addr_soum_dist: Organization.addr_soum_dist }
    : { addr_prov_city: Organization.addr_prov_city };

  if (Level === '1') return { ...Base, level: '1', ...Geo };
  if (Level === '3') return { ...Base, level: { [Op.in]: ['2', '3'] } };
  if (Level === '2') {
    return {
      ...Base,
      [Op.or]: [{ level: { [Op.in]: ['2', '3'] } }, { level: '1', ...Geo }],
    };
  }

  return { ...Base, id_data: -1 };
}

/** The logged-in doctor's organization, with is_city resolved. */
async function GetLogedOrganization(LogedUser) {
  const Doctor = await Models.DoctorsProfile.findOne({
    where: { id: LogedUser.Id },
    raw: true,
  });
  if (!Doctor) return { Doctor: null, Organization: null };

  let Organizations = await Models.Organization.findAllNew({
    where: { Id: Doctor.OrganizationId },
  });
  Organizations = JSON.parse(JSON.stringify(Organizations));
  return {
    Doctor,
    Organization: Organizations.length === 1 ? Organizations[0] : null,
  };
}

/**
 * May this session read the files attached to a ticket, or to one of its replies?
 *
 * Deliberately the rule that GOVERNS READING THE TICKET, not the rule that
 * governs attaching to it. The download gate first shipped with the attach rule
 * - author or admin - which would have refused every colleague who opens a
 * ticket in the feed to look at the X-ray on it. The feed is a consult board:
 * reading each other's tickets is the entire point.
 *
 * So this mirrors GetTicket, and that mirroring is the point: an attachment
 * must never be refused on a ticket whose page the same session can open, and
 * must never be served on one it cannot.
 *
 * Tightened 2026-09-14, in the same commit as GetTicket, as the older comment
 * here asked. Both now apply BuildAdviceScope. Previously both authorized on
 * AppId alone, so any authenticated session could pull an attachment off any
 * ticket by guessing an id.
 *
 * Patients are the exception and are checked positively: only the ticket that is
 * about them, by the same `adv_id_patient` column PatientScope uses elsewhere.
 */
async function MayReadAdviceAttachment({ LinkedObjectName, LinkedObjectId, LogedUser }) {
  if (!LogedUser || !LinkedObjectId) return false;

  let AdviceId = LinkedObjectId;
  if (LinkedObjectName === 'AdviceComment') {
    const Comment = await Models.AdviceComment.findOne({
      where: { id_data: LinkedObjectId },
      attributes: ['id_data', 'adv_com_id_adv'],
      raw: true,
    });
    if (!Comment || !Comment.adv_com_id_adv) return false;
    AdviceId = Comment.adv_com_id_adv;
  }

  const Advice = await Models.Advice.findOne({
    where: { id_data: AdviceId },
    attributes: ['id_data', 'id', 'AppId', 'rec_status', 'adv_id_patient'],
    raw: true,
  });
  if (!Advice) return false;
  if (String(Advice.rec_status) === '2') return false;
  if (String(Advice.AppId) !== String(LogedUser.AppId)) return false;

  if (PatientScope.IsPatient(LogedUser)) {
    const Owner = LogedUser.PatientId;
    if (Owner === undefined || Owner === null || Owner === '') return false;
    return String(Advice.adv_id_patient) === String(Owner);
  }

  // Staff: the ticket must be inside the same scope that decides whether they
  // could open its page at all. Re-queried rather than evaluated in JS so that
  // there is exactly one implementation of the rule - this scope object is
  // built for a WHERE clause, and reimplementing its Op.or branch by hand is
  // how the two copies would drift.
  //
  // id_data first, scope second: BuildAdviceScope denies with { id_data: -1 },
  // and spreading it last is what lets that deny survive the merge.
  const { Organization } = await GetLogedOrganization(LogedUser);
  const Scope = BuildAdviceScope({ LogedUser, Organization });
  const Visible = await Models.Advice.findOne({
    where: { id_data: AdviceId, ...Scope },
    attributes: ['id_data'],
    raw: true,
  });

  return !!Visible;
}

module.exports = { BuildAdviceScope, GetLogedOrganization, MayReadAdviceAttachment };
