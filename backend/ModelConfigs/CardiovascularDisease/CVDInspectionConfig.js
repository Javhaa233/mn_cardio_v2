const { Models } = require('../../config/DB');
const Model = Models.vwCVDInspection;

function CVDInspectionConfig() {
    this.Fields = [
        [
            { Name: 'Id', Label: 'Id', Type: 'Text' },
            { Name: 'MonitoringId', Label: 'CVDMonitoring Id', Type: 'Number' },
            { Name: 'Score', Label: 'Эрсдлийн хувь', Type: 'Number' },
            { Name: 'Risk', Label: 'Эрсдлийн түвшин', Type: 'Number' },
            { Name: 'DoctorAdvice', Label: 'Өгсөн зөвлөгөө', Type: 'TextArea' },

            { Name: 'CreateDate', Label: 'Created Date', Type: 'Date' },
            {
                Name: 'CreateUserId',
                Label: 'Create user',
                Type: 'SingelSelect',
                Config: { Model: Models.Users, IdField: 'Id', TextField: 'UserName' },
            },
        ],
    ];

    this.ObjectName = 'CVDInspection';
    this.Model = Model;
    this.OptionTypes = Models.OptionTypes;
    this.PK = 'Id';
    this.NewObject = {};
    this.TitleObject = { Title: 'ЗСЭЭ хяналтын үзлэг' };
}

module.exports = CVDInspectionConfig;
