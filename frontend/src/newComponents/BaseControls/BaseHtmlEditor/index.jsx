import React from "react";
import ReactQuill from "react-quill";

import useInput from "newComponents/BaseControls/useInput";

import "react-quill/dist/quill.snow.css";

/**
 * Rich-text control for the `htmlEditor` field type.
 *
 * This file used to render <HtmlEditor>, <MediaResizing> and <Toolbar> with
 * none of the three defined: the DevExtreme import was commented out during the
 * abandoned migration and only `const Item = () => null` was stubbed back in.
 * It is reachable from BaseControls/BaseField, so the first ModelConfig or
 * TenderFormField asking for a rich-text field would have thrown
 * `ReferenceError: HtmlEditor is not defined` and taken the surrounding tree
 * down. Nothing selected `htmlEditor` yet, which is the only reason it never
 * fired - it was a landmine, not a live fault.
 *
 * Backed by react-quill, which is already a dependency and already used by
 * customComponents/BaseEditControls/BaseRichText.jsx. The toolbar mirrors the
 * set the DevExtreme version declared, minus the table and media-resize tools
 * Quill has no equivalent for.
 */
const TOOLBAR = [
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  ["link", "image"],
  ["blockquote", "code-block"],
  ["clean"],
];

export default ({ valueSelector, config, ...props }) => {
  const { value, changeValue } = useInput({ valueSelector, ...props });

  return (
    <ReactQuill
      theme="snow"
      value={value || ""}
      onChange={(html) => changeValue(html)}
      modules={{ toolbar: TOOLBAR }}
      {...config}
    />
  );
};
