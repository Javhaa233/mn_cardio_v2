import React from "react";
import { styled } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const StyledTable = styled(Table)(({ theme }) => ({
  "& .MuiTableCell-root": {
    fontSize: "12px",
    padding: "2px 4px",
  },
}));

const StyledTableCell = styled(TableCell)(() => ({
  head: {
    backgroundColor: "#002060",
    color: "#FFF",
    padding: "2px 4px",
    textAlign: "center",
    lineHeight: "13px",
  },
  body: { fontSize: 14 },
}));

export default function SurgeryTable() {
  return (
    <div
      style={{
        float: "left",
        // width: "50%",
        padding: "10px",
        width: "455px",
        minHeight: "645px",
        // width: "calc(297mm/2)",
        // minHeight: "210mm",
      }}
    >
      <div style={{ width: "100%", marginBottom: "10px" }}>
        <div
          style={{ fontSize: "11px", fontWeight: "500", textAlign: "center" }}
        >
          ШУГТЭ, Зүрх судасны төв, Хавхлагын баг
        </div>
        <div style={{ width: "100%", textAlign: "center" }}>
          <h5 style={{ fontSize: "13px", fontWeight: "500", margin: "3px 0" }}>
            Мэс заслын өмнө бүрдүүлэх шинжилгээнүүд
          </h5>
        </div>
        <div style={{ fontSize: "11px", fontWeight: "400" }}>
          <div>Овог нэр нас: __________________________</div>
          <div>Онош: _______________________</div>
          <div>Огноо: _______________________</div>
        </div>
      </div>
      <TableContainer>
        <StyledTable>
          <TableHead>
            <TableRow>
              <StyledTableCell>№</StyledTableCell>
              <StyledTableCell>Шинжилгээ</StyledTableCell>
              <StyledTableCell style={{ minWidth: "170px" }}>
                Хийлгэсэн эсэх
                <br />
                (ТИЙМ / ҮГҮЙ)
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>
                Цусны дэлгэрэнгүй шинжилгээ <br />
                <span style={{ fontSize: "14px", fontStyle: "italic" }}>
                  /Мэс заслын зөвлөгөөнөөс өмнө 14 хоногийн дотор хийлгэсэн
                  байх/
                </span>
              </TableCell>
              <TableCell style={{ textAlign: "center" }}>
                <span style={{ color: "green", fontSize: "18px" }}>✔</span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>
                Биохими <br />
                <span style={{ fontSize: "14px", fontStyle: "italic" }}>
                  /Элэг, бөөрний ү/а, кали, нийт уураг, альбумин, нийт
                  билирубин, сахар/
                </span>
              </TableCell>
              <TableCell style={{ textAlign: "center" }}>
                <span style={{ color: "red", fontSize: "18px" }}>✘</span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3</TableCell>
              <TableCell>Цус бүлэгнэлт + INR</TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>4</TableCell>
              <TableCell>
                Вирүсийн маркер
                <br />
                <span style={{ fontSize: "14px", fontStyle: "italic" }}>
                  /ХДХВ, HBV, HCV, Тэмбүү/
                </span>
              </TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5</TableCell>
              <TableCell>Зүрхний цахилгаан бичлэг</TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>6</TableCell>
              <TableCell>Зүрхний эхо /3-р эмнэлэгт хийлгэсэн/</TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>7</TableCell>
              <TableCell>Спирометр /амьсгалын багтаамжны сорил/</TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>8</TableCell>
              <TableCell>
                Цээжний рентген том зураг
                <br />
                <span style={{ fontSize: "14px", fontStyle: "italic" }}>
                  /Зураг дээр Кардиоторакальны индекс тодорхойлуулсан байх/
                </span>
              </TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>9</TableCell>
              <TableCell>Хэвлийн эхо</TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>10</TableCell>
              <TableCell>
                Титэм судсан дотуурх оношилгоо <br />
                <span style={{ fontSize: "14px", fontStyle: "italic" }}>
                  /40-өөс дээш насны эрэгтэй, Цэвэршсэн эмэгтэй/
                </span>
              </TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>11</TableCell>
              <TableCell>
                Гол судас өргөссөн, тэлэгдсэн бол Гол судасны Компьютерт
                томографи
              </TableCell>
              <TableCell style={{ textAlign: "center" }}></TableCell>
            </TableRow>
          </TableBody>
        </StyledTable>
      </TableContainer>
    </div>
  );
}
