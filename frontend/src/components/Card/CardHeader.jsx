import React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";

import {
  warningColor,
  successColor,
  dangerColor,
  infoColor,
  primaryColor,
  roseColor,
  whiteColor,
  grayColor,
  blackColor,
  hexToRgb,
  warningCardHeader,
  successCardHeader,
  dangerCardHeader,
  infoCardHeader,
  primaryCardHeader,
  roseCardHeader,
} from "assets/jss/material-dashboard-pro-react.js";

const StyledCardHeader = styled("div", {
  shouldForwardProp: (prop) =>
    ![
      "color",
      "groupbox",
      "plain",
      "image",
      "contact",
      "signup",
      "stats",
      "icon",
      "text",
      "disableHover",
    ].includes(prop),
})(({
  theme,
  color,
  groupbox,
  plain,
  image,
  contact,
  signup,
  stats,
  icon,
  text,
  disableHover,
}) => {
  const cardHeaderColors = {
    warning: warningCardHeader,
    success: successCardHeader,
    danger: dangerCardHeader,
    info: infoCardHeader,
    primary: primaryCardHeader,
    rose: roseCardHeader,
  };

  const groupboxHeaderBgColors = {
    warning: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
    info: "#0284c7",
    primary: "#2563eb",
    rose: "#db2777",
  };

  const cardHeaderBorderColors = {
    warning: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
    info: "#06b6d4",
    primary: "#8b5cf6",
    rose: "#ec4899",
  };

  const cardHeaderBgColors = {
    warning: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    success: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    danger: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    info: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
    primary: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    rose: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
  };

  const cardHeaderTextColors = {
    warning: "#92400e",
    success: "#065f46",
    danger: "#991b1b",
    info: "#0e7490",
    primary: "#5b21b6",
    rose: "#9d174d",
  };

  return {
    padding: text ? "0.5rem 1.25rem" : "0.875rem 1.25rem",
    marginBottom: "0",
    borderBottom: "none",
    background: "transparent",
    position: "relative",
    zIndex: 3,
    transition: "all 0.2s ease-in-out",
    "&:first-of-type": {
      borderRadius: "12px 12px 0 0",
    },
    ...(groupbox && {
      margin: "0",
      padding: "10px 14px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      borderRadius: "16px 16px 0 0",
      background:
        groupboxHeaderBgColors[color] ||
        theme?.palette?.primary?.main ||
        "#0284c7",
      color: whiteColor,
      borderBottom: "1px solid rgba(" + hexToRgb(blackColor) + ", 0.08)",
      boxShadow: "none",
      "&:hover": {
        transform: "none",
        boxShadow: "none",
      },
    }),
    ...((plain || image || contact || signup || icon || stats || color) && {
      margin: "0 15px",
      padding: text ? "0.5rem 1.25rem" : "0",
      position: "relative",
      color: icon ? blackColor : whiteColor,
    }),
    ...(color &&
      !icon &&
      !image &&
      !text && {
        borderRadius: "8px",
        marginTop: "-14px",
        marginLeft: "12px",
        padding: "5px 14px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        maxWidth: "calc(100% - 24px)",
        //background: cardHeaderBgColors[color] || "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        color: cardHeaderTextColors[color] || grayColor[2],
        //border: "1px solid " + (cardHeaderBorderColors[color] || "#e2e8f0"),
        //boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        fontWeight: 600,
        letterSpacing: "0.01em",
        ...(!disableHover && {
          "&:hover": {
            boxShadow:
              "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.04)",
            transform: "translateY(-1px)",
          },
        }),
      }),
    ...(plain && {
      marginLeft: "0px",
      marginRight: "0px",
      ...(image && { margin: "0 !important" }),
    }),
    ...(image && {
      position: "relative",
      padding: "0",
      zIndex: "1",
      marginLeft: "15px",
      marginRight: "15px",
      marginTop: "-30px",
      borderRadius: "12px",
      overflow: "hidden",
      "& img": {
        width: "100%",
        borderRadius: "12px",
        pointerEvents: "none",
        boxShadow:
          "0 10px 25px -5px rgba(" +
          hexToRgb(blackColor) +
          ", 0.15), 0 8px 10px -6px rgba(" +
          hexToRgb(blackColor) +
          ", 0.1)",
        transition: "transform 0.3s ease",
      },
      "& a": { display: "block" },
      "&:hover img": {
        transform: "scale(1.02)",
      },
    }),
    ...(contact && { margin: "0 15px", marginTop: "-20px" }),
    ...(signup && {
      marginLeft: "20px",
      marginRight: "20px",
      marginTop: "-40px",
      padding: "20px 0",
      width: "100%",
      marginBottom: "15px",
    }),
    ...(stats && {
      "& svg": {
        fontSize: "36px",
        lineHeight: "56px",
        textAlign: "center",
        width: "36px",
        height: "36px",
        margin: "10px 10px 4px",
        transition: "transform 0.2s ease",
      },
      "& .fab,& .fas,& .far,& .fal,& .material-icons": {
        fontSize: "36px",
        lineHeight: "56px",
        width: "56px",
        height: "56px",
        textAlign: "center",
        overflow: "unset",
        marginBottom: "1px",
      },
      ...(!icon && {
        "& h1,& h2,& h3,& h4,& h5,& h6": { margin: "0 !important" },
      }),
      ...(icon && { textAlign: "right" }),
    }),
    ...(icon && {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
      paddingTop: "12px",
      ...(color && {
        background: "transparent",
        boxShadow: "none",
      }),
      "& > div:first-of-type": {
        float: "none",
        marginTop: "0",
        marginRight: "0",
      },
      "& .fab,& .fas,& .far,& .fal,& .material-icons": {
        width: "33px",
        height: "33px",
        textAlign: "center",
        lineHeight: "33px",
      },
      "& svg": {
        width: "24px",
        height: "24px",
        textAlign: "center",
        lineHeight: "33px",
        margin: "5px 4px 0px",
      },
    }),
    ...(text && { display: "inline-block" }),
  };
});

