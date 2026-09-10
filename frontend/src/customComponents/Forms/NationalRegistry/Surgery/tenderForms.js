/**
 * The tender's phase-4 forms, in one place.
 *
 * The list was previously written out twice - once as a default inside the
 * patient-page menu component and once inline in PatientActions for groups 2
 * and 3 - which is exactly the drift the upgrade tender's "one menu for all
 * forms" item (§101) exists to remove. The unified register screen reads the
 * same list, so a form added here appears everywhere it should.
 *
 * `no` is the tender's own numbering and the key of the TenderForm row.
 * A form marked `disabled` is registered but not fillable: 1.4 and 1.10 are
 * "scoped at contract signing" and have no approved content.
 */
export const TENDER_FORM_GROUPS = [
  {
    code: "surgery",
    label: "Зүрх судасны мэс заслын маягтууд",
    forms: [
      { no: "1.1", label: "Мэс заслын өмнөх шалгуур хуудас" },
      { no: "1.2", label: "Мэс заслын үеийн шалгуур хуудас" },
      {
        no: "1.3",
        label:
          "Хэвлийн гол судасны цүлхэн болон гол судас-ташааны артерийн төлөвлөгөөт мэс заслын өмнөх өвчтнийг бэлдэх шалгах хуудас",
      },
      {
        no: "1.4",
        label: "Эмнэлгээс гарах үеийн шалгуур хуудас",
        note: "гэрээ байгуулах үед тусгана",
        disabled: true,
      },
      { no: "1.5", label: "Зүрхний төрөлхийн гажгийн маягт" },
      { no: "1.6", label: "Титэм судасны мэс заслын маягт" },
      { no: "1.7", label: "Гол судасны мэс заслын маягт" },
      { no: "1.8", label: "Хавхлагын мэс заслын маягт" },
      { no: "1.9", label: "Зүрхний нээлттэй бусад мэс заслын маягт" },
    ],
  },
  {
    code: "rhythm",
    label: "Зүрх судасны хэм судлал",
    forms: [
      {
        no: "2.1",
        label: "Электрофизиологийн шинжилгээ / Аблаци эмчилгээний протокол",
      },
      { no: "2.2", label: "Тосгуурын жигвэгнээ бүртгэл судалгаа" },
    ],
  },
  {
    code: "angio",
    label: "Зүрх судасны ангио",
    forms: [{ no: "3.1", label: "Титэм судасны оношилгоо эмчилгээний маягт" }],
  },
];

/** every form, flat, in tender order */
export const TENDER_FORMS = TENDER_FORM_GROUPS.reduce(
  (all, g) => all.concat(g.forms),
  [],
);

/** the ones a record can actually exist for */
export const TENDER_FORMS_ACTIVE = TENDER_FORMS.filter(
  (f) => f.disabled !== true,
);

export const TenderFormLabel = (no) => {
  const hit = TENDER_FORMS.find((f) => f.no === no);
  return hit ? hit.label : no;
};
