function ExaminationEcho(Data) {
  var imgSrc = 'file:///' + __dirname.replace(/\\/g, '/') + '/Echo/echo_examination_image.png';

  return `<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
  </head>
  <body
    style="
      margin: 0 auto;
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 9px;
    "
  >
    <div style="padding: 0 15px 0 15px; font-weight: normal; width: 580px">
      <div style="text-align: center; margin-bottom: 10px; margin-top: 10px">
        <h5 style="margin: 0; padding: 0; font-size: 13px; font-weight: 500">
          ЗҮРХНИЙ ХЭТ АВИАН ШИНЖИЛГЭЭ
        </h5>
        <span style="font-size: 12px"
          >(MnCardio програмаас гаргасан тайлан)</span
        >
      </div>
      <div style="margin-bottom: 10px">
        <div style="float: left; width: 55%">
          <div>Огноо: ${Data.date_creation ? Data.date_creation : ''}</div>
          <div>Нэр: ${Data.Patient ? Data.Patient.p_lastname : ''} овогтой ${
            Data.Patient ? Data.Patient.p_firstname : ''
          }</div>
          <div>Онош:</div>
        </div>
        <div style="float: left; width: 35%">
          <span>Нас: ${Data.Patient ? Data.Patient.Age : ''}</span
          ><span style="margin-left: 25px">Хүйс: ${
            Data.Patient && Data.Patient.Gender ? Data.Patient.Gender.label : ''
          }</span>
        </div>
        <div style="clear: both"></div>
      </div>
      <div>
        <div style="float: left; width: 40%">
          <div style="float: left; width: 50%">Aorta (cm): ${Data.aorta ? Data.aorta : '0'}</div>
          <div style="float: left; width: 50%">Left atrium (cm):  ${
            Data.left_atrium ? Data.left_atrium : '0'
          }</div>
          <div style="float: left; width: 50%">LVDd (cm):  ${Data.lvdd ? Data.lvdd : '0'}</div>
          <div style="float: left; width: 50%">LVDs (cm):  ${Data.lvds ? Data.lvds : '0'}</div>
          <div style="float: left; width: 50%">IVSd (cm):  ${Data.ivsd ? Data.ivsd : '0'}</div>
          <div style="float: left; width: 50%">IVSs (cm):  ${Data.ivss ? Data.ivss : '0'}</div>
          <div style="float: left; width: 50%">PWd (cm):  ${Data.pwd ? Data.pwd : '0'}</div>
          <div style="float: left; width: 50%">PWs (cm):  ${Data.pws ? Data.pws : '0'}</div>
          <div style="float: left; width: 50%">EF (%):  ${Data.ef ? Data.ef : '0'}</div>
          <div style="float: left; width: 50%">FS (%):  ${Data.fs ? Data.fs : '0'}</div>
          <div style="float: left; width: 50%">SV (ml):  ${Data.sv ? Data.sv : '0'}</div>
          <div style="float: left; width: 50%">LV mass (gr):  ${
            Data.lv_mass ? Data.lv_mass : '0'
          }</div>
        </div>
        <div style="float: left; width: 60%">
          <div style="float: left; width: 50%">Aortic stenosis: ${
            Data.aortic_stenosisObj ? Data.aortic_stenosisObj.Label : ''
          }</div>
          <div style="float: left; width: 50%">
            Aortic regurgitation: ${
              Data.aortic_regurgitationObj ? Data.aortic_regurgitationObj.Label : ''
            }
          </div>
          <div style="float: left; width: 100%;">
          <div style="float: left; width: 50%">Mitral Stenosis: 
            ${
              Data.mitral_stenosisObj
                ? Data.mitral_stenosisObj
                    .map((item) => {
                      return item.Label;
                    })
                    .join(', ')
                : ''
            }
          </div>
          <div style="float: left; width: 50%">Mitral regurgitation: ${
            Data.mitral_regurgitationObj ? Data.mitral_regurgitationObj.Label : ''
          }</div></div>
          <div style="float: left; width: 50%">
            Tricuspid stenosis: ${
              Data.tricuspid_stenosisObj ? Data.tricuspid_stenosisObj.Label : ''
            }
          </div>
          <div style="float: left; width: 50%">
            Tricuspid regurgitation: ${
              Data.tricuspid_regurgitationObj ? Data.tricuspid_regurgitationObj.Label : ''
            }
          </div>
          <div style="float: left; width: 50%">Pulmonary stenosis: ${
            Data.pulmonary_stenosisObj ? Data.pulmonary_stenosisObj.Label : ''
          }</div>
          <div style="float: left; width: 50%">
            Pulmonary regurgitation: ${
              Data.pulmonary_regurgitationObj ? Data.pulmonary_regurgitationObj.Label : ''
            }
          </div>
          <div style="float: left; width: 50%">SPAP (mm Hg): ${Data.spap ? Data.spap : '0'}</div>
          <div style="float: left; width: 50%"></div>
        </div>
        <div style="float: left; width: 100%">
          <div style="float: left; width: 20%">E (m/s): ${Data.e ? Data.e : '0'}</div>
          <div style="float: left; width: 60%">
            <span>A (m/s): ${Data.a ? Data.a : '0'}</span>
            <span style="margin-left: 30px">E/A: ${Data.e_div_a ? Data.e_div_a : '0'}</span>
          </div>
        </div>
        <div style="float: left; width: 40%">
          <div style="float: left; width: 50%">AoPG (mmHg): ${Data.aopg ? Data.aopg : '0'}</div>
          <div style="float: left; width: 50%">PvPG (mmHg): ${Data.pvpg ? Data.pvpg : '0'}</div>
        </div>
        <div style="clear: both"></div>
      </div>
        <div
            style="
                display: inline-block;
                position: relative;
                width: 100%;
                margin-top: 10px;
                margin-bottom: 5px;
            "
        >
            ${
              Data.ExaminationEchoNotation
                ? Data.ExaminationEchoNotation.map((item) => {
                    if (item.vwEchoSectionName.label === 'basal_pos') {
                      return `<div style="position: absolute; top: 128px; left: 37px; font-size: 7px;">${item.LookUpData.map(
                        (item) => {
                          return item.value;
                        }
                      )}</div>`;
                    } else if (item.vwEchoSectionName.label === 'mid_pos') {
                      return `
                <div style="position: absolute; top: 105px; left: 37px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 155px; left: 216px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'apical_lat') {
                      return `<div style="position: absolute; top: 72px; left: 40px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 70px; left: 390px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'apex') {
                      return `<div style="position: absolute; top: 60px; left: 60px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 57px; left: 370px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 56px; left: 510px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'apical_sep') {
                      return `<div style="position: absolute; top: 73px; left: 80px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 67px; left: 357px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'mid_ant_sep') {
                      return `<div style="position: absolute; top: 100px; left: 85px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 88px; left: 208px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'basal_ant_sep') {
                      return `<div style="position: absolute; top: 128px; left: 87px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'mid_sep') {
                      return `<div style="position: absolute; top: 108px; left: 187px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 93px; left: 353px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'mid_inf') {
                      return `<div style="position: absolute; top: 135px; left: 190px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 98px; left: 493px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'mid_lat') {
                      return `<div style="position: absolute; top: 131px; left: 245px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 94px; left: 396px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'mid_ant') {
                      return `<div style="position: absolute; top: 96px; left: 248px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>
                <div style="position: absolute; top: 101px; left: 540px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'basal_lat') {
                      return `<div style="position: absolute; top: 118px; left: 399px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'basal_sep') {
                      return `<div style="position: absolute; top: 123px; left: 351px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'basal_ant') {
                      return `<div style="position: absolute; top: 127px; left: 540px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'apical_ant') {
                      return `<div style="position: absolute; top: 70px; left: 529px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'apical_inf') {
                      return `<div style="position: absolute; top: 69px; left: 495px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    } else if (item.vwEchoSectionName.label === 'basal_inf') {
                      return `<div style="position: absolute; top: 127px; left: 492px; font-size: 7px;">
                    ${item.LookUpData.map((item) => {
                      return item.value;
                    })}
                </div>`;
                    }
                  }).join('')
                : ''
            }

            <img src="${imgSrc}" style="width: 100%;" />
        </div>

      <div style="width: 100%; margin-top: 10px">
        <div>Comment/Suggestive of:</div>
        <div>${Data.comment ? Data.comment : ''}
        </div>
      </div>
    </div>
  </body>
</html>
`;
}

module.exports = ExaminationEcho;
