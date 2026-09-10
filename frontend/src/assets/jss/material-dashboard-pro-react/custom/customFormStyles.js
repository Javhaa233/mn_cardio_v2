const customFormStyles = {
  oneHeader: {
    display: "inline-block",
    paddingBottom: "-20px",
    borderBottom: "2px solid #ccc",
    "& > h2": {
      fontSize: "20px",
      textTransform: "uppercase",
      lineHeight: "0.5",
    },
  },
  borderDiv: {
    position: "relative",
    padding: "20px 10px 10px",
    border: "1px solid #ccc",
    margin: "25px 0 10px",
    backgroundColor: "#fafafa",
  },
  divHeader: {
    position: "absolute",
    top: "-25px",
    left: "10px",
    padding: "2px 10px",
    border: "1px solid #ccc",
    backgroundColor: "#FFF",
    fontWeight: "500",
    color: "#f54242",
  },
  borderSubDiv: {
    position: "relative",
    padding: "30px 10px 10px",
    border: "1px solid #ccc",
    margin: "38px 0",
    backgroundColor: "#fafafa",
  },
  divSubHeader: {
    position: "absolute",
    top: "-25px",
    left: "15px",
    padding: "0 10px",
    backgroundColor: "#FFF",
    border: "1px solid #ccc",
    color: "#3C4858",
    textDecoration: "none",
    fontSize: "18px",
  },
  childDiv: {
    position: "relative",
    padding: "10px",
    border: "1px solid #ccc",
    margin: "10px",
    backgroundColor: "#f5f5f5",
  },

  labelHorizontal: {
    color: "#75736c",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "14px",
    lineHeight: "1.428571429",
    fontWeight: "400",
    paddingTop: "15px",
    marginRight: "0",
    textAlign: "right",
    "@media (min-width: 992px)": { float: "right" },
  },

  customList: {
    fontWeight: 500,
    fontSize: "1.2em",
    padding: "15px",
    margin: "15px",
    border: "2px solid #003fd4",
    "& > ul": { margin: 0, padding: "0 15px" },
    "& > ul > li": { color: "#003fd4" },
  },

  customTable: {
    border: "1px solid #949494",
    borderCollapse: "collapse",
    backgroundColor: "#f5f5f5",
    fontSize: "12px",

    /**
     * A width FLOOR, below `md` only.
     *
     * These tables are the matrix-shaped sections of the registry forms - NYHA
     * class, symptom grids - authored at `width: 100%` with no minimum. So they
     * never overflowed; they COMPRESSED, until a radio group inside a cell was
     * a few characters wide. Nothing looked broken, and the layout shell's
     * `overflowX: hidden` hid the evidence that anything was wrong.
     *
     * With a floor the table overflows honestly, and `GroupPanel` - the section
     * box every one of these sits inside - scrolls it. The scrolling belongs
     * there rather than here: a table cannot scroll itself without
     * `display: block`, which splits thead from tbody into separate anonymous
     * tables and breaks column alignment between them.
     *
     * Untouched at `md` and up, so desktop rendering does not move.
     */
    "@media (max-width: 959.95px)": {
      minWidth: "560px",
    },
    "& > thead > tr": { border: "1px solid #949494" },
    "& > tbody > tr": { border: "1px solid #949494" },
    "& > tbody > tr > td": { padding: "2px 4px", border: "1px solid #949494" },
    "& > tbody > tr > th": { padding: "2px 4px", border: "1px solid #949494" },
    "& > thead > tr > th": { padding: "2px 4px", border: "1px solid #949494" },
  },
};

export default customFormStyles;
