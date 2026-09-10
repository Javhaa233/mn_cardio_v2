const {
  getData: getCVDMonitoringSuom,
  getExcelFile: getFileCVDMonitoringSuom,
} = require('../../services/report/CVDMonitoringSuom');

exports.getCVDMonitoringSuom = async (req, res) => {
  const {
    StartDate,
    EndDate,
    UserId,
    OrganizationId,
    ProvinceCityId,
    SoumDistrictId,
    Offset,
    Limit,
    excel,
  } = req.query;
  try {
    const result = { success: true, message: 'Амжилттай', data: [] };
    const resGetData = await getCVDMonitoringSuom({
      StartDate,
      EndDate,
      UserId,
      OrganizationId,
      ProvinceCityId,
      SoumDistrictId,
      Offset,
      Limit,
    });

    if (!resGetData.success) {
      return res.status(200).json(resGetData);
    }

    if (excel) {
      const resGetFile = await getFileCVDMonitoringSuom({
        data: resGetData.data,
      });

      if (!resGetFile.success) {
        return res.status(200).json(resGetFile);
      }

      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.download(resGetFile.data);
    }

    result.data = resGetData.data;
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(200).json({ success: false, message: 'Сервер дээр алдаа гарлаа' });
  }
};
