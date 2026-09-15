import Helper from "helper";

function AdviceHelper() {}

AdviceHelper.prototype.CheckByPatient = async (PatientId, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/CheckByPatient",
    { PatientId },
    (resData) => callback && callback(resData),
  );
};

AdviceHelper.prototype.GetListCity = async (SearchOption, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData("Advice", SearchOption);
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetListCity",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

AdviceHelper.prototype.GetList = async (SearchOption, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData("Advice", SearchOption);
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetList",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

AdviceHelper.prototype.GetListSoum = async (SearchOption, callback) => {
  const ReqData = Helper.BaseCrudHelper.GetRequestData("Advice", SearchOption);
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetListSoum",
    ReqData,
    (resData) => callback && callback(resData),
  );
};

/**
 * One ticket, enriched the same way a feed card is - files, counts, author.
 *
 * The detail page used to reach for GetList with a paged search on the primary
 * key, which returns no attachments. Its own endpoint returns the ticket the
 * feed already knows how to describe.
 */
AdviceHelper.prototype.GetTicket = async (AdviceId, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetTicket",
    { AdviceId },
    (resData) => callback && callback(resData),
  );
};

AdviceHelper.prototype.GetComments = async (AdviceId, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetComments",
    { AdviceId },
    (resData) => callback && callback(resData),
  );
};

AdviceHelper.prototype.SaveAdviceCommentLike = async (
  AdviceCommentId,
  LogedUser,
  callback,
) => {
  if (AdviceCommentId && LogedUser) {
    var AdviceCommentLike = {
      AdviceCommentId,
      UserId: LogedUser.Id,
      LikeDate: Helper.ObjectHelper.getDateYMDHMS(),
    };
    await Helper.BaseCrudHelper.CallService(
      "/BaseObject/create",
      {
        ObjectName: "AdviceCommentLike",
        Data: JSON.stringify(AdviceCommentLike),
      },
      (resData) => callback && callback(resData),
    );
  }
};

AdviceHelper.prototype.RemoveAdviceCommentLike = async (
  AdviceCommentLikeId,
  LogedUser,
  callback,
) => {
  if (AdviceCommentLikeId && LogedUser) {
    const ReqData = {
      ObjectName: "AdviceCommentLike",
      DeleteOption: { Id: AdviceCommentLikeId },
    };
    await Helper.BaseCrudHelper.CallService(
      "/BaseObject/destroy",
      ReqData,
      (resData) => callback && callback(resData),
    );
  }
};

AdviceHelper.prototype.GetAdviceCommentPoint = async (callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetAdviceCommentPoint",
    {},
    (resData) => callback && callback(resData),
  );
};

AdviceHelper.prototype.SaveAdviceCommentRate = async (
  { AdviceCommentId, Point },
  callback,
) => {
  if (AdviceCommentId && Point) {
    await Helper.BaseCrudHelper.CallService(
      "/Advice/SaveAdviceCommentRate",
      {
        ObjectName: "AdviceCommentRate",
        Data: JSON.stringify({ AdviceCommentId, Point }),
      },
      (resData) => callback && callback(resData),
    );
  }
};

AdviceHelper.prototype.SaveAdviceViews = async (
  AdviceId,
  LogedUser,
  callback,
) => {
  if (AdviceId && LogedUser) {
    const AdviceView = {
      AdviceId,
      UserId: LogedUser.Id,
      ViewDate: Helper.ObjectHelper.getDateYMDHMS(),
    };
    const ReqData = {
      ObjectName: "AdviceViews",
      Data: JSON.stringify(AdviceView),
    };

    await Helper.BaseCrudHelper.CallService(
      "/BaseObject/create",
      ReqData,
      (resData) => callback && callback(resData),
    );
  }
};

AdviceHelper.prototype.SaveComment = async (
  AdviceId,
  CommentText,
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/CreateComment",
    {
      ObjectName: "AdviceComment",
      Data: JSON.stringify({
        adv_com_id_adv: AdviceId,
        adv_com_comment: CommentText,
      }),
    },
    (resData) => callback && callback(resData),
  );
};

/**
 * A short-lived, playable URL for one Advice or AdviceComment attachment.
 *
 * A browser <audio> cannot send an Authorization header, so it cannot use
 * /api/Media/stream. The server mints a ticket scoped to one file and one user
 * instead, redeemed at /api/Media/t/<ticket>. Passed to VoiceNote as FetchLink;
 * chat has its own because the two authorize differently.
 */
AdviceHelper.prototype.GetAttachmentLink = async ({ FileId }, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetAttachmentLink",
    { FileId },
    (resData) => callback && callback(resData),
  );
};

AdviceHelper.prototype.CustomSave = async (Data, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/CustomSave",
    { Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

/**
 * The unified feed. One merged, scoped, paged list replacing the two
 * separately-scoped GetListCity / GetListSoum calls the old home page made.
 *
 * Takes its own flat request rather than a GetSearchOption descriptor: the feed
 * pages by id and filters by tab, and the generic SearchText would LIKE across
 * four integer columns.
 */
AdviceHelper.prototype.GetFeed = async (
  { PageNumber = 0, PageSize = 20, Filter = "all", Search = "" },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetFeed",
    { PageNumber, PageSize, Filter, Search },
    (resData) => callback && callback(resData),
  );
};

/** Aggregates for the analytics rail, scoped identically to the feed. */
AdviceHelper.prototype.GetStats = async (
  { StartDate, EndDate, Granularity = "day" },
  callback,
) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/GetStats",
    { StartDate, EndDate, Granularity },
    (resData) => callback && callback(resData),
  );
};

/**
 * Create a ticket and publish it in one action, returning { DataId } so photos
 * can be attached to the row that was just created.
 */
AdviceHelper.prototype.CustomSaveAndPublish = async (Data, callback) => {
  await Helper.BaseCrudHelper.CallService(
    "/Advice/CustomSaveAndPublish",
    { Data: JSON.stringify(Data) },
    (resData) => callback && callback(resData),
  );
};

export default new AdviceHelper();
