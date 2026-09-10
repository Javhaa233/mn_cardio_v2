const express = require('express');
const router = express.Router();

const { Models } = require('../../config/DB');

const BaseControllerHelper = require('../../helper/BaseControllerHelper');
const OrganizationMergeHelper = require('../../helper/OrganizationMergeHelper');

// routes
router.post('/CustomSave', CustomSave);
router.get('/GetOne/:id', GetOne);
router.post('/MergePreview', MergePreview);
router.post('/Merge', Merge);

async function GetName(ObjectName, Id) {
  let Name = null;
  const DictArray = ['DictProvinceCity', 'DictSoumDistrict', 'DictBagKhoroo'];

  if (DictArray.includes(ObjectName)) {
    const Model = Models[ObjectName];
    if (Id) {
      const Data = await Model.findByPk(Id, {
        attributes: ['id_data', 'name'],
        raw: true,
      });
      Name = Data && Data.name;
    }
  }

  return Name;
}

async function SetDictNames(Data) {
  var NewData = Data;
  const addr_prov_city = NewData && NewData.addr_prov_city ? NewData.addr_prov_city : null;
  const addr_soum_dist = NewData && NewData.addr_soum_dist ? NewData.addr_soum_dist : null;
  const addr_bag_khoroo = NewData && NewData.addr_bag_khoroo ? NewData.addr_bag_khoroo : null;

  if (addr_prov_city) {
    NewData['ProvCityName'] = await GetName('DictProvinceCity', addr_prov_city);
  }
  if (addr_soum_dist) {
    NewData['SoumDistName'] = await GetName('DictSoumDistrict', addr_soum_dist);
  }
  if (addr_bag_khoroo) {
    NewData['BagKhorooName'] = await GetName('DictBagKhoroo', addr_bag_khoroo);
  }

  return NewData;
}

async function CustomSave(req, res) {
  try {
    var result = {
      Success: true,
      Message: 'Successfully saved',
      Data: { DataId: null },
    };

    const LogedUser = req.LogedUser;
    let Data = JSON.parse(req.body.Data);

    Data = await SetDictNames(Data);

    // Handle Logo: convert base64 to Buffer for database storage
    if (Data.Logo && typeof Data.Logo === 'string' && Data.Logo.startsWith('data:')) {
      // Extract base64 data from data URL (e.g., "data:image/png;base64,...")
      const base64Data = Data.Logo.split(',')[1];
      Data.Logo = Buffer.from(base64Data, 'base64');
      console.log("Converted Logo to Buffer, length:", Data.Logo.length);
    } else if (Data.Logo === undefined || Data.Logo === null) {
      // Remove Logo from Data so the existing value in the database is preserved
      delete Data.Logo;
      console.log("Logo not provided, preserving existing value");
    }

    const ObjectName = 'Organization';
    let DataId = null;
    if (Data && LogedUser) {
      if (Data.Id) {
        DataId = await BaseControllerHelper.BaseUpdate({
          ObjectName,
          Data,
          LogedUser,
          SaveLog: true,
        });
      } else {
        DataId = await BaseControllerHelper.BaseCreate({
          ObjectName,
          Data,
          LogedUser,
          SaveLog: true,
        });
      }

      result.Data.DataId = DataId;
      result.success = true;
      result.message = result.Message;
      return res.send(JSON.stringify(result));
    } else {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Information is missing');
      errorResult.success = false;
      errorResult.message = errorResult.Message;
      return res.send(JSON.stringify(errorResult));
    }
  } catch (ex) {
    console.error(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    errorResult.success = false;
    errorResult.message = errorResult.Message;
    return res.send(JSON.stringify(errorResult));
  }
}

async function GetOne(req, res) {
  try {
    const { id } = req.params;

    const organization = await Models.Organization.findByPk(id, {
      raw: true,
    });

    if (!organization) {
      const errorResult = BaseControllerHelper.GetDefaultErrorResult('Organization not found');
      errorResult.success = false;
      errorResult.message = errorResult.Message;
      return res.send(JSON.stringify(errorResult));
    }

    // Convert Logo Buffer to base64 data URL for display
    if (organization.Logo) {
      const base64 = Buffer.from(organization.Logo).toString('base64');
      // Detect image type from buffer or default to png
      let mimeType = 'image/png';
      const header = organization.Logo.slice(0, 8);
      if (header[0] === 0xff && header[1] === 0xd8) {
        mimeType = 'image/jpeg';
      } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
        mimeType = 'image/png';
      } else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
        mimeType = 'image/gif';
      }
      organization.Logo = {
        uri: `data:${mimeType};base64,${base64}`,
        ext: mimeType,
      };
    }

    return res.send(JSON.stringify({
      Success: true,
      success: true,
      Data: organization,
      data: organization,
    }));
  } catch (ex) {
    console.error(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    errorResult.success = false;
    errorResult.message = errorResult.Message;
    return res.send(JSON.stringify(errorResult));
  }
}

