/**
 * The legal states of a remote-examination request, and the moves between them.
 *
 * Mobile tender 2.6 Цахим үзлэг, tracker row 40: "Алсын зайн үзлэгийн хүсэлт,
 * цаг захиалга, үзлэг" - request, appointment booking, examination - with the
 * acceptance criterion "Цахим үзлэгийн бүрэн урсгал ажиллана".
 *
 * ONE FILE, TWO CONTROLLERS. Both the patient surface and the doctor surface
 * move records through this machine, from opposite ends. A state machine copied
 * into two controllers is one that will eventually disagree with itself about
 * whether a completed visit can be cancelled - and the disagreement will be
 * discovered by a clinician, not by us.
 *
 * VALUES, NOT LABELS. These strings are the OptionTypes `value` column for the
 * remotevisit_status dico and the DEFAULT on RemoteVisit.Status. The Mongolian
 * wording attached to them is drafted and awaiting ЗСҮТ approval, and lives in
 * the dictionary - so approval changes labels, never this file.
 */

const STATUS = {
  REQUESTED: 'requested',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/** Still needs somebody to do something. The default filter for both queues. */
const OPEN = [STATUS.REQUESTED, STATUS.SCHEDULED];

const ALL = Object.values(STATUS);

/**
 * requested -> scheduled | completed | cancelled
 * scheduled -> scheduled | completed | cancelled
 * completed -> terminal
 * cancelled -> terminal
 *
 * scheduled -> scheduled is a RESCHEDULE, and is deliberately legal: a slot
 * moves more often than anything else in a clinic, and forcing a cancel-and-
 * refile would lose the patient's original complaint text and their place in
 * the queue.
 *
 * The terminal states are terminal on purpose. A completed examination is a
 * clinical event that happened; reopening it would let the record contradict
 * the examination note written against it. A repeat consultation is a NEW
 * request - the same rule the tender forms use for a repeat procedure.
 */
const TRANSITIONS = {
  [STATUS.REQUESTED]: [STATUS.SCHEDULED, STATUS.COMPLETED, STATUS.CANCELLED],
  [STATUS.SCHEDULED]: [STATUS.SCHEDULED, STATUS.COMPLETED, STATUS.CANCELLED],
  [STATUS.COMPLETED]: [],
  [STATUS.CANCELLED]: [],
};

function IsStatus(v) {
  return ALL.includes(String(v));
}

/**
 * May a record move from -> to?
 *
 * An unrecognised `from` returns false rather than throwing. Status is a plain
 * varchar with a DEFAULT, so a row written before this machine existed, or by
 * hand, can hold anything; refusing to move it is safer than guessing, and the
 * caller turns that into a 409 the client can show.
 */
function CanTransition(from, to) {
  const F = String(from || '');
  const T = String(to || '');
  if (!IsStatus(F) || !IsStatus(T)) return false;
  return TRANSITIONS[F].includes(T);
}

/** Terminal states cannot be changed by anyone, including an admin. */
function IsTerminal(status) {
  const S = String(status || '');
  return IsStatus(S) && TRANSITIONS[S].length === 0;
}

function IsOpen(status) {
  return OPEN.includes(String(status || ''));
}

module.exports = { STATUS, OPEN, ALL, CanTransition, IsTerminal, IsOpen, IsStatus };
