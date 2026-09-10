import { withTranslation } from "react-i18next";
import React, { Component } from "react";
// translation
// @mui/material components
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Box,
} from "@mui/material";
// default components
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
// custom components
import BaseField from "baseComponents/BaseField";
import CalculatorScoreCard from "customComponents/CalculatorScoreCard";
import CalculatorSelect from "customComponents/Forms/Calculators/CalculatorSelect";
// helper
import Helper from "helper";

class Nihss extends Component {
  constructor(props) {
    super(props);
    const { t } = this.props;
    this.state = {
      Alert: null,
      Points: 0,
      Values: [],
      Fields: [
        {
          Name: "loc",
          Label: t("1a. УХАМСАРТ УХААН"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Саруул: мэдрэмжтэй") },
            {
              Value: 1,
              Label: t(
                "Нойрмог дөжирсөн (cомноленци): бага зэргийн эсвэл дуут цочролд сэрж асуултанд хариулах, команд гүйцэтгэх эсвэл хариу урвал үзүүлэх хэмжээний байна",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Ухаан балартсан (ступор): даалгавар гүйцэтгүүлэхийн тулд шалгуурт удаан оролцох ба давтан шаардуулах хэмжээний болон эсвэл хүчтэй өвдөлтийн цочрол шаардана ",
              ),
            },
            {
              Value: 3,
              Label: t(
                "Ухаангүй (ком): зөвхөн хөдөлгөөний автономт рефлексээс бусдаар ямар ч урвал үзүүлэхгүй буюу цаашлаад рефлекс ч үгүй байна",
              ),
            },
          ],
        },
        {
          Name: "que",
          Label: t("1b. УХАМСАРТ УХААН: БАРИМЖАА ТОГТООХ АСУУЛТ (QUE)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("2 асуултанд зөв хариулна") },
            { Value: 1, Label: t("1 асуултанд зөв хариулна") },
            { Value: 2, Label: t("2 асуултанд буруу хариулна") },
          ],
        },
        {
          Name: "com",
          Label: t("1с. УХАМСАРТ УХААН: ДААЛГАВАР БИЕЛҮҮЛЭЛТ (COM)"),
          Type: "RadioBox",
          Desc: "",
          Data: [
            { Value: 0, Label: t("2 даалгаварыг зөв биелүүлнэ") },
            { Value: 1, Label: t("1 даалгаварыг зөв биелүүлнэ") },
            { Value: 2, Label: t("2 даалгаварыг хоёуланг буруу биелүүлнэ") },
          ],
        },
        {
          Name: "gaz",
          Label: t("2. ХАРЦ (GAZ)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн буюу харцны саагүй") },
            {
              Value: 1,
              Label: t(
                "Бүрэн бус саа: харц нь нэг эсвэл хоёр талд хэвийн бус байх ч хүчилсэн харц эсвэл харцны бүрэн саа үгүй",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Бүрэн саа буюу хүчилсэн харцны саатай ба энэ нь окулоцефалик сорилоор илрэхгүй",
              ),
            },
          ],
        },
        {
          Name: "vis",
          Label: t("3. ХАРААНЫ ТАЛБАЙ (VIS)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн буюу хараагүйдэлгүй") },
            { Value: 1, Label: t("Бүрэн бус тал хараагүйдэл") },
            { Value: 2, Label: t("Бүрэн тал хараагүйдэл") },
            {
              Value: 3,
              Label: t(
                "Хоёр талын хараагүйдэл (хараагүй, үүний дотор гадрын хараагүйдэл)",
              ),
            },
          ],
        },
        {
          Name: "fac",
          Label: t("4. НҮҮРНИЙ САА (FAC)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн буюу нүүрний 2 тал тэгш хэмтэй") },
            {
              Value: 1,
              Label: t(
                "Бага зэргийн саа (ХУН тэнийсэн, инээмсэглэхэд тэгш бус хэмт байдал)",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хэсэгчилсэн саа (нүүрний доод хэсгийн бүрэн бус саатай)",
              ),
            },
            {
              Value: 3,
              Label: t(
                "Нэг буюу хоёр талын бүрэн саа (нүүрний дээд болон доод хэсгийн хөдөлгөөн бүрэн алга болсон)",
              ),
            },
          ],
        },
        {
          Name: "mul",
          Label: t("5a. ГАРЫН ХӨДӨЛГӨӨН (Зүүн гар)"),
          Desc: "",
          Data: [
            {
              Value: 0,
              Label: t(
                "Хэвийн буюу гар 90 (эсвэл 45) хэмийн өнцөгт 10 хормын турш унахгүй",
              ),
            },
            {
              Value: 1,
              Label: t(
                "Гараа өргөх боловч 10 хором хүрэхээс өмнө буух хэдий ч буух үед ор болон бусад зүйлийг цохихгүй",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадах ч гар 90 (эсвэл 45) хэмийн өнцөгт барьж чадахгүй бууж бага зэргийн эсэргүүцэлтэй орон дээр унана",
              ),
            },
            {
              Value: 3,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадалгүй гар орон дээр шууд унана",
              ),
            },
            {
              Value: 4,
              Label: t(
                "Ямар ч хөдөлгөөнгүй UN = Тайрагдсан мөч эсвэл мөрний үений наалдангитай",
              ),
            },
          ],
        },
        {
          Name: "mur",
          Label: t("5b. ГАРЫН ХӨДӨЛГӨӨН (Баруун гар)"),
          Desc: "",
          Data: [
            {
              Value: 0,
              Label: t(
                "Хэвийн буюу гар 90 (эсвэл 45) хэмийн өнцөгт 10 хормын турш унахгүй",
              ),
            },
            {
              Value: 1,
              Label: t(
                "Гараа өргөх боловч 10 хором хүрэхээс өмнө буух хэдий ч буух үед ор болон бусад зүйлийг цохихгүй",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадах ч гар 90 (эсвэл 45) хэмийн өнцөгт барьж чадахгүй бууж бага зэргийн эсэргүүцэлтэй орон дээр унана",
              ),
            },
            {
              Value: 3,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадалгүй гар орон дээр шууд унана",
              ),
            },
            {
              Value: 4,
              Label: t(
                "Ямар ч хөдөлгөөнгүй UN = Тайрагдсан мөч эсвэл мөрний үений наалдангитай",
              ),
            },
          ],
        },
        {
          Name: "mll",
          Label: t("6a. ХӨЛИЙН ХӨДӨЛГӨӨН (Зүүн хөл)"),
          Desc: "",
          Data: [
            {
              Value: 0,
              Label: t(
                "Хэвийн буюу хөл 30 хэмийн өнцөгт 5 хормын турш унахгүй",
              ),
            },
            {
              Value: 1,
              Label: t(
                "Хөл 5 хормын төгсгөлд унах ч буух үед ор болон бусад зүйлийг цохихгүй",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадах ч 5 хормын дотор орон дээр бага зэргийн эсэргүүцэлтэй  унана",
              ),
            },
            {
              Value: 3,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадалгүй хөл орон дээр шууд унана",
              ),
            },
            {
              Value: 4,
              Label: t(
                "Ямар ч хөдөлгөөнгүй UN = Тайрагдсан мөч эсвэл мөрний үений наалдангитай",
              ),
            },
          ],
        },
        {
          Name: "mlr",
          Label: t("6b. ХӨЛИЙН ХӨДӨЛГӨӨН (Баруун хөл)"),
          Desc: "",
          Data: [
            {
              Value: 0,
              Label: t(
                "Хэвийн буюу гар 90 (эсвэл 45) хэмийн өнцөгт 10 хормын турш унахгүй",
              ),
            },
            {
              Value: 1,
              Label: t(
                "Гараа өргөх боловч 10 хором хүрэхээс өмнө буух хэдий ч буух үед ор болон бусад зүйлийг цохихгүй",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадах ч гар 90 (эсвэл 45) хэмийн өнцөгт барьж чадахгүй бууж бага зэргийн эсэргүүцэлтэй орон дээр унана",
              ),
            },
            {
              Value: 3,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадалгүй гар орон дээр шууд унана",
              ),
            },
            {
              Value: 4,
              Label: t(
                "Хүндийн хүчийг эсэргүүцэж чадалгүй гар орон дээр шууд унана",
              ),
            },
          ],
        },
        {
          Name: "ata",
          Label: t("7. МӨЧДИЙН ТЭНЦВЭРГҮЙДЭЛ (ATA)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн буюу тэнцвэргүйдэлгүй") },
            { Value: 1, Label: t("Нэг мөчид тэнцвэргүйдэл") },
            { Value: 2, Label: t("Хоёр мөчид тэнцвэргүйдэл") },
          ],
        },
        {
          Name: "sen",
          Label: t("8. МЭДРЭХҮЙ (SEN)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн") },
            {
              Value: 1,
              Label: t(
                "Мэдрэхүйн хөнгөн болон дунд зэргийн алдагдал: зүүний цочролыг мэдрэх ч хурц мохоог огт ялгаж чадахгүй буюу ерөнхийд нь хүрэлцэх мэдрэхүй мэдрэнэ",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Мэдрэхүйн хүнд зэргийн буюу бүрэн алдагдал: өвчтөн гар, нүүр болон хөлд хүрч буйг огт мэдэхгүй",
              ),
            },
          ],
        },
        {
          Name: "lan",
          Label: t("9. ХЭЛГҮЙДЭЛ (LAN)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн буюу хэлний өөрчлөлтгүй") },
            {
              Value: 1,
              Label: t(
                "Хөнгөн болон дунд зэргийн хэлгүйдэл: ойлгомж муутай ч өвчтөний оролдлогоос ойлгогдоно",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хүнд зэргийн хэлгүйдэл: өвчтөний яриа тасалдана, өвчтөний оролдлогоос ойлгогдохгүй",
              ),
            },
            {
              Value: 3,
              Label: t(
                "Бүрэн хэлгүйдэл буюу ярьж чадахгүй, ойлгохгүй. Ямар ч даалгавар гүйцэтгэх боломжгүй",
              ),
            },
          ],
        },
        {
          Name: "dys",
          Label: t("10. ДУЛЬТРАЛ (DYS)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн буюу дультрал байхгүй") },
            {
              Value: 1,
              Label: t(
                "Хөнгөн-дунд зэргийн дультрал: дультран ярих ч ойлгогдоно",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хүнд зэргийн дультрал: ойлгогдохгүй ярина. Дисфази эсвэл хэлгүйгээс бусад байдалд ямар ч ойлгомжгүй байна",
              ),
            },
          ],
        },
        {
          Name: "ext",
          Label: t("11. АНХААРАЛ, МЭДРЭМЖ (EXT)"),
          Desc: "",
          Data: [
            { Value: 0, Label: t("Хэвийн буюу бүх асуултанд зөв хариулна") },
            {
              Value: 1,
              Label: t(
                "Хагас буурсан: харах, хүрэлцэх, сонсох, орон зайн эсвэл хувь хүний баримжаа зэрэг мэдрэхүйг нэгэн зэрэг  шалгахад аль нэгний анхаарал буюу мэдрэмж алдагдах буюу буурна",
              ),
            },
            {
              Value: 2,
              Label: t(
                "Хүнд зэргээр буюу бүрэн буурсан: 2 буюу түүнээс дээш мэдрэхүйн анхаарал буюу мэдрэмж илэрхий алдагдах буюу байхгүй (тухайлбал alien hand syndrome- ын үед)",
              ),
            },
          ],
        },
      ],
    };
    this.LogedUser = Helper.AuthHelper.GetLogedUserLocal();
  }

  Save = async (callback) => {
    const t = this.props.t;
    const { PatientId } = this.props;
    const { Values } = this.state;

    let alert = null;
    let Point = 0;
    Values.forEach((element) => {
      Point += parseInt(element.Point);
    });
    if (Point > 0) {
      await Helper.BaseCrudHelper.BaseCreate(
        {
          ObjectName: "Calculator",
          Data: {
            patient_id: PatientId,
            score: Point,
            calculator: "NIHSS",
            user_id: this.LogedUser.Id,
          },
        },
        (resData) => {
          if (resData) {
            alert = Helper.BaseCrudHelper.ShowAlert(
              resData.Message,
              resData.Success,
              () => {
                this.setState({ Alert: null });
                callback && callback(resData.Success);
              },
            );
            this.setState({ Alert: alert });
          }
        },
      );
    } else {
      alert = Helper.BaseCrudHelper.ShowAlert(
        "Оноо 0-с дээш байх ёстой.",
        false,
        () => this.setState({ Alert: null }),
      );
      this.setState({ Alert: alert });
    }
  };

  SetValue = (Value, Point) => {
    const { Values } = this.state;
    var NewValues = Values;
    NewValues = NewValues.filter((s) => s.Value !== Value);
    NewValues.push({ Value, Point: Point });
    // if (temp.length === 1) {
    //   NewValues.splice(Values.indexOf(Value), 1)

    //   this.setState({ Values: NewValues, Points: Points - Point })
    // } else {
    //   NewValues.push(Value)
    //   this.setState({ Values: NewValues, Points: Points + Point })
    // }
    this.setState({ Values: NewValues });
  };

  GetSelected = (Value) => {
    const { Values } = this.state;
    return Values.filter((s) => s.Value + "" === Value + "").length > 0;
  };

  GetPoint = () => {
    const { Values } = this.state;
    var Point = 0;
    Values.forEach((element) => {
      Point += parseInt(element.Point);
    });
    return Point;
  };

  DrawChoices() {
    const { Fields } = this.state;
    let questions = [];
    Array.isArray(Fields) &&
      Fields.map((Field, qindex) => {
        questions.push(
          <CalculatorSelect
            key={qindex}
            label={Field.Label}
            name={Field.Name}
            options={Field.Data}
            onChange={this.SetValue}
            width="40%"
            config={{ IdField: "Value", TextField: "Label" }}
          />,
        );
      });
    return questions;
  }

  render() {
    const { Alert } = this.state;
    const { t } = this.props;

    return (
      <div>
        {Alert}
        <GridContainer style={{ margin: "0", width: "100%" }}>
          <GridItem xs={12} md={9}>
            <List style={{ paddingTop: "0", paddingBottom: "0" }} dense>
              <CalculatorSelect
                label="Sex"
                name="Sex"
                onChange={this.SetValue}
                options={[
                  { Id: "0", Name: "Male (0 point)" },
                  { Id: "1", Name: "Female (1 point)" },
                ]}
              />
              {this.DrawChoices()}
            </List>
          </GridItem>
          <GridItem xs={12} md={3}>
            <CalculatorScoreCard points={this.GetPoint()} />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withTranslation(undefined, { withRef: true })(Nihss);
