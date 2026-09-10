// DevExtreme stub components (package not installed)
// DevExtreme stub components (package not installed) - rendering children to avoid empty forms
const Item = ({
  children,
  label,
  isRequired,
  valueExpr,
  displayExpr,
  colSpan,
  ...props
}) => (
  <div
    className="form-item"
    {...props}
    style={{
      padding: "4px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}
  >
    {label && (
      <label style={{ minWidth: "80px", marginBottom: 0 }}>{label.text}</label>
    )}
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);
const GroupItem = ({ children, caption, colCount, colSpan, ...props }) => (
  <div
    className="group-item"
    {...props}
    style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}
  >
    {caption && <h5>{caption}</h5>}
    {children}
  </div>
);
const TabbedItem = ({ children }) => (
  <div className="tabbed-item">{children}</div>
);
const Tab = ({ children, title }) => (
  <div className="tab-item" title={title}>
    <h6>{title}</h6>
    {children}
  </div>
);
const EmptyItem = ({ children, colSpan }) => <div className="empty-item"></div>;

import React from "react";
// translation
import { useTranslation } from "react-i18next";
import FormLabel from "@mui/material/FormLabel";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";

// TODO: DevExtreme not installed
// import {
//   Item,
//   EmptyItem,
//   GroupItem,
//   Tab,
//   TabbedItem
// } from "devextreme-react/form";
import BaseField from "newComponents/BaseControls/BaseField";

/* ================= PARSE STRING PATTERN ================= */

const parseLayoutPattern = (pattern) => {
  if (!pattern || typeof pattern !== "string") return null;

  const lines = pattern
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const steps = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // stack: lines starting with |
    if (line.startsWith("|")) {
      let count = 0;
      while (lines[i]?.startsWith("|")) {
        count++;
        i++;
      }
      steps.push({ type: "stack", count });
      continue;
    }

    // Check if this is a row followed by stack lines (e.g., "1 | 2" followed by "| 3")
    // This means: field 1 on left spanning height, fields 2,3,4,... stacked on right
    if (line.includes("|")) {
      const colCount = line.split("|").length;

      // Look ahead to see if next lines start with |
      let stackCount = 0;
      let j = i + 1;
      while (lines[j]?.startsWith("|")) {
        stackCount++;
        j++;
      }

      if (stackCount > 0 && colCount === 2) {
        // This is a "row + stack" pattern: combine into a stack
        // Total right side fields = 1 (from the row) + stackCount
        steps.push({
          type: "stack",
          count: 1 + stackCount, // First field on left, rest on right
          leftCount: 1, // How many fields for left side
        });
        i = j; // Skip past all the stack lines
        continue;
      }

      // Regular row
      steps.push({
        type: "row",
        count: colCount,
      });
      i++;
      continue;
    }

    // full
    steps.push({ type: "full" });
    i++;
  }

  return steps;
};

const BorderedItem = ({
  children,
  label,
  isRequired,
  colSpan,
  t,
  ...props
}) => {
  const borderColor = "#eee";
  const labelHorizontalSx = {
    color: "#75736c",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "1",
    margin: 0,
    padding: 0,
    textAlign: "left",
  };

  return (
    <GridContainer
      sx={{
        width: "100%",
        margin: 0,
        marginBottom: "5px",
        border: `1px solid ${borderColor}`,
        borderBottom: "1px solid #eee",
        borderRadius: "0px",
        marginTop: "-1px",
        alignItems: "stretch",
        backgroundColor: "#fff",
        transition: "border-color 0.15s ease-in-out",
        minHeight: "32px",
        "&:hover": {
          borderColor: borderColor,
        },
        "&:focus-within": {
          borderColor: borderColor,
        },
      }}
    >
      {label && (
        <GridItem
          xs={12}
          sm={4}
          md={4}
          sx={{
            backgroundColor: "#eff9fe",
            borderRight: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            paddingLeft: "10px",
            paddingRight: "15px",
            minHeight: "32px",
          }}
        >
          <FormLabel sx={labelHorizontalSx}>
            {label.text + (isRequired ? " *" : "")}
          </FormLabel>
        </GridItem>
      )}

      <GridItem
        xs={12}
        sm={label ? 8 : 12}
        md={label ? 8 : 12}
        sx={{
          display: "flex",
          alignItems: "center",
          p: 0,
          backgroundColor: "#fff",
          minHeight: "32px",
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: 0,
          },
        }}
      >
        <div style={{ width: "100%", padding: "0 5px" }}>{children}</div>
      </GridItem>
    </GridContainer>
  );
};

