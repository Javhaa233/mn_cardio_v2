// -----------------------------------------------------------------------------
// The A4 sheet engine.
//
// Takes field METADATA plus a record and produces a printable sheet. It does not
// know where the metadata came from, which is the point: the tender forms
// describe themselves through TenderFormField, the older registries describe
// themselves through ModelConfigs, and both end up here rather than growing a
// second, divergent printer.
//
// It emits real HTML text and lets the renderer paginate. Deliberately NOT an
// html2canvas bitmap: those lose text fidelity, cannot break across pages, and
// cannot be searched.
//
// Callers are thin adapters - see reports/TenderForm.js and reports/ConfigSheet.js.
// -----------------------------------------------------------------------------

const BLANK_LINE = '________________________';

// Kept local so reports/ stays a directory of pure, dependency-free HTML
// builders - the same reason reports/Ambulatori.js carries its own.
function Esc(Value) {
  if (Value === null || Value === undefined) return '';
  return String(Value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- values ------------------------------------------------------- */

/** Conditional reveal - the shared rule, matching the editor (TenderForm.jsx) exactly. */
const { IsVisible } = require('../helper/TenderFormVisibility');

function OptionLabel(Field, Raw) {
  if (Field.Data && Field.Data.length) {
    const Hit = Field.Data.find((o) => o.Value + '' === Raw + '');
    if (Hit) return Hit.Label;
  }
  return Raw;
}

/**
 * A stored answer as the paper form expects to read it.
 *
 * `Labels` wins when it has an entry: the legacy registries resolve lookups
 * server-side into `<field>Obj` rows, and that resolution is better than
 * anything guessable from the option list alone.
 *
 * Multi-valued answers are stored either as a JSON array or as a comma-joined
 * string depending on which control wrote them, so both are accepted rather
 * than trusting one.
 */
function Display(Field, Values, Labels) {
  if (Labels && Object.prototype.hasOwnProperty.call(Labels, Field.Name)) {
    const Resolved = Labels[Field.Name];
    if (Resolved !== null && Resolved !== undefined && Resolved !== '') {
      return Field.Unit ? `${Resolved} ${Field.Unit}` : String(Resolved);
    }
  }

  const Raw = Values ? Values[Field.Name] : undefined;
  if (Raw === undefined || Raw === null || Raw === '') return '';

  let List = null;
  if (Array.isArray(Raw)) {
    List = Raw;
  } else if (typeof Raw === 'string' && Raw.trim().startsWith('[')) {
    try {
      const Parsed = JSON.parse(Raw);
      if (Array.isArray(Parsed)) List = Parsed;
    } catch (e) {
      List = null;
    }
  } else if (typeof Raw === 'string' && Raw.indexOf(',') > -1 && Field.Data && Field.Data.length) {
    List = Raw.split(',').map((v) => v.trim());
  }

  const Text = List
    ? List.map((v) => OptionLabel(Field, v))
        .filter(Boolean)
        .join(', ')
    : OptionLabel(Field, Raw) + '';

  return Field.Unit && Text ? `${Text} ${Field.Unit}` : Text;
}

/* ---------- deciding what shape a section wants -------------------------- */

const IsSubset = (Small, Large) => Small.every((v) => Large.indexOf(v) > -1);

/**
 * Cluster a section's radio fields into one answer family.
 *
 * A checklist page - form 1.2's surgical safety checklist is the clearest case
 * - is a matrix: one row per question, one column per possible answer. No
 * dictionary says "this section is a checklist", so it is inferred from the
 * option lists: fields belong to one family when one field's option set is a
 * SUBSET of the other's.
 *
 * On form 1.2 that puts f12_yn (Тийм/Үгүй) and f12_yn3 (Тийм/Үгүй/Тодорхойгүй)
 * into a single three-column matrix, while f12_harshil (allergy types) and
 * f12_haldvar (infection types) stay out of it and print as ordinary rows -
 * which is what the paper form does. Testing subset relationships rather than
 * matching the literal strings "Тийм"/"Үгүй" is what keeps this working for
 * forms whose answer wording differs, and for the yes/no runs that fill the
 * older registries.
 */
function FindChecklistFamily(Fields, Forced) {
  const Candidates = Fields.filter(
    (f) =>
      (f.Type === 'RadioBox' || f.Type === 'yorn') &&
      f.Data &&
      f.Data.length >= 2 &&
      f.Data.length <= 4
  );
  const Minimum = Forced === 'checklist' ? 1 : 3;
  if (Candidates.length < Minimum) return null;

  const Families = [];
  Candidates.forEach((Field) => {
    const Values = (Field.Data || []).map((o) => o.Value + '');
    const Family = Families.find(
      (fam) => IsSubset(Values, fam.Values) || IsSubset(fam.Values, Values)
    );
    if (!Family) {
      Families.push({ Values, Columns: Field.Data, Members: [Field] });
      return;
    }
    // the widest member defines the columns, so a two-state row printed inside a
    // three-state matrix still gets its third cell drawn (and marked N/A)
    if (Values.length > Family.Values.length) {
      Family.Values = Values;
      Family.Columns = Field.Data;
    }
    Family.Members.push(Field);
  });

  const Best = Families.sort((a, b) => b.Members.length - a.Members.length)[0];
  return Best && Best.Members.length >= Minimum ? Best : null;
}

/**
 * Split one section's fields into ordered render blocks.
 *
 * Each block keeps the position of its first field, so a checklist matrix or a
 * segment grid appears where the paper form puts it rather than being hoisted
 * to the top or pushed to the bottom.
 */
function PickBlocks(Fields) {
  // PrintLayout, set on any field of a section, overrides the inference for that
  // whole section. It is optional metadata and usually absent, in which case
  // this is simply undefined.
  const Forced = Fields.map((f) => f.PrintLayout).find(Boolean) || null;

  const Segments = Fields.filter((f) => f.Name.indexOf('Seg') === 0);
  const UseSegments = Forced !== 'pairs' && Segments.length >= 4;

  const Family =
    Forced === 'pairs'
      ? null
      : FindChecklistFamily(
          Fields.filter((f) => !(UseSegments && f.Name.indexOf('Seg') === 0)),
          Forced
        );
  const ChecklistMembers = Family ? Family.Members : [];

  const Blocks = [];
  let Pairs = null;
  let SegmentsPlaced = false;
  let ChecklistPlaced = false;

  Fields.forEach((Field) => {
    if (UseSegments && Field.Name.indexOf('Seg') === 0) {
      if (!SegmentsPlaced) {
        SegmentsPlaced = true;
        Pairs = null;
        Blocks.push({ Kind: 'segments', Fields: Segments });
      }
      return;
    }
    if (ChecklistMembers.indexOf(Field) > -1) {
      if (!ChecklistPlaced) {
        ChecklistPlaced = true;
        Pairs = null;
        Blocks.push({ Kind: 'checklist', Columns: Family.Columns, Fields: ChecklistMembers });
      }
      return;
    }
    if (Field.Type === 'Table') {
      Pairs = null;
      Blocks.push({ Kind: 'table', Field });
      return;
    }
    if (!Pairs) {
      Pairs = { Kind: 'pairs', Fields: [] };
      Blocks.push(Pairs);
    }
    Pairs.Fields.push(Field);
  });

  return Blocks;
}

/* ---------- block renderers ---------------------------------------------- */

function RenderChecklist(Block, Values, Blank) {
  const Columns = Block.Columns || [];
  const Head = Columns.map((c) => `<th class="ck-opt">${Esc(c.Label)}</th>`).join('');

  const Rows = Block.Fields.map((Field) => {
    const Offered = (Field.Data || []).map((o) => o.Value + '');
    const Answer = Blank ? '' : (Values[Field.Name] ?? '') + '';

    const Cells = Columns.map((Column) => {
      // The third answer column is not universal on the paper form: some rows
      // offer Тийм/Үгүй only. Those cells are struck out rather than left
      // blank, so nobody ticks an answer the form does not accept.
      if (Offered.indexOf(Column.Value + '') === -1) {
        return '<td class="ck-cell ck-na"></td>';
      }
      const On = Answer !== '' && Answer === Column.Value + '';
      return `<td class="ck-cell"><span class="bx${On ? ' on' : ''}">${On ? '✕' : ''}</span></td>`;
    }).join('');

    return `<tr><td class="ck-q">${Esc(Field.Label)}</td>${Cells}</tr>`;
  }).join('');

  return `<table class="ck">
      <thead><tr><th class="ck-q"></th>${Head}</tr></thead>
      <tbody>${Rows}</tbody>
    </table>`;
}

/**
 * The 19-segment coronary grid as one aligned table.
 *
 * The dictionary carries it as 38 stacked fields, so printing it field by field
 * gives 38 label/value rows that look nothing like the paper original. Pairing
 * is by field code: X with X + "Percent".
 */
function RenderSegments(Block, Values, Labels, Blank) {
  const Bases = Block.Fields.filter((f) => f.Name.slice(-7) !== 'Percent');
  if (!Bases.length) return '';

  const Rows = Bases.map((Base) => {
    const Percent = Block.Fields.find((f) => f.Name === Base.Name + 'Percent');
    const Name = (Base.Label || Base.Name).split(' - ')[0];
    return `<tr>
        <td class="gr-l">${Esc(Name)}</td>
        <td>${Blank ? '' : Esc(Display(Base, Values, Labels))}</td>
        <td>${Blank || !Percent ? '' : Esc(Display(Percent, Values, Labels))}</td>
      </tr>`;
  }).join('');

  return `<table class="gr">
      <thead><tr><th>Сегмент</th><th>Байдал</th><th>Нарийсал (%)</th></tr></thead>
      <tbody>${Rows}</tbody>
    </table>`;
}

/**
 * A repeating grid (the ACT log, the vein-isolation grid, the dose list).
 *
 * Stored as a JSON array of row objects. Empty rows are still drawn - TableRows
 * of them, or three - so the sheet can be filled in by hand like the paper
 * original.
 */
function RenderTable(Block, Values, Blank) {
  const Field = Block.Field;
  const Columns = Array.isArray(Field.TableColumns) ? Field.TableColumns : [];
  const Label = `<div class="gr-cap">${Esc(Field.Label)}</div>`;
  if (!Columns.length) return Label;

  let Rows = [];
  const Raw = Blank ? null : Values[Field.Name];
  if (Raw) {
    try {
      const Parsed = typeof Raw === 'string' ? JSON.parse(Raw) : Raw;
      if (Array.isArray(Parsed)) Rows = Parsed;
    } catch (e) {
      // a hand-edited value can hold something that is not JSON; show it rather
      // than losing it or breaking the sheet
      return `${Label}<div class="raw">${Esc(Raw)}</div>`;
    }
  }

  const Blanks = Math.max(0, (parseInt(Field.TableRows, 10) || 3) - Rows.length);
  const Filler = Array.from({ length: Blanks }, () => ({}));

  const Body = Rows.concat(Filler)
    .map(
      (Row) =>
        `<tr>${Columns.map(
          (c) => `<td>${Row && Row[c.code] != null ? Esc(Row[c.code]) : ''}</td>`
        ).join('')}</tr>`
    )
    .join('');

  return `${Label}<table class="gr">
      <thead><tr>${Columns.map((c) => `<th>${Esc(c.label || c.code)}</th>`).join('')}</tr></thead>
      <tbody>${Body}</tbody>
    </table>`;
}

/**
 * Ordinary label/value rows.
 *
 * Narrow fields (md <= 6) are paired two to a row, following the grid width the
 * metadata already declares for the editor. On the long surgery forms that is
 * the difference between a six-page and a ten-page printout.
 */
function RenderPairs(Block, Values, Labels, Blank) {
  const Items = Block.Fields.map((Field) => {
    const Value = Blank ? '' : Display(Field, Values, Labels);
    const Wide = Field.Type === 'TextArea';
    return {
      Label: Esc(Field.Label),
      // a blank form needs a rule to write on; a filled one leaves unanswered
      // fields genuinely empty rather than inviting a pen
      Value: Value === '' ? (Blank ? BLANK_LINE : '') : Esc(Value),
      Wide,
      Narrow: !Wide && (Field.md || 12) <= 6,
    };
  });

  const Rows = [];
  for (let i = 0; i < Items.length; i += 1) {
    const Left = Items[i];
    const Right = Items[i + 1];
    if (Left.Narrow && Right && Right.Narrow) {
      Rows.push(
        `<tr><td class="pv-l">${Left.Label}</td><td class="pv-v">${Left.Value}</td>` +
          `<td class="pv-l">${Right.Label}</td><td class="pv-v">${Right.Value}</td></tr>`
      );
      i += 1;
    } else {
      Rows.push(
        `<tr><td class="pv-l">${Left.Label}</td>` +
          `<td class="pv-v${Left.Wide ? ' pv-area' : ''}" colspan="3">${Left.Value}</td></tr>`
      );
    }
  }

  return `<table class="pv"><tbody>${Rows.join('')}</tbody></table>`;
}

function RenderBlock(Block, Values, Labels, Blank) {
  switch (Block.Kind) {
    case 'checklist':
      return RenderChecklist(Block, Values, Blank);
    case 'segments':
      return RenderSegments(Block, Values, Labels, Blank);
    case 'table':
      return RenderTable(Block, Values, Blank);
    default:
      return RenderPairs(Block, Values, Labels, Blank);
  }
}

/* ---------- the sheet ----------------------------------------------------- */

const STYLE = `
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", Georgia, serif; font-size: 10.5pt;
         color: #000; background: #fff; margin: 0; padding: 0; }
  h1 { font-size: 13pt; text-align: center; margin: 0 0 2mm;
       text-transform: uppercase; line-height: 1.35; }
  .draft { display: inline-block; border: 1px solid #000; padding: 0.4mm 2mm;
           font-size: 9pt; letter-spacing: 1px; }
  .draft-wrap { text-align: center; margin-bottom: 2mm; }
  .meta { display: flex; flex-wrap: wrap; gap: 1mm 4mm; font-size: 10pt;
          margin-bottom: 3mm; }
  .meta div { flex: 1 1 45%; }
  .sec { page-break-inside: avoid; }
  .sec-t { font-weight: bold; font-size: 11pt; margin: 3mm 0 1mm;
           border-bottom: 1px solid #000; padding-bottom: 0.5mm;
           page-break-after: avoid; }
  .sec + .sec { margin-top: 2mm; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 1.5mm; }
  td, th { border: 1px solid #444; padding: 1.1mm 2mm; vertical-align: top;
           font-size: 10pt; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }

  .pv-l { width: 34%; }
  .pv-v { width: 16%; font-weight: bold; }
  .pv-v[colspan] { width: auto; }
  .pv-area { height: 9mm; font-weight: normal; }

  .ck th { background: #f2f2f2; text-align: center; font-size: 9.5pt; }
  .ck-q { width: 58%; text-align: left; font-weight: normal; }
  .ck-cell { text-align: center; vertical-align: middle; }
  .ck-na { background: repeating-linear-gradient(45deg, #fff, #fff 2px, #ccc 2px, #ccc 3px); }
  .bx { display: inline-block; width: 3.6mm; height: 3.6mm; border: 1px solid #000;
        line-height: 3.4mm; font-size: 9pt; text-align: center; }

  .gr th { background: #f2f2f2; text-align: center; font-size: 9.5pt; }
  .gr td { text-align: center; height: 6mm; }
  .gr .gr-l { text-align: left; }
  .gr-cap { font-weight: bold; margin: 1.5mm 0 1mm; }
  .raw { font-size: 9.5pt; }

  .notice { border: 1px solid #000; padding: 1.2mm 2mm; margin-bottom: 2.5mm;
            font-size: 9.5pt; }
  .sign { margin-top: 6mm; font-size: 10pt; page-break-inside: avoid; }
  .sign span { display: inline-block; min-width: 60mm; }
`;

/**
 * @param {string} Title      sheet heading
 * @param {array}  Sections   [{ Label, Fields }] in display order
 * @param {object} Values     raw record / answers
 * @param {object} Labels     optional Name -> already-resolved display text
 * @param {array}  Meta       [{ Label, Value }] identity block
 * @param {object} Options    { Blank, Draft, Logo, ShowLetterhead, Signature }
 */
function FormSheet({ Title, Sections, Values, Labels, Meta, Options }) {
  const Opt = Options || {};
  const Blank = !!Opt.Blank;
  const Vals = Blank ? {} : Values || {};
  const Lbls = Blank ? {} : Labels || {};

  // every field by code, so visibility can follow a chain of parents
  const ByName = new Map();
  (Sections || []).forEach((s) => (s.Fields || []).forEach((f) => ByName.set(f.Name, f)));

  const Body = (Sections || [])
    .map((Section) => {
      const Fields = (Section.Fields || []).filter(
        (f) => Blank || IsVisible(f, Vals, ByName)
      );
      if (!Fields.length) return '';

      const Blocks = PickBlocks(Fields)
        .map((Block) => RenderBlock(Block, Vals, Lbls, Blank))
        .join('');

      return `<div class="sec">${
        Section.Label ? `<div class="sec-t">${Esc(Section.Label)}</div>` : ''
      }${Blocks}</div>`;
    })
    .join('');

  const MetaHtml = (Meta || [])
    .map(
      (m) =>
        `<div>${Esc(m.Label)}: <b>${
          m.Value === '' || m.Value === null || m.Value === undefined ? BLANK_LINE : Esc(m.Value)
        }</b></div>`
    )
    .join('');

  const Logo =
    Opt.Logo && Opt.ShowLetterhead
      ? `<div style="text-align:center;margin-bottom:2mm;">
           <img src="${Opt.Logo}" style="height:12mm;" alt="" /></div>`
      : '';

  const Draft = Opt.Draft ? '<div class="draft-wrap"><span class="draft">НООРОГ</span></div>' : '';

  // A sheet that is missing part of the record must SAY so. A blank page is
  // obviously broken; a plausible-looking sheet quietly missing two thirds of
  // its fields is worse, because it can be filed as a complete record.
  const Notice = Opt.Notice ? `<div class="notice">${Esc(Opt.Notice)}</div>` : '';

  const Sign = Opt.Signature
    ? `<div class="sign">${Esc(Opt.Signature.Label)}: <span>${Esc(
        Opt.Signature.Value || ''
      )}</span> /................................/</div>`
    : '';

  return `<!doctype html>
<html lang="mn">
  <head>
    <meta charset="UTF-8" />
    <title>${Esc(Title)}</title>
    <style>${STYLE}</style>
  </head>
  <body>
    ${Logo}
    <h1>${Esc(Title)}</h1>
    ${Draft}
    ${Notice}
    ${MetaHtml ? `<div class="meta">${MetaHtml}</div>` : ''}
    ${Body}
    ${Sign}
  </body>
</html>`;
}

module.exports = FormSheet;
module.exports.BLANK_LINE = BLANK_LINE;
module.exports.Esc = Esc;
