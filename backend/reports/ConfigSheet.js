const FormSheet = require('./FormSheet');

// -----------------------------------------------------------------------------
// A4 sheet for any ModelConfig-backed object.
//
// The older registries (AtrialRhythmNew, ICDRhythm, CongenitalMalformations,
// SurgeryPlans ...) had report modules that were CSS with an empty <body>:
// their Print buttons produced a blank page. They do not need eight hand-written
// printers with hardcoded labels - they already describe themselves, in
// ModelConfigs/<X>Config.js, the same declaration that drives their forms.
//
// So this is an adapter, exactly like reports/TenderForm.js: it turns a
// ModelConfig into the shape reports/FormSheet.js renders. Labels, option lists
// and field order come from the config, which means a label fixed in the config
// is fixed on the printout too.
//
// Sections come from the config's own structure: ModelConfig.Fields is an array
// OF GROUPS, and those groups are how the form is already organised. They carry
// no titles - the titles live in each form's JSX - so the printed sheet groups
// without naming, rather than inventing headings the clinical team never
// approved.
// -----------------------------------------------------------------------------

// Bookkeeping and plumbing. Present in almost every config, meaningless on paper.
const SKIP_NAMES = new Set([
  'Id',
  'id_data',
  'id_group',
  'AppId',
  'is_confirm',
  'rec_status',
  'PatientId',
  'CreateUserId',
  'CreatedDate',
  'UpdateUserId',
  'UpdatedDate',
  'ConfirmUserId',
  'ConfirmedDate',
  'date_creation',
  'date_modif',
  'user_mod',
]);

// Nothing sensible to print for these.
const SKIP_TYPES = new Set(['File', 'SingleImage', 'ListView', 'Password']);

/** Carries clinical content, whether or not it can be labelled. */
const Clinical = (Field) =>
  !!Field && !!Field.Name && !SKIP_NAMES.has(Field.Name) && !SKIP_TYPES.has(Field.Type);

/**
 * Printable means clinical AND labelled.
 *
 * A field with no `Label`, or one labelled with its own column name, cannot be
 * printed: there is nothing to write in the left-hand cell. On several of these
 * registries the label was never put in the config at all - it is hardcoded in
 * the form's JSX instead, against the rule in CLAUDE.md §3 - so the config
 * genuinely does not know what the field is called. Those fields are counted
 * and reported on the sheet rather than dropped in silence.
 */
const Printable = (Field) => Clinical(Field) && !!Field.Label && Field.Label !== Field.Name;

/**
 * @param {object} Config  GetConfigData output: Fields (array of groups), TitleObject
 * @param {object} Data    the record, with <Name>Obj lookups already resolved
 * @param {object} Labels  Name -> resolved display text
 * @param {object} Patient Patient row, or null
 * @param {object} Meta    { Title, Blank, Draft, Logo, ShowLetterhead }
 */
function ConfigSheet(Config, Data, Labels, Patient, Meta) {
  const Options = Meta || {};
  const Blank = !!Options.Blank;
  const Values = Blank ? {} : Data || {};

  const Groups = (Config.Fields || [])
    .map((Group) => ({ Label: null, Fields: (Group || []).filter(Printable) }))
    .filter((Group) => Group.Fields.length > 0);

  const AllFields = (Config.Fields || []).flat();
  const Unlabelled = AllFields.filter((f) => Clinical(f) && !Printable(f)).length;

  const PatientName = Patient
    ? [Patient.p_lastname, Patient.p_firstname].filter(Boolean).join(' ')
    : '';

  const Title =
    Options.Title ||
    (Config.TitleObject && (Config.TitleObject.Title || Config.TitleObject.EditObjectTitle)) ||
    Config.ObjectName ||
    '';

  return FormSheet({
    Title,
    Sections: Groups,
    Values,
    Labels: Blank ? {} : Labels || {},
    Meta: [
      { Label: 'Эмчлүүлэгчийн овог нэр', Value: PatientName },
      {
        Label: 'Регистрийн дугаар',
        Value: Patient ? Patient.p_registration : Values.PatRegNo,
      },
      { Label: 'Огноо', Value: Blank ? '' : Options.RecordDate },
    ],
    Options: {
      Blank,
      Draft: Options.Draft,
      Notice: Unlabelled
        ? `АНХААР: энэ хуудас бүрэн бус. Маягтын тодорхойлолтод нэр (Label) ` +
          `алга байгаа тул ${Unlabelled} талбар хэвлэгдээгүй байна. ` +
          `Эмнэлгийн бүрэн бүртгэл болгон ашиглаж болохгүй.`
        : null,
      Logo: Options.Logo,
      ShowLetterhead: Options.ShowLetterhead,
      Signature: { Label: 'Эмчийн гарын үсэг', Value: '' },
    },
  });
}

module.exports = ConfigSheet;
module.exports.Printable = Printable;
