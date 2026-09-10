function PacemakerTwo(Data) {
  var Risks = '';
  Data.risksObj
    ? Data.risksObj.map((risk, key) => {
        Risks += `<div style="font-size: 8px;  margin-bottom: 3px; width: 100%; ">
                              ${risk.Label}
                            </div>`;
      })
    : '';

  var Diffs = '';
  Data.diffsObj
    ? Data.diffsObj.map((diff, key) => {
        Diffs += `<div style="font-size: 8px; margin-bottom: 3px; width: 100%; ">
                    ${diff.Label}
                </div>`;
      })
    : '';

  return `<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width">
    <style>
        .list {
            padding-left: 30px;
            list-style: none;
        }
        .list > li {
            margin: 0;
            margin-bottom: 1em;
            padding-left: 1.5em;
            position: relative;
            width: calc(100% - 95px - 1.5em);
        }
        .list > li::after {
            content: '';
            height: 3px;
            width: 3px;
            background-color: #000;
            display: block;
            position: absolute;
            -webkit-transform: rotate(45deg);
            top: 8px;
            left: 0;
        }
    </style>
  </head>
  <body style="margin: 0 auto; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 9px;">
    <div style="
          padding: 0 15px 0 80px;
          font-weight: normal;
          width: 580px;
          "
    >
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 5px;
        "
        >
          <div style="float: left;">
            Өвчний түүхийн дугаар: 
            <span style="font-style: italic;">${
              Data.pat_history_id ? Data.pat_history_id : ''
            }</span>
          </div>
          <div style="float: right;">
            Тасаг: 
            <span style="font-style: italic;">${Data.department ? Data.department : ''}</span>
          </div>
        </div>
        <div style=" width: calc(100% - 95px); text-align: center; ">
        <h5
            style="
            font-size: 12px;
            font-weight: 400;
            padding: 0 10%;
            margin: 5px 0;
            "
        >
            БАЙНГЫН ПЕЙСМЕЙКЕР СУУЛГАХ ЭМЧИЛГЭЭ ХИЙЛГЭХ ТУХАЙ ЗӨВШӨӨРЛИЙН ХУУДАС
        </h5>
        </div>

        <div style=" width: calc(100% - 95px); margin-bottom: 5px; ">
        <div>
            (Иргэний түүх/иргэний эрүүл мэндийн дэвтэрт хавсаргана)
        </div>
        </div>
        <div style=" width: calc(100% - 95px) ">
        <h5 style=" font-size: 16px; font-weight: 400; margin: 5px 0 0; text-decoration: underline; ">
            А/ МЭДЭЭЛЛИЙН ХУУДАС
        </h5>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div>Санал болгож буй эмчилгээний нэр:</div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.treatment_name ? Data.treatment_name : ''
        }</div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div>
            Санал болгож буй эмчилгээний үр дүн (эмнэл зүйн туршлагын дүн;
            нотолгоонд тулгуурлан тулгуурлан бүрэн эдгэрэлт; сайжралт;
            эндэгдэл; хүндрэлийн магадлалыг хувиар илэрхийлэн
            ойлгомжтойгоор тайлбарлана):
        </div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.treatment_result ? Data.treatment_result : ''
        }</div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div style=" width: calc(100% - 95px); margin-bottom: 5px ">
            Гарч болох эрсдэлүүд (эрсдэлүүдийг нэг бүрчлэн дурьдана):
        </div>
                <div
                    style="
                    width: 100%;
                    margin-left: 12px;
                    font-style: italic;
                    font-weight: 100;
                    "
                >
                    ${Risks}
                </div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div style=" width: calc(100% - 95px); margin-bottom: 5px ">
            Гарч болох хүндрэлүүд (хүндрэлүүдийг нэг бүрчлэн дурьдана):
        </div>
                <div
                    style="
                    width: 100%;
                    margin-left: 12px;
                    font-style: italic;
                    font-weight: 100;
                    "
                >
                    ${Diffs}
                </div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div>
            Тухайн эмчилгээний үед хийгдэж болох нэмэлт ажилбарууд
            (ажилбаруудыг нэг бүрчлэн дурьдана):
        </div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.possible_adds ? Data.possible_adds : ''
        }</div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div>
            Тухайн эмчилгээг орлуулж болох эмчилгээний бусад аргууд (бусад
            аргуудыг дурьдана):
        </div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.possible_other ? Data.possible_other : ''
        }</div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div>Санал болгож буй эмчилгээний давуу тал:</div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.advantage ? Data.advantage : ''
        }</div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  width: calc(100% - 95px); margin-bottom: 10px; ">
        <div>
            Санал болгож буй эмчилгээний үед хийгдэх мэдээгүйжүүлэлт:
        </div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.anesthesia ? Data.anesthesia : ''
        }</div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div>Үйлчлүүлэгчээс тавьсан асуулт: </div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.qfrom_pat ? Data.qfrom_pat : ''
        }</div>
        </div>
        <div style=" display: inline-block; width: calc(100% - 95px);  margin-bottom: 10px; ">
        <div>Дээрх асуултын хариулт (товч): </div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.afrom_pat ? Data.afrom_pat : ''
        }</div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div style="font-style: italic; font-weight: 100;">Эмчтэй холбоо барих утас: <span style="font-style: italic; font-weight: 100;">${
          Data.doc_phone ? Data.doc_phone : ''
        }</span></div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>
            Би үйлчлүүлэгчдээ дээрх мэдээллүүдийг дэлгэрэнгүй; энгийн
            ойлгомжтой хэллэгээр тайлбарлаж өгсөн болно.
        </div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
            <div>
                Эмчийн гарын үсэг:
                <span style="font-style: italic; font-weight: 100;">${
                  Data.doc_nameObj ? Data.doc_nameObj.Label : ''
                }</span>
            </div>
        </div>
        <div style="page-break-before:always">&nbsp;</div> 
        <div style=" width: calc(100% - 95px);">
            <h5 style=" font-size: 16px; font-weight: 400; margin: 5px 0 0; text-decoration: underline; ">
                Б/ ҮЙЛЧЛҮҮЛЭГЧИЙН ЗӨВШӨӨРӨЛ:
            </h5>
        </div>
        <div>
        <ul class="list">
            <li>
            Эмчийн санал болгож буй мэс ажилбарыг дээрх мэдээ
            алдуулалтаар хийлгэхийг БИ ЗӨВШӨӨРЧ БАЙНА. Түүнчлэн гэмтсэн
            эд; эрхтэний хэсэг болон эд эрхтэнийг журмын дагуу устгахыг
            тус эмнэлэгт зөвшөөрч байна.
            </li>
            <li>
            Мэс ажилбарын үр дүн; гарч болох хүндрэл; эрсдэл; нэмэлт
            ажилбарууд; орлуулж болох эмчилгээний талаар БИ ТОДОРХОЙ
            МЭДЭЭЛЭЛ АВСАН БОЛНО.
            </li>
        </ul>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>Үйлчлүүлэгчийн гарын үсэг: <span style="font-style: italic; font-weight: 100;">${
          Data.pat_name ? Data.pat_name : ''
        }</span></div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>Үйлчлүүлэгч гарын үсэг зурах эрх зүйн чадамжгүй бол: </div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>
            Асран хамгаалагч/харгалзан дэмжигчийн гарын үсэг:
            <span style="font-style: italic; font-weight: 100;">${
              Data.guardian_name ? Data.guardian_name : ''
            }</span>
        </div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>Үйлчлүүлэгчтэй холбоотой эсэх: <span style="font-style: italic; font-weight: 100;">${
          Data.guardian_rel ? Data.guardian_rel : ''
        }</span></div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>Үйлчлүүлэгч эрх зүйн чадамжгүй байгаа шалтгаан:</div>
        <!--  -->
        <div>[ ${Data.outlawed_reason === '1' ? '✓' : ''} ] Насанд хүрээгүй </div>
        <div>[  ${Data.outlawed_reason === '2' ? '✓' : ''} ] Ухаангүй </div>
        <div>[  ${Data.outlawed_reason === '3' ? '✓' : ''} ] Сэтгэцийн эмгэгтэй </div>
        <div>
            [  ${Data.outlawed_reason === 'other' ? '✓' : ''} ] Бусад (тайлбарлана уу)
            ${
              Data.outlawed_reason === 'other'
                ? Data.otherOutlawedReason
                : '...................................................'
            }
        </div>
        </div>
    
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <span style=" fontStyle: "italic" ">
            Хэрэв өвчтөн жирэмсэн тохиолдолд:
        </span>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>
            Миний эхнэрийн хийлгэхээр зөвшөөрсөн эмчилгээг би зөвшөөрч
            байна.
        </div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>Нөхрийн гарын үсэг: <span style="font-style: italic; font-weight: 100;">${
          Data.husband_name ? Data.husband_name : ''
        }</span></div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>
            Хэрэв нөхөр (асран хамгаалагч/харгалзан дэмжигч) нь
            зөвшөөрөхгүй бол тайлбарлана уу.
        </div>
        <div style="font-style: italic; font-weight: 100;">${
          Data.reject_reason ? Data.reject_reason : ''
        }</div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
        "
        >
        <div>
            Энэхүү зөвшөөрлийн хуудасны загварыг 2 хувь үйлдсэн болно.
        </div>
        </div>
        <div
        style="
            display: inline-block; 
            width: calc(100% - 95px);
            margin-bottom: 10px;;
            text-align: center;
        "
        >
        <div>Огноо: ….... он ….. сар ….. өдөр</div>
        </div>
    
    </div>
  </body>
</html>
`;
}

module.exports = PacemakerTwo;
