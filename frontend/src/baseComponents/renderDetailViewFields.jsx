import i18n from "i18n";
import React from "react";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import BaseField from "baseComponents/BaseField";
import Helper from "helper";

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

    if (line === "---") {
      steps.push({ type: "divider" });
      i++;
      continue;
    }

    // New logic with names
    if (line.includes("|")) {
      const parts = line.split("|");
      const leftName = parts[0].trim();
      const rightName = parts[1]?.trim();

      // Check for Reverse Stack (Many Left + One Spanning Right)
      // Condition: Current line has left name, and subsequent lines have left names but empty right side
      let stackLeftNames = [];
      if (leftName) stackLeftNames.push(leftName);

      let j = i + 1;
      let isReverseStack = false;

      // Look ahead for "leftName | " lines
      while (j < lines.length && lines[j].includes("|")) {
        const nextParts = lines[j].split("|");
        const nextLeft = nextParts[0].trim();
        const nextRight = nextParts[1]?.trim();

        if (nextLeft && !nextRight) {
          stackLeftNames.push(nextLeft);
          j++;
        } else {
          break;
        }
      }

      // If we found a spanning structure and we have a rightName from the start
      if (rightName && stackLeftNames.length > 1) {
        steps.push({
          type: "reverse-stack",
          leftNames: stackLeftNames,
          rightName: rightName,
        });
        i = j;
        continue;
      }

      // Check for Stack (One Spanning Left + Many Right)
      // Condition: Current line has right name, and subsequent lines start with | and have right name
      let stackRightNames = [];
      if (rightName) stackRightNames.push(rightName);

      j = i + 1;
      let isStack = false;

      // Look ahead for "| rightName" lines
      // NOTE: Original logic checked for startWith("|"), which implies empty left side
      while (j < lines.length) {
        const l = lines[j];
        if (l.startsWith("|")) {
          const nextRight = l.substring(1).trim();
          if (nextRight) stackRightNames.push(nextRight);
          j++;
        } else if (l.includes("|")) {
          // Check if it is " | rightName" format which might not start with | if trimmed?
          // Trimming " | foo" gives "| foo" so startsWith("|") is correct.
          // But if user typed "  | foo", trimmed is "| foo".
          // If user typed "bar | foo", it's not a stack continuation for the left side.
          const parts = l.split("|");
          if (!parts[0].trim() && parts[1]?.trim()) {
            stackRightNames.push(parts[1].trim());
            j++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      if (leftName && stackRightNames.length > 1) {
        steps.push({
          type: "stack",
          leftName: leftName,
          rightNames: stackRightNames,
        });
        i = j;
        continue;
      }

      // Regular Row
      const rowNames = parts.map((p) => p.trim()); // Keep empty strings if any, to maintain grid slots

      steps.push({
        type: "row",
        names: rowNames,
      });
      i++;
      continue;
    }

    // full row (no pipes)
    steps.push({ type: "full", name: line });
    i++;
  }

  return steps;
};

/* ================= RENDER FIELDS ================= */

export const renderDetailViewFields = (
  fields,
  ObjectName,
  LayoutPattern,
  editObject,
  ChangeValue,
  DataId,
  labelWidth,
) => {
  if (!Array.isArray(fields)) return null;

  const layoutSteps = parseLayoutPattern(LayoutPattern);

  // Extract all names used in layout
  const layoutNames = new Set();
  layoutSteps?.forEach((step) => {
    if (step.names) step.names.forEach((n) => layoutNames.add(n));
    if (step.name) layoutNames.add(step.name);
    if (step.leftNames) step.leftNames.forEach((n) => layoutNames.add(n));
    if (step.leftName) layoutNames.add(step.leftName);
    if (step.rightNames) step.rightNames.forEach((n) => layoutNames.add(n));
    if (step.rightName) layoutNames.add(step.rightName);
  });

  const allFields = fields
    .flat()
    .filter(
      (f) =>
        f && (f.EditField || f.Type === "ListView" || layoutNames.has(f.Name)),
    )
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  // Create a map for name-based lookup
  const fieldMap = new Map();
  allFields.forEach((f) => fieldMap.set(f.Name, f));

  const usedFieldNames = new Set();
  const getField = (name) => {
    const f = fieldMap.get(name);
    if (f) usedFieldNames.add(name);
    return f;
  };

  /* ================= DEFAULT: ONE COLUMN ================= */

  if (!layoutSteps || layoutSteps.length === 0) {
    return allFields.map((field, i) => {
      const isLast = i === allFields.length - 1;
      return (
        <GridContainer key={i}>
          <GridItem xs={12} md={12}>
            <BaseField
              LabelWidth={labelWidth || 40}
              Config={field}
              Value={Helper.ObjectHelper.getValue(editObject, field.Name)}
              ChangeValue={ChangeValue}
              isLast={isLast}
              ObjectName={ObjectName}
              DataId={DataId}
            />
          </GridItem>
        </GridContainer>
      );
    });
  }

  /* ================= BUILD ROWS ================= */

  const rows = [];

  layoutSteps.forEach((step) => {
    if (step.type === "divider") {
      rows.push({ type: "divider" });
    }

    if (step.type === "row") {
      const rowFields = step.names.map((name) =>
        name ? getField(name) : null,
      );
      if (rowFields.some((f) => f)) {
        rows.push({ type: "row", fields: rowFields });
      }
    }

    if (step.type === "full") {
      const field = getField(step.name);
      if (field) {
        rows.push({ type: "full", fields: [field] });
      }
    }

    if (step.type === "reverse-stack") {
      const leftFields = step.leftNames
        .map((name) => getField(name))
        .filter(Boolean);
      const rightField = getField(step.rightName);

      if (leftFields.length > 0 && rightField) {
        rows.push({
          type: "reverse-stack",
          left: leftFields,
          right: rightField,
        });
      }
    }

    if (step.type === "stack") {
      const leftField = getField(step.leftName);
      const rightFields = step.rightNames
        .map((name) => getField(name))
        .filter(Boolean);

      if (leftField && rightFields.length > 0) {
        rows.push({
          type: "stack",
          left: leftField,
          right: rightFields,
        });
      }
    }
  });

  // Handle remaining fields
  const remainingFields = allFields.filter((f) => !usedFieldNames.has(f.Name));
  let cursor = 0;
  while (cursor < remainingFields.length) {
    rows.push({
      type: "row",
      fields: remainingFields.slice(cursor, cursor + 2),
    });
    cursor += 2;
  }

  /* ================= RENDER ================= */

  return rows.map((row, rIdx) => {
    const isLastRow = rIdx === rows.length - 1;

    if (row.type === "divider") {
      return (
        <div
          key={rIdx}
          style={{
            width: "100%",
            borderBottom: "1px dotted #aaaaaa",
            margin: "5px 0",
          }}
        />
      );
    }

    /* ===== REVERSE STACKED LAYOUT (VERTICAL LEFT + BIG RIGHT) ===== */
    if (row.type === "reverse-stack") {
      return (
        <GridContainer
          key={rIdx}
          style={{
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {/* LEFT — VERTICAL STACK */}
          <GridItem xs={12} md={6}>
            <GridContainer direction="column" style={{ height: "100%" }}>
              {row.left.map((field, i) => {
                const isLast = isLastRow && i === row.left.length - 1;
                return (
                  <GridItem key={i} xs={12}>
                    <BaseField
                      LabelWidth={labelWidth || 40}
                      Config={field}
                      Value={Helper.ObjectHelper.getValue(
                        editObject,
                        field.Name,
                      )}
                      ChangeValue={ChangeValue}
                      isLast={isLast}
                      ObjectName={ObjectName}
                      DataId={DataId}
                    />
                  </GridItem>
                );
              })}
            </GridContainer>
          </GridItem>

          {/* RIGHT — BIG / SPANNING */}
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
              <BaseField
                LabelWidth={labelWidth || 40}
                Config={row.right}
                Value={Helper.ObjectHelper.getValue(editObject, row.right.Name)}
                ChangeValue={ChangeValue}
                style={{
                  flex: 1,
                  height: "100%",
                }}
                isLast={isLastRow}
                ObjectName={ObjectName}
                DataId={DataId}
                FullHeight={true}
              />
            </div>
          </GridItem>
        </GridContainer>
      );
    }

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
              <BaseField
                LabelWidth={labelWidth || 40}
                Config={row.left}
                Value={Helper.ObjectHelper.getValue(editObject, row.left.Name)}
                ChangeValue={ChangeValue}
                style={{
                  flex: 1,
                  height: "100%",
                }}
                isLast={isLastRow && (!row.right || row.right.length === 0)}
                ObjectName={ObjectName}
                DataId={DataId}
                FullHeight={true}
              />
            </div>
          </GridItem>

          {/* RIGHT — VERTICAL STACK */}
          <GridItem xs={12} md={6}>
            <GridContainer direction="column" style={{ height: "100%" }}>
              {row.right.map((field, i) => {
                const isLast = isLastRow && i === row.right.length - 1;
                return (
                  <GridItem key={i} xs={12}>
                    <BaseField
                      LabelWidth={labelWidth || 40}
                      Config={field}
                      Value={Helper.ObjectHelper.getValue(
                        editObject,
                        field.Name,
                      )}
                      ChangeValue={ChangeValue}
                      isLast={isLast}
                      ObjectName={ObjectName}
                      DataId={DataId}
                    />
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
          const isLast = isLastRow && i === row.fields.length - 1;
          // Per-field width at `md` and up: a 4-field row is 4 across.
          const per =
            row.type === "full" ? 12 : Math.max(1, 12 / row.fields.length);
          return (
            <GridItem
              key={i}
              xs={12}
              // The missing middle step. With only xs and md declared, a
              // 4-field row went straight from one-per-line to four-across the
              // instant the viewport hit 960px - and each of those columns then
              // holds a full label-plus-input row, so at 240px wide the label
              // and the control were both unreadable. Doubling the width at
              // `sm` puts a 4-field row two-across on a tablet and a 2-field
              // row one-across, then `md` restores the desktop density.
              sm={row.type === "full" ? 12 : Math.min(12, per * 2)}
              md={per}
            >
              {field ? (
                <BaseField
                  LabelWidth={labelWidth || 40}
                  Config={field}
                  Value={Helper.ObjectHelper.getValue(editObject, field.Name)}
                  ChangeValue={ChangeValue}
                  isLast={isLast}
                  ObjectName={ObjectName}
                  DataId={DataId}
                />
              ) : null}
            </GridItem>
          );
        })}
      </GridContainer>
    );
  });
};
