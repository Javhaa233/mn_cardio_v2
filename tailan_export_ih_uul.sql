/* =====================================================================
   МнКардио — ЗСӨ "Үзлэг" тайлангийн ЯГ ТЭР 55 баганыг гаргах query
   Их-Уул сумын ЭМТ (OrganizationId = 156)

   Багана бүр frontend-ийн assets/store/reportTableColumns.js -ийн
   RowColumns массивын дараалалтай яг таарна (c01..c55).
   Хувиргалт нь backend-ийн ConvertRowsData() -г мөрөөр нь дагасан.

   Ганц зориудын ялгаа: c55 "Үзлэг хийсэн огноо".
   Одоогийн код e.UpdateDate уншдаг ч тэр талбар vwCVDInspection-д
   байхгүй тул ОДООГИЙН цагийг хэвлэдэг. Энд үзлэгийн бодит
   CreateDate-г тавьсан — баганын нэр яг үүнийг хэлж байгаа.
   ===================================================================== */

SET NOCOUNT ON;
DECLARE @Org INT = 156, @Start DATE = '2021-09-01', @End DATE = '2026-09-09';

WITH base AS (
  SELECT i.Id, i.MonitoringId, i.PatRegNo, i.CreateDate, i.OrganizationId,
         i.ProvinceCityId, i.SoumDistrictId, i.BagKhorooId, i.CreateUserId
  FROM dbo.vwCVDInspection i
  WHERE i.OrganizationId = @Org
    AND CONVERT(NVARCHAR(10), i.CreateDate, 120) BETWEEN @Start AND @End
)
SELECT
 ROW_NUMBER() OVER (ORDER BY b.Id DESC)                       AS [c01],
 ISNULL(city.[name],'')                                       AS [c02],
 ISNULL(soum.[name],'')                                       AS [c03],
 ISNULL(bag.[name],'')                                        AS [c04],
 ISNULL(o.[Name],'')                                          AS [c05],
 LTRIM(RTRIM(ISNULL(p.p_lastname,'') + ' ' + ISNULL(p.p_firstname,''))) AS [c06],
 b.PatRegNo                                                   AS [c07],
 CASE WHEN TRY_CONVERT(INT, SUBSTRING(b.PatRegNo,5,1)) >= 2
      THEN CONVERT(INT,RIGHT(CONVERT(NVARCHAR(4),YEAR(b.CreateDate)),2)) - TRY_CONVERT(INT,SUBSTRING(b.PatRegNo,3,2))
      WHEN TRY_CONVERT(INT, SUBSTRING(b.PatRegNo,5,1)) <= 1
      THEN 100 + CONVERT(INT,RIGHT(CONVERT(NVARCHAR(4),YEAR(b.CreateDate)),2)) - TRY_CONVERT(INT,SUBSTRING(b.PatRegNo,3,2))
      ELSE 0 END                                              AS [c08],
 CASE WHEN NULLIF(p.p_gender,'') IS NULL THEN '' WHEN p.p_gender='M' THEN N'Эрэгтэй' ELSE N'Эмэгтэй' END AS [c09],
 ISNULL(p.p_address,'')                                       AS [c10],
 ISNULL(p.p_telephone,'')                                     AS [c11],
 CASE p.p_workplace WHEN '1' THEN N'Ажилтай' WHEN '2' THEN N'Ажилгүй' WHEN '3' THEN N'Тэтгэвэрт'
      WHEN '4' THEN N'Групп' WHEN '5' THEN N'Оюутан' WHEN '6' THEN N'Малчин' ELSE '' END AS [c12],
 CASE WHEN h.BuurniiArhagUwchin='y' THEN '1' ELSE '0' END     AS [c13],
 CASE WHEN h.Holestrin='y'          THEN '1' ELSE '0' END     AS [c14],
 CASE WHEN h.TsusniiSahar='y'       THEN '1' ELSE '0' END     AS [c15],
 CASE WHEN h.ZurkhShigdees='y'      THEN '1' ELSE '0' END     AS [c16],
 CASE WHEN h.TarkhiHarvalt='y'      THEN '1' ELSE '0' END     AS [c17],
 CASE WHEN h.Stenokardi='y'         THEN '1' ELSE '0' END     AS [c18],
 CASE WHEN h.TsusHomsroh='y'        THEN '1' ELSE '0' END     AS [c19],
 CASE WHEN h.ZahiinSudas='y'        THEN '1' ELSE '0' END     AS [c20],
 CASE WHEN h.GerbulNasbaralt='y'    THEN '1' ELSE '0' END     AS [c21],
 CASE WHEN h.TamkhiTatdag='y'       THEN '1' ELSE '0' END     AS [c22],
 CASE WHEN h.IsDaraltEm='y'         THEN '1' ELSE '0' END     AS [c23],
 CASE WHEN h.IsDiabeticEm='y'       THEN '1' ELSE '0' END     AS [c24],
 ISNULL(CONVERT(NVARCHAR(50),bs.Height),'')                   AS [c25],
 ISNULL(CONVERT(NVARCHAR(50),bs.Weigth),'')                   AS [c26],
 ISNULL(CONVERT(NVARCHAR(50),bs.BJI),'')                      AS [c27],
 ISNULL(CONVERT(NVARCHAR(50),bs.Buselkhii),'')                AS [c28],
 ISNULL(CONVERT(NVARCHAR(50),bs.DaraltDeed),'')               AS [c29],
 ISNULL(CONVERT(NVARCHAR(50),bs.DaraltDood),'')               AS [c30],
 ISNULL(CONVERT(NVARCHAR(50),bs.UlunGlucose),'')              AS [c31],
 ISNULL(CONVERT(NVARCHAR(50),bs.Cholesterol),'')              AS [c32],
 CASE WHEN CONVERT(NVARCHAR(20),rk.Risk)='1' THEN '1' ELSE '0' END AS [c33],
 CASE WHEN CONVERT(NVARCHAR(20),rk.Risk)='2' THEN '1' ELSE '0' END AS [c34],
 CASE WHEN CONVERT(NVARCHAR(20),rk.Risk)='3' THEN '1' ELSE '0' END AS [c35],
 CASE WHEN CONVERT(NVARCHAR(20),rk.Risk)='4' THEN '1' ELSE '0' END AS [c36],
 CASE WHEN CONVERT(NVARCHAR(20),rk.Risk)='5' THEN '1' ELSE '0' END AS [c37],
 CASE WHEN h.IsDaraltEm IS NULL THEN '-' WHEN h.IsDaraltEm='y' THEN '1' ELSE '0' END AS [c38],
 CASE WHEN h.IsDiabeticEm IS NOT NULL THEN (CASE WHEN h.IsDiabeticEm='y' THEN '1' ELSE '0' END)
      WHEN h.TsusniiSahar  IS NOT NULL THEN (CASE WHEN h.TsusniiSahar='y'  THEN '1' ELSE '0' END)
      ELSE '-' END                                            AS [c39],
 '' AS [c40], '' AS [c41], '' AS [c42], '1' AS [c43], '1' AS [c44], '' AS [c45],
 '1' AS [c46], '' AS [c47], '' AS [c48], '' AS [c49], '' AS [c50],
 '' AS [c51], '' AS [c52], '' AS [c53],
 CASE WHEN d.lastname IS NULL OR d.lastname='' THEN ISNULL(d.firstname,'')
      ELSE LEFT(d.lastname,1) + '.' + ISNULL(d.firstname,'') END AS [c54],
 CONVERT(NVARCHAR(19), b.CreateDate, 120)                     AS [c55]
FROM base b
LEFT JOIN Organization o ON o.Id = b.OrganizationId
LEFT JOIN DictProvinceCity city ON city.id_data = b.ProvinceCityId
LEFT JOIN DictSoumDistrict soum ON soum.id_data = b.SoumDistrictId
LEFT JOIN DictBagKhoroo   bag  ON bag.id_data  = b.BagKhorooId
OUTER APPLY (SELECT TOP 1 p2.* FROM Patient p2 WHERE p2.p_registration = b.PatRegNo ORDER BY p2.id_data) p
LEFT JOIN DoctorsProfile d ON d.id = b.CreateUserId
OUTER APPLY (SELECT TOP 1 x.* FROM CVDHistory  x WHERE x.MonitoringId = b.MonitoringId ORDER BY x.Id DESC) h
OUTER APPLY (SELECT TOP 1 x.* FROM CVDBodySize x WHERE x.MonitoringId = b.MonitoringId ORDER BY x.Id DESC) bs
OUTER APPLY (SELECT TOP 1 x.* FROM CVDRisk     x WHERE x.MonitoringId = b.MonitoringId ORDER BY x.Id DESC) rk
ORDER BY b.Id DESC;
