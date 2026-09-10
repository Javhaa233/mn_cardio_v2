const { Models, Op } = require('../config/DB');
const BaseControllerHelper = require('./BaseControllerHelper');
const PrintHelper = require('./PrintHelper');
const ConfigSheet = require('../reports/ConfigSheet');

// -----------------------------------------------------------------------------
// Printing for the ModelConfig-backed registries.
//
// One entry point serves all of them. Before this, eight of the report modules
// under reports/ were CSS with an empty <body> - AtrialRhythmNew (tender form
// 2.2) and CongenitalMalformations (1.5) among them - so those Print buttons
// downloaded a blank page.
//
// Each controller now calls PrintObject with its ObjectName and gets the sheet,
// the page numbering and the source marking that reports/FormSheet.js and
// helper/PrintHelper.js already provide.
// -----------------------------------------------------------------------------

// Field.Type values that are real control types. Anything else in that slot is
// a `dico` code resolved against OptionTypes - a long-standing convention in
// these configs, documented in CLAUDE.md §3.
const CONTROL_TYPES = new Set([
  'Text',
  'TextArea',
  'Number',
  'Date',
  'DateTime',
  'Password',
  'File',
  'SingleImage',
  'ListView',
  'Table',
  'CheckBox',
  'RadioBox',
  'SingleSelect',
  'SingelSelect',
  'SingleSelectLoad',
  'MultipleSelect',
  'GridLookUpSingle',
  'GridLookUpSingleLoad',
]);

const EachField = (Config, fn) => {
  (Config.Fields || []).forEach((Group) => (Group || []).forEach((Field) => fn(Field)));
};

/**
 * Fill in option lists for fields whose `Type` is really a dico code.
 *
 * GetConfigData only hydrates `Field.Data` when `Field.OptionType` is set, but
 * plenty of these configs put the dico in `Type` instead. Without this, a
 * yes/no field prints the raw stored code ("y") rather than "Тийм", and the
 * checklist inference in FormSheet has no option list to work from.
 *
 * One batched query, not one per field.
 */
async function HydrateDicoTypes(Config) {
  const Codes = new Set();
  EachField(Config, (Field) => {
    if (!Field || !Field.Type) return;
    if (Field.Data && Field.Data.length) return;
    if (CONTROL_TYPES.has(Field.Type)) return;
    Codes.add(Field.Type);
  });
  if (!Codes.size) return;

  const Rows = await Models.OptionTypes.findAll({
    where: { dico: { [Op.in]: [...Codes] } },
    order: [['pos', 'ASC']],
    raw: true,
  });

  const ByDico = {};
  Rows.forEach((r) => {
    if (!ByDico[r.dico]) ByDico[r.dico] = [];
    ByDico[r.dico].push({ Label: r.label, Value: r.value });
  });

  EachField(Config, (Field) => {
    if (!Field || !Field.Type) return;
    if (Field.Data && Field.Data.length) return;
    if (!ByDico[Field.Type]) return;
    Field.Data = ByDico[Field.Type];
    // FormSheet keys its checklist inference off RadioBox; these dico fields are
    // radios in the UI, they just say so in the wrong slot.
    Field.PrintType = Field.Type;
    Field.Type = 'RadioBox';
  });
}

/**
 * Display text for the lookups the record already carries.
 *
 * ModelHelper.GetInfoData attaches `<Name>Obj` for SingleSelect, RadioBox and
 * the GridLookUp types. That resolution is authoritative - better than anything
 * re-derivable here - so it wins over the option list in FormSheet.
 */
function CollectLabels(Config, Data) {
  const Labels = {};
  if (!Data) return Labels;

  EachField(Config, (Field) => {
    if (!Field || !Field.Name) return;
    const Obj = Data[Field.Name + 'Obj'];
    if (!Obj || typeof Obj !== 'object') return;

    const TextField = Field.Config && Field.Config.TextField;
    const Value = (TextField && Obj[TextField]) ?? Obj.Label ?? Obj.Name ?? Obj.label ?? Obj.Text;
    if (Value !== null && Value !== undefined && Value !== '') Labels[Field.Name] = Value;
  });

  return Labels;
}

/** The record, its config, and the patient behind it. */
async function BuildSheet({ ObjectName, Id, LogedUser, Blank, Title }) {
  const Config = await BaseControllerHelper.GetConfigData(ObjectName);
  if (!Config) return null;

  await HydrateDicoTypes(Config);

  let Data = {};
  if (!Blank && Id) {
    const Option = {
      SearchText: '',
      limit: 1,
      offset: 0,
      SearchField: [{ Field: Config.PK || 'Id', Value: Id, Op: 'Equals' }],
      FindType: 'AllData',
      WhereType: '',
    };
    const Detail = await BaseControllerHelper.BaseDetailInfo({ ObjectName, LogedUser, Option });
    Data = (Detail && Detail.Data) || {};
    if (Array.isArray(Data)) Data = Data[0] || {};
  }

  const Patient =
    Data && Data.Patient
      ? Data.Patient
      : Data && Data.PatRegNo
        ? await Models.Patient.findOne({
            where: { p_registration: Data.PatRegNo },
            attributes: ['id_data', 'p_lastname', 'p_firstname', 'p_registration'],
            raw: true,
          })
        : null;

  const Labels = CollectLabels(Config, Data);

  const Html = ConfigSheet(Config, Data, Labels, Patient, {
    Title,
    Blank: !!Blank,
    // These registries lock a record with is_confirm rather than a status code.
    Draft: !Blank && Data && Data.is_confirm !== 'yes' && Data.is_confirm !== 'y',
    ShowLetterhead: false,
  });

  return { Html, Config, Data, Patient };
}

/** Organization name for the source marking in the page footer. */
async function GetOrganizationName(OrganizationId) {
  if (!OrganizationId) return null;
  try {
    const Org = await Models.Organization.findByPk(OrganizationId, {
      attributes: ['Id', 'Name'],
      raw: true,
    });
    return Org ? Org.Name : null;
  } catch (ex) {
    console.error('[ConfigSheetHelper] failed to read organization:', ex);
    return null;
  }
}

/**
 * Build the sheet and send it as an A4 PDF.
 *
 * Goes through PrintHelper, so it shares one Chrome with every other report
 * rather than launching its own per request, and gets a unique filename instead
 * of the fixed one these controllers used to race each other over.
 */
async function PrintObject({ res, ObjectName, Id, LogedUser, Blank, Title, NamePrefix }) {
  const Sheet = await BuildSheet({ ObjectName, Id, LogedUser, Blank, Title });
  if (!Sheet) return null;

  const OrganizationId =
    (Sheet.Data && Sheet.Data.organization_id) ||
    (LogedUser && LogedUser.Doctor && LogedUser.Doctor.OrganizationId) ||
    (LogedUser && LogedUser.OrganizationId);

  await PrintHelper.SendPdf({
    res,
    html: Sheet.Html,
    namePrefix: NamePrefix || ObjectName,
    downloadName: `${ObjectName}.pdf`,
    footer: PrintHelper.BuildFooter({
      OrganizationName: await GetOrganizationName(OrganizationId),
      PrintedBy: LogedUser ? LogedUser.UserName || LogedUser.Name : null,
      GeneratedAt: new Date().toLocaleString('mn-MN'),
    }),
  });

  return Sheet;
}

module.exports = { BuildSheet, PrintObject, CollectLabels, HydrateDicoTypes };
