const { Models } = require('../../config/DB');

/**
 * Handlers for /api/admin/*. Same lowercase envelope as the rest of api/**.
 */

const ok = (res, data, extra) =>
  res.json(Object.assign({ success: true, message: '', data }, extra || {}));

const serverError = (res, ex, where) => {
  console.error('[api/admin] ' + where + ':', ex);
  return res.status(500).json({
    success: false,
    code: 'SERVER_ERROR',
    message: 'Сервер дээр алдаа гарлаа',
    data: null,
  });
};

const readPaging = (req) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  return { limit, offset };
};

/**
 * Recent backups and whether they worked — tender §1.3.
 *
 * The point of this endpoint is that "is the database being backed up?" should
 * be answerable without a DBA. Until now it was not answerable at all: the job
 * recorded Status only when it FAILED, so a successful run and a run that never
 * happened both left Status NULL (see controllers/system/AppController.js).
 *
 * `StatusText` interprets the column rather than making every caller learn it:
 *
 *   '1'   амжилттай   — succeeded
 *   '0'   амжилтгүй   — failed
 *   NULL  тодорхойгүй — unknown. Every row written before 2026-09-14 is this,
 *                       and so is any row from a run that died before it could
 *                       record an outcome. It is NOT a synonym for success.
 *
 * `summary` counts the last 30 days, because the useful question is not "what
 * was the last backup" but "have any of them failed lately".
 */
exports.listBackups = async (req, res) => {
  try {
    const { limit, offset } = readPaging(req);

    const { rows, count } = await Models.Backup.findAndCountAll({
      attributes: ['Id', 'Status', 'FileName', 'CreatedDate', 'ExpiredDate'],
      order: [['Id', 'DESC']],
      limit,
      offset,
      raw: true,
    });

    const Text = (s) => {
      if (s === null || s === undefined || s === '') return 'Тодорхойгүй';
      return String(s) === '1' ? 'Амжилттай' : 'Амжилтгүй';
    };

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recent = await Models.Backup.findAll({
      attributes: ['Status', 'CreatedDate'],
      where: { CreatedDate: { [require('../../config/DB').Op.gte]: since } },
      raw: true,
    });

    const summary = { days: 30, total: recent.length, succeeded: 0, failed: 0, unknown: 0 };
    recent.forEach((r) => {
      const s =
        r.Status === null || r.Status === undefined || r.Status === '' ? null : String(r.Status);
      if (s === '1') summary.succeeded += 1;
      else if (s === null) summary.unknown += 1;
      else summary.failed += 1;
    });

    return ok(
      res,
      rows.map((r) => ({
        Id: r.Id,
        Status:
          r.Status === null || r.Status === undefined || r.Status === '' ? null : String(r.Status),
        StatusText: Text(r.Status),
        FileName: r.FileName,
        CreatedDate: r.CreatedDate,
        ExpiredDate: r.ExpiredDate,
      })),
      { total: count, limit, offset, summary }
    );
  } catch (ex) {
    return serverError(res, ex, 'listBackups');
  }
};
