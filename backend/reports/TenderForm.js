const FormSheet = require('./FormSheet');

// -----------------------------------------------------------------------------
// A4 sheet for any tender phase-4 form.
//
// An adapter, not a printer: it turns the TenderFormField dictionary into the
// shape reports/FormSheet.js renders. Because the layout comes from the same
// dictionary that renders the editor, the printed sheet cannot drift from the
// form, and a form seeded tomorrow prints with no new code - the same bargain
// the generated SQL views make for list, search and Excel export.
//
// Nothing here is form-specific. Where a form needs a shape a flat label/value
// list cannot express - the 1.2 safety checklist, the 19-segment coronary grid,
// the 2.1 repeating tables - FormSheet infers it from the metadata.
// -----------------------------------------------------------------------------

/**
 * @param {object} Form     TenderForm row: FormCode, NameMn
 * @param {array}  Sections [{ Code, Label, Pos }] in display order
 * @param {array}  Fields   BuildFields output, already ordered
 * @param {object} Answers  flattened TenderFormData answers ({} when Blank)
 * @param {object} Patient  Patient row, or null
 * @param {object} Meta     { Blank, Status, Logo, ShowLetterhead, OrganizationName }
 */
function TenderForm(Form, Sections, Fields, Answers, Patient, Meta) {
  const Options = Meta || {};
  const Blank = !!Options.Blank;
  const Values = Blank ? {} : Answers || {};

  const Groups = Sections && Sections.length ? Sections : [{ Code: null, Label: null, Pos: 0 }];

  const Model = Groups.map((Section) => ({
    Label: Section.Label,
    Fields: (Fields || []).filter(
      (f) => (f.SectionCode || null) === (Section.Code || null) && f.SectionCode !== 'header'
    ),
  }));

  // A blank sheet keeps the patient's NAME and REGISTER but blanks everything
  // else. Printing an empty checklist from a patient's chart is the common case
  // - the ward fills it by hand at the bedside and enters it afterwards - so
  // pre-printing the identity saves transcription and avoids attaching the
  // sheet to the wrong patient. Anything instance-specific (the history number,
  // the date) stays empty because it is not known yet.
  const PatientName = Patient
    ? [Patient.p_lastname, Patient.p_firstname].filter(Boolean).join(' ')
    : '';

  return FormSheet({
    Title: Form.NameMn || Form.FormCode,
    Sections: Model,
    Values,
    Meta: [
      { Label: 'Эмчлүүлэгчийн овог нэр', Value: PatientName },
      {
        Label: 'Регистрийн дугаар',
        Value: Patient ? Patient.p_registration : Values.PatRegNo,
      },
      { Label: 'Өвчний түүхийн дугаар', Value: Blank ? '' : Values.UvchTuuhDugaar },
      { Label: 'Огноо', Value: Blank ? '' : Values.FormDate },
    ],
    Options: {
      Blank,
      Draft: !Blank && Options.Status === 0,
      // The paper masters carry no letterhead, and the acceptance criterion is
      // structural identity with them, so this stays off unless asked for.
      Logo: Options.Logo,
      ShowLetterhead: Options.ShowLetterhead,
      Signature: {
        Label: 'Тасгийн эрхлэгч',
        Value: Blank ? '' : Values.TasgiinErhlegch,
      },
    },
  });
}

module.exports = TenderForm;
