const { Models } = require('../config/DB');
const Model = Models.MobileSetting;

/**
 * Mobile app settings - the admin web's view of the MobileSetting table.
 *
 * WHY THIS CONFIG EXISTS. The forced-update gate (minSupportedBuild), the terms
 * of service text and the support phone number all have to be changeable
 * without a developer: the tender asks for content the customer maintains, and
 * the terms text in particular is a ЗСҮТ legal deliverable that will arrive and
 * then be revised. Registering the config gives /api/BaseObject list, detail,
 * update and Excel export with no controller at all (CLAUDE.md §4).
 *
 * CREATE AND DELETE ARE NOT OFFERED, and that is deliberate. The keys are a
 * closed set that the endpoints read by name - adding 'minSupportedbuild' with
 * a lowercase b would produce a row that looks right in the grid and is never
 * read. Editing a value is the whole job; the seed script owns the key list.
 * That is expressed as EditField:false on Key rather than by a permission,
 * because the generic engine has no per-verb hook.
 *
 * Patients cannot reach this through /BaseObject: PatientScope has no
 * SCOPE_BY_OBJECT entry for MobileSetting and ApplyPatientFilter fails closed.
 * The values patients legitimately need are served, unauthenticated where
 * appropriate, by /api/mobile/config and /api/mobile/version.
 */
function MobileSettingConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', md: 2, Position: 1, EditField: false },
      // Read-only: the key list is owned by scripts/add_mobile_settings.sql,
      // and a mistyped key is a setting that silently never takes effect.
      {
        Name: 'Key',
        Label: 'Тохиргоо',
        Type: 'Text',
        md: 4,
        Position: 1,
        EditField: false,
      },
      {
        Name: 'Value',
        Label: 'Утга',
        Type: 'TextArea',
        md: 12,
        Position: 2,
      },
      {
        Name: 'Description',
        Label: 'Тайлбар',
        Type: 'Text',
        md: 12,
        Position: 3,
        EditField: false,
      },
      {
        Name: 'UpdateDate',
        Label: 'Өөрчилсөн',
        Type: 'DateTime',
        md: 4,
        Position: 4,
        EditField: false,
      },
    ],
  ];

  this.ObjectName = 'MobileSetting';
  this.Model = Model;
  this.PK = 'Id';
  this.OptionTypes = Models.OptionTypes;
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Мобайл апп тохиргоо',
    NewObjectTitle: 'Шинэ тохиргоо',
    EditObjectTitle: 'Тохиргоо засах',
  };
}

module.exports = MobileSettingConfig;
