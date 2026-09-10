class OrganizationHelper {
  GetName = async (Model, Id) => {
    let Name = null;
    try {
      if (Model) {
        if (Id) {
          const Data = await Model.findByPk(Id, {
            attributes: ['id_data', 'name'],
            raw: true,
          });
          Name = Data && Data.name;
        }
      }
    } catch (ex) {
      Name = null;
    }
    return Name;
  };

  SetDictNames = async (Models, Data) => {
    var NewData = Data;
    const addr_prov_city = NewData && NewData.addr_prov_city ? NewData.addr_prov_city : null;
    const addr_soum_dist = NewData && NewData.addr_soum_dist ? NewData.addr_soum_dist : null;
    const addr_bag_khoroo = NewData && NewData.addr_bag_khoroo ? NewData.addr_bag_khoroo : null;
    if (addr_prov_city) {
      NewData['ProvCityName'] = await this.GetName(Models['DictProvinceCity'], addr_prov_city);
    }
    if (addr_soum_dist)
      NewData['SoumDistName'] = await this.GetName(Models['DictSoumDistrict'], addr_soum_dist);

    if (addr_bag_khoroo)
      NewData['BagKhorooName'] = await this.GetName(Models['DictBagKhoroo'], addr_bag_khoroo);

    return NewData;
  };
}

module.exports = new OrganizationHelper();
