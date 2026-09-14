/**
 * Conditional reveal for the tender forms - the ONE server-side definition.
 *
 * A dictionary row (TenderFormField) may name a ParentField. The row is shown
 * only while the parent's answer matches ParentValue. ParentValue is a small
 * expression, so a whole section can be skipped by data alone, with no DDL:
 *
 *   'o2'     parent equals o2                    (the original rule)
 *   'a|b'    parent equals any of a, b           (ST+ block: either ST+ indication)
 *   '!o1'    parent answered, and is not o1      (3.1: "Coronary angiography only"
 *                                                 skips the Angioplasty sections)
 *   '!a|b'   parent answered, and is neither a nor b
 *
 * An unanswered parent hides the child in every form of the rule: nothing is
 * revealed until the question that governs it has been answered.
 *
 * The editor carries a byte-for-byte copy of this rule in
 * frontend/src/customComponents/Forms/NationalRegistry/Surgery/TenderForm.jsx
 * (IsVisible). Change both or neither - the printed sheet, the server's
 * Confirm check and the screen must agree on what a doctor was asked.
 */

function IsEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

function MatchesParentValue(Parent, ParentValue) {
  if (IsEmpty(Parent)) return false;
  const Rule = ParentValue === undefined || ParentValue === null ? '' : ParentValue + '';
  const Negate = Rule.startsWith('!');
  const Wanted = (Negate ? Rule.slice(1) : Rule).split('|').map((s) => s.trim());
  const Hit = Wanted.includes(Parent + '');
  return Negate ? !Hit : Hit;
}

/**
 * Visible given the answers so far. Values is the flat { FieldCode: answer } map.
 *
 * Transitive when `ByCode` is given (a Map or object of code -> row carrying
 * ParentField/ParentValue): a field whose parent is itself hidden is hidden,
 * even if the parent still holds an old answer. That is what lets 3.1 hide a
 * whole block - "if occluded: age of occlusion" inside the angioplasty session
 * - by giving only the block's top rows a parent.
 */
function IsVisible(Field, Values, ByCode, Depth = 0) {
  if (!Field || !Field.ParentField) return true;
  const Parent = Values ? Values[Field.ParentField] : undefined;
  if (!MatchesParentValue(Parent, Field.ParentValue)) return false;
  if (!ByCode || Depth > 10) return true;
  const Row =
    typeof ByCode.get === 'function' ? ByCode.get(Field.ParentField) : ByCode[Field.ParentField];
  return Row ? IsVisible(Row, Values, ByCode, Depth + 1) : true;
}

module.exports = { IsVisible, IsEmpty, MatchesParentValue };