const StyledCardHeaderText = styled("div", {
  shouldForwardProp: (prop) => !["color", "disableHover"].includes(prop),
})(({ theme, color, groupbox, disableHover }) => {
  const cardTextBorderColors = {
    warning: "#f59e0b",
    success: "#10b981",
    danger: "#ef4444",
    info: "#06b6d4",
    primary: "#8b5cf6",
    rose: "#0ea5e9",
  };

  const headerAccentGradients = {
    warning: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    success: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    danger: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    info: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)",
    primary: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    rose: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
  };

  const cardTextBgColors = {
    warning: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    success: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    danger: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    info: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
    primary: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
    rose: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
  };

  const cardTextColors = {
    warning: "#b45309",
    success: "#047857",
    danger: "#dc2626",
    info: "#0891b2",
    primary: "#7c3aed",
    rose: "#075985",
  };

  return {
    float: "none",
    display: "inline-block",
    marginRight: "0",
    borderRadius: "6px",
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.4,
    background: color
      ? cardTextBgColors[color] ||
        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      : "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    padding: "6px 16px",
    marginTop: "-16px",
    border:
      "1px solid " +
      (color ? cardTextBorderColors[color] || "#93c5fd" : "#93c5fd"),
    color: color ? cardTextColors[color] || "#374151" : "#60a5fa",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
    maxWidth: "100%",
    transition: "all 0.2s ease-in-out",
    ...(groupbox && {
      display: "inline-block",
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "6px",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)",
      marginTop: "0",
      padding: "5px 14px",
      color: color ? cardTextBorderColors[color] || "#60a5fa" : "#60a5fa",
      fontWeight: 700,
      backdropFilter: "blur(8px)",
    }),
    ...(!disableHover && {
      "&:hover": {
        boxShadow:
          "0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)",
        transform: "translateY(-1px)",
      },
    }),
    "& h1,& h2,& h3,& h4,& h5,& h6": {
      margin: 0,
      fontWeight: 600,
      fontSize: "0.9375rem",
      lineHeight: 1.4,
      letterSpacing: "0.01em",
    },
  };
});

function CardHeaderText(props) {
  const {
    className,
    children,
    color: _ignoredColor,
    groupbox,
    disableHover,
    ...rest
  } = props;

  return (
    <StyledCardHeaderText
      className={className}
      groupbox={groupbox}
      disableHover={disableHover}
      {...rest}
    >
      {children}
    </StyledCardHeaderText>
  );
}

function CardHeader(props) {
  const {
    className,
    children,
    color,
    title,
    titleProps,
    groupbox,
    plain,
    image,
    contact,
    signup,
    stats,
    icon,
    text,
    disableHover,
    ...rest
  } = props;

  const safeTitleProps = titleProps
    ? (({ color: _ignoredTitleColor, ...restTitleProps }) => restTitleProps)(
        titleProps,
      )
    : null;

  const resolvedTitleProps =
    title !== undefined && title !== null
      ? {
          groupbox,
          disableHover,
          ...(safeTitleProps || {}),
          style: {
            whiteSpace: "normal",
            marginTop: text ? "0px" : icon ? "0px" : "0px",
            ...(safeTitleProps && safeTitleProps.style
              ? safeTitleProps.style
              : {}),
          },
        }
      : null;

  const resolvedTitleContent =
    title !== undefined && title !== null ? (
      React.isValidElement(title) ? (
        typeof title.type === "string" ? (
          React.cloneElement(title, {
            style: {
              ...(title.props && title.props.style ? title.props.style : {}),
              margin: 0,
              fontSize: "0.9375rem",
              fontWeight: 600,
              lineHeight: 1.4,
            },
          })
        ) : (
          title
        )
      ) : (
        <span>{title}</span>
      )
    ) : null;

  return (
    <StyledCardHeader
      className={className}
      color={color}
      groupbox={groupbox}
      plain={plain}
      image={image}
      contact={contact}
      signup={signup}
      stats={stats}
      icon={icon}
      text={text}
      disableHover={disableHover}
      {...rest}
    >
      {icon ? children : null}
      {resolvedTitleProps ? (
        <CardHeaderText {...resolvedTitleProps}>
          {resolvedTitleContent}
        </CardHeaderText>
      ) : null}
      {icon ? null : children}
    </StyledCardHeader>
  );
}

CardHeader.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf([
    "warning",
    "success",
    "danger",
    "info",
    "primary",
    "rose",
  ]),
  title: PropTypes.node,
  titleProps: PropTypes.object,
  groupbox: PropTypes.bool,
  plain: PropTypes.bool,
  image: PropTypes.bool,
  contact: PropTypes.bool,
  signup: PropTypes.bool,
  stats: PropTypes.bool,
  icon: PropTypes.bool,
  text: PropTypes.bool,
  disableHover: PropTypes.bool,
  children: PropTypes.node,
};

CardHeaderText.propTypes = {
  className: PropTypes.string,
  color: PropTypes.oneOf([
    "warning",
    "success",
    "danger",
    "info",
    "primary",
    "rose",
  ]),
  groupbox: PropTypes.bool,
  disableHover: PropTypes.bool,
  children: PropTypes.node,
};

export { CardHeaderText };

export default CardHeader;
