/* ==================================================================
   МнКардио — ЗСӨ тайлангийн эрэмбийн засвар
   Огноо: 2026-09-09    Бэлтгэсэн: ITsystem
   Сан:   MnCardioNew

   АСУУДАЛ
     Тайлан ORDER BY ... Id (өсөх) + OFFSET/FETCH ашигладаг тул
     хамгийн ХУУЧИН бичлэгээс эхэлж эрэмбэлдэг. Шинэ үзлэг сүүлийн
     хуудсанд унана. Их-Уул ЭМТ дээр 790 мөрөөс шинэ хоёр үзлэг
     781, 782-р байрлалд буюу 8-р хуудсанд байсан.
     Үзлэгийн жагсаалт нь эсрэгээр (Id desc) эрэмбэлдэг.

   ЗАСВАР
     Хоёр procedure-т ORDER BY-д DESC нэмэх. Өөр ямар ч өөрчлөлт алга.

   ЭРСДЭЛ
     Бага. Өгөгдөл хөндөгдөхгүй, зөвхөн буцаах дараалал өөрчлөгдөнө.

   БУЦААХ
     Эх хувилбарууд: rollback_original_procs.sql
   ================================================================== */



-- =============================================
-- Author:		<Author,,Name>
-- Create DATE: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[spCVDInspectionReport]
	@StartDate DATE = NULL,
	@EndDate DATE = NULL,
	@UserId INT = NULL,
	@OrganizationId INT = NULL,
	@DoctorId INT = NULL,
	@OrgIds VARCHAR(MAX) = '',
	@ProvinceCityId INT = NULL,
	@SoumDistrictId INT= NULL,
	@BagKhorooId INT = NULL,
	@Offset INT = 0,
	@Limit INT = 10000000
AS
BEGIN

IF @StartDate IS NULL
BEGIN
SET @StartDate='2021-09-01';
END

IF @EndDate IS NULL
BEGIN
SET @EndDate=GETDATE();
END

SELECT
inspection.*,
o.[Name] AS OrganizationName,
p.p_lastname AS PatLastName,
p.p_firstname AS PatFirstName,
p.p_gender AS PatGender,
p.[p_address] AS PatAddress,
p.p_telephone AS PatPhoneNumber,
p.p_workplace AS PatWorkplace,
d.lastname AS DocLastName,
d.firstname AS DocFirstName,
city.[name] AS ProvinceCity,
soum.[name] AS SoumDistrict,
bag.[name] AS BagKhoroo,
d.lastname AS DocLastName,
d.firstname AS DocFirstName
FROM dbo.vwCVDInspection inspection
LEFT JOIN Organization o ON o.Id=inspection.OrganizationId
LEFT JOIN Patient p ON p.p_registration=inspection.PatRegNo
LEFT JOIN Users u ON u.Id=inspection.CreateUserId
LEFT JOIN DoctorsProfile d ON d.id=inspection.CreateUserId
LEFT JOIN DictProvinceCity city ON city.id_data=inspection.ProvinceCityId
LEFT JOIN DictSoumDistrict soum ON soum.id_data=inspection.SoumDistrictId
LEFT JOIN DictBagKhoroo bag ON bag.id_data=inspection.BagKhorooId
WHERE CONVERT(NVARCHAR(10), inspection.CreateDate, 120) BETWEEN @StartDate AND @EndDate
AND (@OrganizationId IS NULL OR (@OrganizationId IS NOT NULL AND inspection.OrganizationId=@OrganizationId))
AND (@ProvinceCityId IS NULL OR (@ProvinceCityId IS NOT NULL AND inspection.ProvinceCityId=@ProvinceCityId))
AND (@SoumDistrictId IS NULL OR (@SoumDistrictId IS NOT NULL AND inspection.SoumDistrictId=@SoumDistrictId))
AND (@BagKhorooId IS NULL OR (@BagKhorooId IS NOT NULL AND inspection.BagKhorooId=@BagKhorooId))
AND (@OrgIds='' OR (inspection.OrganizationId IN (SELECT value FROM STRING_SPLIT(@OrgIds, ';'))))
ORDER BY inspection.Id DESC
OFFSET @Offset ROWS
FETCH NEXT @Limit ROWS ONLY