export default ({
  store,
  config,
  formName,
  setFieldValue,
  setValidate,
  validationRules,
  onChangedValue,
  ...props
}) => {
  const { t } = useTranslation();

  const getFieldProps = (fieldName, options) => {
    return {
      changeValue: (value, name) => {
        setFieldValue({ fieldName, value });
        if (onChangedValue) {
          onChangedValue({ fieldName, value });
        }
      },
      setValidate: ({ fieldName, validate }) => {
        setValidate && setValidate({ fieldName, validate });
      },
      name: fieldName,
      validationRules:
        validationRules && validationRules[fieldName]
          ? validationRules[fieldName]
          : [],
      selector: {
        value: `form.${formName}.editData.${fieldName}`,
        dataSource: `form.${formName}.fields.${fieldName}.dataSource`,
        loading: `form.${formName}.fields.${fieldName}.loading`,
        state: `form.${formName}.fields.${fieldName}`,
      },
      store,
    };
  };

  const validate = async (fields) => {
    const result = [];
    let errorMessages = [];
    for (let i = 0; i < Object.keys(fields).length; i++) {
      const field = fields[Object.keys(fields)[i]];
      if (field && field.validate && typeof field.validate === "function") {
        const vResult = await field.validate();
        if (!vResult) {
          continue;
        }
        if (vResult.isValid === false) {
          result.push(vResult);
          errorMessages = [...errorMessages, ...vResult.brokenRules];
        }
      }
    }
    return {
      isValid: result.length === 0,
      result,
      errorMessages,
    };
  };

  const getEditorConfig = (field) => {
    const result = {
      editorConfig: {},
      editorType: null,
      EditorComponent: field.EditorComponent,
    };
    if (field.editor && typeof field.editor === "string") {
      result.editorType = field.editor;
    } else if (
      field.editor &&
      typeof field.editor === "object" &&
      Object.keys(field.editor).length > 0
    ) {
      result.editorType = Object.keys(field.editor)[0];
      result.editorConfig = field.editor[result.editorType];
    }
    return result;
  };

  const renderField = ({ fieldName, field, item, configOverride = {} }) => {
    const fieldProps = getFieldProps(fieldName);
    let layItemConfig = {};
    let colSpan = 1;

    // Handle string item configuration (old way: "f|Name|2")
    if (item && typeof item === "string") {
      const arr = item.split("|");
      const layEditorConfigArr = arr[3] ? arr[3].split(",") : [];
      layItemConfig = {
        isRequired: layEditorConfigArr.includes("*") ?? undefined,
      };
      const layEditorConfig = {
        readOnly: layEditorConfigArr.includes("ro") ?? undefined,
      };

      // Merge layout config into editor config
      const { editorConfig } = getEditorConfig(field);
      if (editorConfig && editorConfig.config) {
        editorConfig.config = {
          ...editorConfig.config,
          ...layEditorConfig,
        };
      } else if (editorConfig) {
        editorConfig.config = layEditorConfig;
      }

      colSpan = arr[2] ? Number(arr[2]) : 1;
    }

    const { editorType, editorConfig, EditorComponent } =
      getEditorConfig(field);

    let isRequired =
      fieldProps &&
      Array.isArray(fieldProps.validationRules) &&
      fieldProps.validationRules.find((s) => s.type === "required");

    if (!layItemConfig.isRequired && isRequired) {
      layItemConfig.isRequired = true;
    }

    // Merge override config
    if (configOverride) {
      Object.assign(layItemConfig, configOverride);
    }

    const baseField = (
      <BaseField
        editor={editorType}
        EditorComponent={EditorComponent}
        {...fieldProps}
        {...editorConfig}
      />
    );

    // If item is string (old layout), wrap in Item
    if (item && typeof item === "string") {
      if (props.useBorderedLayout) {
        return (
          <BorderedItem
            key={"key-" + fieldName}
            label={{ text: field.label ? t(field.label) : "" }}
            colSpan={colSpan}
            t={t}
            {...layItemConfig}
          >
            {baseField}
          </BorderedItem>
        );
      }
      return (
        <Item
          key={"key-" + fieldName}
          label={{ text: field.label ? t(field.label) : "" }}
          colSpan={colSpan}
          {...layItemConfig}
        >
          {baseField}
        </Item>
      );
    }

    return baseField;
  };

  const renderFields = ({ items, fields }) => {
    // Check if items is a string (LayoutPattern)
    if (typeof items === "string") {
      const layoutSteps = parseLayoutPattern(items);
      const ordered = Object.values(fields).sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0),
      );

      // Let's create an ordered array of { ...config, Name: fieldName }
      const orderedFields = Object.keys(fields)
        .map((key) => ({
          ...fields[key],
          Name: key,
        }))
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      const rows = [];
      let cursor = 0;

      layoutSteps.forEach((step) => {
        if (cursor >= orderedFields.length) return;

        // row (N columns)
        if (step.type === "row") {
          const slice = orderedFields.slice(cursor, cursor + step.count);
          if (slice.length) {
            rows.push({ type: "row", fields: slice });
            cursor += slice.length;
          }
        }

        // full
        if (step.type === "full" && orderedFields[cursor]) {
          rows.push({
            type: "full",
            fields: [orderedFields[cursor]],
          });
          cursor += 1;
        }

        // stack (1 left + N right)
        if (step.type === "stack" && orderedFields[cursor]) {
          const left = orderedFields[cursor];
          const right = orderedFields.slice(
            cursor + 1,
            cursor + 1 + step.count,
          );

          if (right.length) {
            rows.push({
              type: "stack",
              left,
              right,
            });
            cursor += 1 + right.length;
          }
        }
      });

      /* ================= FALLBACK (2 COLUMNS) ================= */
      while (cursor < orderedFields.length) {
        rows.push({
          type: "row",
          fields: orderedFields.slice(cursor, cursor + 2),
        });
        cursor += 2;
      }

      return rows.map((row, rIdx) => {
        /* ===== STACKED LAYOUT (BIG LEFT + VERTICAL RIGHT) ===== */
        if (row.type === "stack") {
          return (
            <GridContainer
              key={rIdx}
              style={{
                display: "flex",
                alignItems: "stretch",
              }}
            >
              {/* LEFT — BIG / IMAGE */}
              <GridItem
                xs={12}
                md={6}
                style={{
                  display: "flex",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {renderField({
                    fieldName: row.left.Name,
                    field: fields[row.left.Name],
                    item: row.left.Name,
                  })}
                </div>
              </GridItem>

              {/* RIGHT — VERTICAL STACK */}
              <GridItem xs={12} md={6}>
                <GridContainer direction="column" style={{ height: "100%" }}>
                  {row.right.map((field, i) => {
                    return (
                      <GridItem key={i} xs={12}>
                        {renderField({
                          fieldName: field.Name,
                          field: fields[field.Name],
                          item: field.Name,
                        })}
                      </GridItem>
                    );
                  })}
                </GridContainer>
              </GridItem>
            </GridContainer>
          );
        }

        /* ===== NORMAL ROW / FULL ===== */
        return (
          <GridContainer key={rIdx}>
            {row.fields.map((field, i) => {
              const md = row.type === "full" ? 12 : 12 / row.fields.length;
              return (
                <GridItem key={i} xs={12} md={md}>
                  {renderField({
                    fieldName: field.Name,
                    field: fields[field.Name],
                    item: field.Name,
                  })}
                </GridItem>
              );
            })}
          </GridContainer>
        );
      });
    }

    // OLD RENDER FIELDS LOGIC (Array)
    return (
      Array.isArray(items) &&
      items.map((item, index) => {
        if (typeof item === "object" && Object.keys(item).length === 1) {
          const key = Object.keys(item)[0];
          const arr = key.split("|");
          if (arr[0] === "grp") {
            return (
              <GroupItem
                key={"grp" + index}
                caption={arr[1]}
                colCount={arr[2] ? Number(arr[2]) : 1}
                colSpan={arr[3] ? Number(arr[3]) : 1}
              >
                {renderFields({ items: item[key], fields: fields })}
              </GroupItem>
            );
          } else if (arr[0] === "tab") {
            return (
              <TabbedItem
                key={"tab" + index}
                colCount={arr[2] ? Number(arr[2]) : 1}
                colSpan={arr[3] ? Number(arr[3]) : 1}
              >
                <Tab title={arr[1]}>
                  <GroupItem
                    caption=""
                    colCount={arr[2] ? Number(arr[2]) : 1}
                    colSpan={arr[3] ? Number(arr[3]) : 1}
                  >
                    {renderFields({ items: item[key], fields: fields })}
                  </GroupItem>
                </Tab>
              </TabbedItem>
            );
          }
        } else if (
          typeof item === "string" &&
          item.length > 0 &&
          item[0] === "|"
        ) {
          const arr = item.split("|");
          return (
            <EmptyItem key={index} colSpan={arr[1] ? Number(arr[1]) : 1} />
          );
        } else if (
          typeof item === "string" &&
          item.length > 0 &&
          item[0] === "f"
        ) {
          const arr = item.split("|");
          const field = fields[arr[1]];
          return renderField({ field, fieldName: arr[1], item });
        }
      })
    );
  };

  return {
    getFieldProps,
    validate,
    renderFields,
    getEditorConfig,
  };
};
