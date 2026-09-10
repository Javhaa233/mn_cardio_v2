const EPSAblationStyles = {
  main: {
    margin: "0 auto",
    width: "210mm",
    height: "297mm",
    overflow: "hidden",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  body: {
    margin: "0 auto",
    padding: "25px",
    fontSize: "12px",
    fontWeight: "400",
    width: "210mm",
    minHeight: "297mm",
    "& div": { float: "left", display: "inline-block", width: "100%" },
  },
  header: {
    width: "100%",
    textAlign: "center",
    border: "2px solid #333",
    padding: "2px",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "0",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    border: "1px solid #000",
    borderCollapse: "collapse",
    "& th": {
      backgroundColor: "#000",
      textAlign: "center",
      border: "1px solid #000",
    },
    "& td": { border: "1px solid #000" },
  },
  tableHeader: {
    color: "#FFF",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "2px",
    marginBottom: "2px",
  },
  tdDiv: { padding: "2px" },
};

export default EPSAblationStyles;