END

-- EXEC [spCVDInspectionReport] @Offset=0, @Limit=100 @ProvinceCityId=10, @SoumDistrictId=146;
GO




-- =============================================
-- Author:		<Author,,Name>
-- Create DATE: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[spCVDMonitoringReport]
	@StartDate DATE = NULL,
	@EndDate DATE = NULL,
	@UserId INT = NULL,
	@OrganizationId INT = NULL,
	@OrgIds VARCHAR(MAX) = '',
	@ProvinceCityId INT = NULL,
	@SoumDistrictId INT= NULL,
	@BagKhorooId INT = NULL,
	@Offset INT = 0,
	@Limit INT = 10000000
AS
BEGIN

IF @StartDate IS NULL
BEGIN
SET @StartDate='2021-09-01';
END

IF @EndDate IS NULL
BEGIN
SET @EndDate=GETDATE();
END

SELECT
monitoring.*,
o.[Name] AS OrganizationName,
p.p_lastname AS PatLastName,
p.p_firstname AS PatFirstName,
p.p_gender AS PatGender,
p.[p_address] AS PatAddress,
p.p_telephone AS PatPhoneNumber,
p.p_workplace AS PatWorkplace,
d.lastname AS DocLastName,
d.firstname AS DocFirstName,
city.[name] AS ProvinceCity,
soum.[name] AS SoumDistrict,
bag.[name] AS BagKhoroo,
d.lastname AS DocLastName,
d.firstname AS DocFirstName
FROM dbo.CVDMonitoring monitoring
LEFT JOIN Organization o ON o.Id=monitoring.OrganizationId
LEFT JOIN Patient p ON p.p_registration=monitoring.PatRegNo
LEFT JOIN Users u ON u.Id=monitoring.CreateUserId
LEFT JOIN DoctorsProfile d ON d.id=monitoring.CreateUserId
LEFT JOIN DictProvinceCity city ON city.id_data=monitoring.ProvinceCityId
LEFT JOIN DictSoumDistrict soum ON soum.id_data=monitoring.SoumDistrictId
LEFT JOIN DictBagKhoroo bag ON bag.id_data=monitoring.BagKhorooId
WHERE EXISTS (
	SELECT * FROM
	(
		SELECT MAX(Id) MaxId FROM dbo.CVDMonitoring
		WHERE [Status] IS NOT NULL
		AND [Status] <> 'inactive'
		AND CONVERT(NVARCHAR(10), CreateDate, 120) BETWEEN @StartDate AND @EndDate
		AND (@OrganizationId IS NULL OR (@OrganizationId IS NOT NULL AND OrganizationId=@OrganizationId))
		AND (@ProvinceCityId IS NULL OR (@ProvinceCityId IS NOT NULL AND ProvinceCityId=@ProvinceCityId))
		AND (@SoumDistrictId IS NULL OR (@SoumDistrictId IS NOT NULL AND SoumDistrictId=@SoumDistrictId))
		AND (@BagKhorooId IS NULL OR (@BagKhorooId IS NOT NULL AND BagKhorooId=@BagKhorooId))
		AND (@OrgIds='' OR (OrganizationId IN (SELECT VALUE FROM STRING_SPLIT(@OrgIds, ';'))))
		GROUP BY PatRegNo
	) A
	WHERE A.MaxId=monitoring.Id
)
ORDER BY monitoring.Id DESC
OFFSET @Offset ROWS
FETCH NEXT @Limit ROWS ONLY

END

-- exec [spCVDMonitoringReportTotal] @ProvinceCityId=10, @SoumDistrictId=146;
GO