// Shared validation for MergePreview / Merge.
// Returns { SourceId, TargetId, Source, Target } or { Error } with a message.
async function ValidateMergeRequest(req) {
  const LogedUser = req.LogedUser;

  // Merging rewrites data across the whole database - admins only
  const RoleId = LogedUser ? parseInt(LogedUser.RoleId) : null;
  if (RoleId !== 1 && RoleId !== 6) {
    return { Error: 'Танд байгууллага нэгтгэх эрх байхгүй байна' };
  }

  const Body = req.body || {};
  const SourceId = parseInt(Body.SourceId, 10);
  const TargetId = parseInt(Body.TargetId, 10);

  if (!SourceId || !TargetId) {
    return { Error: 'Нэгтгэх болон үлдэх байгууллагыг сонгоно уу' };
  }
  if (SourceId === TargetId) {
    return { Error: 'Ижил байгууллагыг нэгтгэх боломжгүй' };
  }

  const Source = await Models.Organization.findByPk(SourceId, { raw: true });
  const Target = await Models.Organization.findByPk(TargetId, { raw: true });

  if (!Source) return { Error: 'Нэгтгэх байгууллага олдсонгүй' };
  if (!Target) return { Error: 'Үлдэх байгууллага олдсонгүй' };
  if (Source.IsActive === false || Source.IsActive === 0) {
    return { Error: 'Энэ байгууллагыг өмнө нь нэгтгэсэн байна' };
  }
  if (Target.IsActive === false || Target.IsActive === 0) {
    return { Error: 'Үлдэх байгууллага нэгтгэгдсэн байна. Өөр байгууллага сонгоно уу' };
  }

  return { SourceId, TargetId, Source, Target };
}

async function MergePreview(req, res) {
  try {
    const Checked = await ValidateMergeRequest(req);
    if (Checked.Error) {
      return res.send(
        JSON.stringify({
          Success: false,
          success: false,
          Message: Checked.Error,
          message: Checked.Error,
        })
      );
    }

    const Preview = await OrganizationMergeHelper.GetMergePreview(
      Checked.SourceId,
      Checked.TargetId
    );

    const Data = {
      ...Preview,
      SourceName: Checked.Source.Name,
      TargetName: Checked.Target.Name,
    };

    return res.send(
      JSON.stringify({ Success: true, success: true, Data, data: Data })
    );
  } catch (ex) {
    console.error(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    errorResult.success = false;
    errorResult.message = errorResult.Message;
    return res.send(JSON.stringify(errorResult));
  }
}

async function Merge(req, res) {
  try {
    const Checked = await ValidateMergeRequest(req);
    if (Checked.Error) {
      return res.send(
        JSON.stringify({
          Success: false,
          success: false,
          Message: Checked.Error,
          message: Checked.Error,
        })
      );
    }

    const { SourceId, TargetId, Source, Target } = Checked;

    const Result = await OrganizationMergeHelper.MergeOrganizations({
      SourceId,
      TargetId,
      LogedUserId: req.LogedUser ? req.LogedUser.Id : null,
    });

    const Message =
      `"${Source.Name}" байгууллагын ${Result.Total} бичлэгийг ` +
      `"${Target.Name}" руу шилжүүлж, нэгтгэсэн байгууллагыг идэвхгүй болголоо`;

    const Data = {
      ...Result,
      SourceId,
      TargetId,
      SourceName: Source.Name,
      TargetName: Target.Name,
    };

    return res.send(
      JSON.stringify({
        Success: true,
        success: true,
        Message,
        message: Message,
        Data,
        data: Data,
      })
    );
  } catch (ex) {
    console.error(ex);
    const errorResult = BaseControllerHelper.GetDefaultErrorResult();
    errorResult.success = false;
    errorResult.message = errorResult.Message;
    return res.send(JSON.stringify(errorResult));
  }
}

module.exports = router;
