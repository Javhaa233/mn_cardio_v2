const { Models } = require('../config/DB');
const Model = Models.TenderFormData;

/**
 * The unified register of every tender form instance — upgrade tender rows
 * §101 (one menu for all of groups 1-4), §102 (search by patient, date, doctor
 * and form type) and §103 (export the list to .xlsx / .txt with source
 * marking).
 *
 * This deliberately maps the base TenderFormData table rather than a new SQL
 * view. The per-form views (vwForm_1_1, ...) each project one form's answers
 * into columns, which is what the per-form lists need; a cross-form list wants
 * the opposite - the columns every form shares - and those are already real
 * columns here. So the whole feature is one ModelConfig and no DDL.
 *
 * `Data` carries the answers as JSON. It is searchable, so the unified search
 * can look inside any form without the caller knowing which field code holds
 * what, but GridField is false so it never becomes a grid column or an export
 * column - a JSON blob per row would make both unreadable.
 */
function TenderFormDataConfig() {
  this.Fields = [
    [
      { Name: 'Id', Label: 'Id', Type: 'Text', GridField: false, EditField: false },

      {
        Name: 'FormCode',
        Label: 'Маягтын дугаар',
        Type: 'Text',
        Position: 1,
        md: 2,
        EditField: false,
      },
      {
        Name: 'TenderForm.NameMn',
        Label: 'Маягтын нэр',
        Type: 'Text',
        Position: 2,
        md: 5,
        EditField: false,
      },

      {
        Name: 'PatRegNo',
        Label: 'Регистрийн дугаар',
        Type: 'Text',
        Position: 3,
        md: 3,
        EditField: false,
      },
      {
        Name: 'Patient.p_lastname',
        Label: 'Овог',
        Type: 'Text',
        Position: 4,
        md: 3,
        EditField: false,
      },
      {
        Name: 'Patient.p_firstname',
        Label: 'Нэр',
        Type: 'Text',
        Position: 5,
        md: 3,
        EditField: false,
      },

      {
        Name: 'FormDate',
        Label: 'Огноо',
        Type: 'Date',
        Position: 6,
        md: 2,
        EditField: false,
      },
      {
        Name: 'DoctorsProfile.FullName',
        Label: 'Эмч',
        Type: 'Text',
        Position: 7,
        md: 3,
        EditField: false,
      },
      {
        Name: 'Status',
        Label: 'Төлөв',
        Type: 'Text',
        Position: 8,
        md: 2,
        EditField: false,
      },

      // Searchable, never shown: see the note above.
      {
        Name: 'Data',
        Label: 'Хариулт',
        Type: 'Text',
        GridField: false,
        EditField: false,
      },
      { Name: 'rec_status', Label: 'Бүртгэлийн төлөв', Type: 'Text', GridField: false },
      { Name: 'CreateDate', Label: 'Үүсгэсэн огноо', Type: 'Date', GridField: false },
    ],
  ];

  this.ObjectName = 'TenderFormData';
  this.Model = Model;
  this.OptionTypes = Models.OptionTypes;
  this.PK = 'Id';
  this.NewObject = {};
  this.TitleObject = {
    Title: 'Маягтын нэгдсэн бүртгэл',
    NewObjectTitle: 'Маягтын нэгдсэн бүртгэл',
    EditObjectTitle: 'Маягтын нэгдсэн бүртгэл',
  };
}

module.exports = TenderFormDataConfig;
