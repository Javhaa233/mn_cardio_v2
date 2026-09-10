import { withTranslation } from "react-i18next";
import React, { Component, createRef } from "react";
import PropTypes from "prop-types";

// @mui/material components
import Box from "@mui/material/Box";

import {
  primaryColor,
  dangerColor,
  successColor,
  roseColor,
  infoColor,
  warningColor,
  whiteColor,
  blackColor,
  grayColor,
  hexToRgb,
} from "assets/jss/material-dashboard-pro-react.js";
import i18n from "i18n";
// core components
import Button from "components/CustomButtons/Button";
import Card from "components/Card/Card";

class Wizard extends Component {
  constructor(props) {
    super(props);
    var width;
    if (this.props.steps.length === 1) {
      width = "100%";
    } else {
      if (window.innerWidth < 600) {
        if (this.props.steps.length !== 3) {
          width = "50%";
        } else {
          width = 100 / 3 + "%";
        }
      } else {
        if (this.props.steps.length === 2) {
          width = "50%";
        } else {
          width = 100 / 3 + "%";
        }
      }
    }
    this.state = {
      currentStep: 0,
      color: this.props.color,
      nextButton: this.props.steps.length > 1 ? true : false,
      previousButton: false,
      finishButton: this.props.steps.length === 1 ? true : false,
      width: width,
      movingTabStyle: {
        transition: "transform 0s",
      },
      allStates: {},
    };
    this.navigationStepChange = this.navigationStepChange.bind(this);
    this.refreshAnimation = this.refreshAnimation.bind(this);
    this.previousButtonClick = this.previousButtonClick.bind(this);
    this.finishButtonClick = this.finishButtonClick.bind(this);
    this.updateWidth = this.updateWidth.bind(this);
  }
  wizard = createRef();
  componentDidMount() {
    this.refreshAnimation(0);
    window.addEventListener("resize", this.updateWidth);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWidth);
  }
  updateWidth() {
    this.refreshAnimation(this.state.currentStep);
  }
  navigationStepChange(key) {
    if (this.props.steps) {
      var validationState = true;
      if (key > this.state.currentStep) {
        for (var i = this.state.currentStep; i < key; i++) {
          if (this[this.props.steps[i].stepId].sendState) {
            this.setState({
              allStates: {
                ...this.state.allStates,
                [this.props.steps[i].stepId]:
                  this[this.props.steps[i].stepId].sendState(),
              },
            });
          }
          if (
            this[this.props.steps[i].stepId].isValidated &&
            this[this.props.steps[i].stepId].isValidated() === false
          ) {
            validationState = false;
            break;
          }
        }
      }
      if (validationState) {
        this.setState({
          currentStep: key,
          nextButton: this.props.steps.length > key + 1 ? true : false,
          previousButton: key > 0 ? true : false,
          finishButton: this.props.steps.length === key + 1 ? true : false,
        });
        this.refreshAnimation(key);
      }
    }
  }
  nextButtonClick() {
    if (
      (this.props.validate &&
        ((this[this.props.steps[this.state.currentStep].stepId].isValidated !==
          undefined &&
          this[
            this.props.steps[this.state.currentStep].stepId
          ].isValidated()) ||
          this[this.props.steps[this.state.currentStep].stepId].isValidated ===
            undefined)) ||
      this.props.validate === undefined
    ) {
      if (
        this[this.props.steps[this.state.currentStep].stepId].sendState !==
        undefined
      ) {
        this.setState({
          allStates: {
            ...this.state.allStates,
            [this.props.steps[this.state.currentStep].stepId]:
              this[this.props.steps[this.state.currentStep].stepId].sendState(),
          },
        });
      }
      var key = this.state.currentStep + 1;
      this.setState({
        currentStep: key,
        nextButton: this.props.steps.length > key + 1 ? true : false,
        previousButton: key > 0 ? true : false,
        finishButton: this.props.steps.length === key + 1 ? true : false,
      });
      this.refreshAnimation(key);
    }
  }
  previousButtonClick() {
    if (
      this[this.props.steps[this.state.currentStep].stepId].sendState !==
      undefined
    ) {
      this.setState({
        allStates: {
          ...this.state.allStates,
          [this.props.steps[this.state.currentStep].stepId]:
            this[this.props.steps[this.state.currentStep].stepId].sendState(),
        },
      });
    }
    var key = this.state.currentStep - 1;
    if (key >= 0) {
      this.setState({
        currentStep: key,
        nextButton: this.props.steps.length > key + 1 ? true : false,
        previousButton: key > 0 ? true : false,
        finishButton: this.props.steps.length === key + 1 ? true : false,
      });
      this.refreshAnimation(key);
    }
  }
  finishButtonClick() {
    if (
      (this.props.validate === false && this.props.finishButtonClick) ||
      (this.props.validate &&
        ((this[this.props.steps[this.state.currentStep].stepId].isValidated !==
          undefined &&
          this[
            this.props.steps[this.state.currentStep].stepId
          ].isValidated()) ||
          this[this.props.steps[this.state.currentStep].stepId].isValidated ===
            undefined) &&
        this.props.finishButtonClick)
    ) {
      this.setState(
        {
          allStates: {
            ...this.state.allStates,
            [this.props.steps[this.state.currentStep].stepId]:
              this[this.props.steps[this.state.currentStep].stepId].sendState(),
          },
        },
        () => {
          const t = this.props.t;
          this.props.finishButtonClick(this.state.allStates);
        },
      );
    }
  }
  refreshAnimation(index) {
    var total = this.props.steps.length;
    var li_width = 100 / total;
    var total_steps = this.props.steps.length;
    var move_distance =
      this.wizard.current.children[0].offsetWidth / total_steps;
    var index_temp = index;
    var vertical_level = 0;

    var mobile_device = window.innerWidth < 600 && total > 3;

    if (mobile_device) {
      move_distance = this.wizard.current.children[0].offsetWidth / 2;
      index_temp = index % 2;
      li_width = 50;
    }

    this.setState({ width: li_width + "%" });

    var step_width = move_distance;
    move_distance = move_distance * index_temp;

    var current = index + 1;

    if (current === 1 || (mobile_device === true && index % 2 === 0)) {
      move_distance -= 8;
    } else if (
      current === total_steps ||
      (mobile_device === true && index % 2 === 1)
    ) {
      move_distance += 8;
    }

    if (mobile_device) {
      vertical_level = parseInt(index / 2, 10);
      vertical_level = vertical_level * 38;
    }
    var movingTabStyle = {
      width: step_width,
      transform:
        "translate3d(" + move_distance + "px, " + vertical_level + "px, 0)",
      transition: "all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)",
    };
    this.setState({ movingTabStyle: movingTabStyle });
  }
  render() {
    const { t } = this.props;
    const { title, subtitle, color, steps } = this.props;

    const styles = {
      wizardContainer: {},
      card: {
        display: "inline-block",
        position: "relative",
        width: "100%",
        margin: "25px 0",
        boxShadow: "0 1px 4px 0 rgba(" + hexToRgb(blackColor) + ", 0.14)",
        borderRadius: "6px",
        color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
        background: whiteColor,
        transition: "all 300ms linear",
        minHeight: "410px",
      },
      wizardHeader: { textAlign: "center", padding: "25px 0 35px" },
      title: { margin: "0" },
      subtitle: { margin: "5px 0 0" },
      wizardNavigation: { position: "relative" },
      nav: {
        marginTop: "20px",
        paddingLeft: "0",
        marginBottom: "0",
        listStyle: "none",
        backgroundColor: "rgba(" + hexToRgb(grayColor[17]) + ", 0.2)",
        "&:after,&:before": { display: "table", content: '" "' },
        "&:after": { boxSizing: "border-box" },
      },
      steps: {
        marginLeft: "0",
        textAlign: "center",
      },
      stepsAnchor: {
        cursor: "pointer",
        position: "relative",
        display: "block",
        padding: "10px 15px",
        textDecoration: "none",
        transition: "all .3s",
        border: "0 !important",
        borderRadius: "30px",
        lineHeight: "18px",
        textTransform: "uppercase",
        fontSize: "12px",
        fontWeight: "500",
        minWidth: "100px",
        textAlign: "center",
        color: grayColor[6] + " !important",
      },
      content: { marginTop: "20px", minHeight: "340px", padding: "20px 15px" },
      stepContent: { display: "none" },
      stepContentActive: { display: "block" },
      movingTab: {
        position: "absolute",
        textAlign: "center",
        padding: "12px",
        fontSize: "12px",
        textTransform: "uppercase",
        WebkitFontSmoothing: "subpixel-antialiased",
        top: "-4px",
        left: "0px",
        borderRadius: "4px",
        color: whiteColor,
        cursor: "pointer",
        fontWeight: "500",
      },
      colors: {
        primary: {
          backgroundColor: primaryColor[0],
          boxShadow:
            "0 4px 20px 0px rgba(" +
            hexToRgb(blackColor) +
            ", 0.14), 0 7px 10px -5px rgba(" +
            hexToRgb(primaryColor[0]) +
            ", 0.4)",
        },
        warning: {
          backgroundColor: warningColor[0],
          boxShadow:
            "0 4px 20px 0px rgba(" +
            hexToRgb(blackColor) +
            ", 0.14), 0 7px 10px -5px rgba(" +
            hexToRgb(warningColor[0]) +
            ", 0.4)",
        },
        danger: {
          backgroundColor: dangerColor[0],
          boxShadow:
            "0 4px 20px 0px rgba(" +
            hexToRgb(blackColor) +
            ", 0.14), 0 7px 10px -5px rgba(" +
            hexToRgb(dangerColor[0]) +
            ", 0.4)",
        },
        success: {
          backgroundColor: successColor[0],
          boxShadow:
            "0 4px 20px 0px rgba(" +
            hexToRgb(blackColor) +
            ", 0.14), 0 7px 10px -5px rgba(" +
            hexToRgb(successColor[0]) +
            ", 0.4)",
        },
        info: {
          backgroundColor: infoColor[0],
          boxShadow:
            "0 4px 20px 0px rgba(" +
            hexToRgb(blackColor) +
            ", 0.14), 0 7px 10px -5px rgba(" +
            hexToRgb(infoColor[0]) +
            ", 0.4)",
        },
        rose: {
          backgroundColor: roseColor[0],
          boxShadow:
            "0 4px 20px 0px rgba(" +
            hexToRgb(blackColor) +
            ", 0.14), 0 7px 10px -5px rgba(" +
            hexToRgb(roseColor[0]) +
            ", 0.4)",
        },
      },
      footer: { padding: "0 15px" },
      left: { float: "left!important" },
      right: { float: "right!important" },
      clearfix: {
        "&:after,&:before": { display: "table", content: '" "' },
        clear: "both",
      },
    };

    const movingTabSx = {
      ...styles.movingTab,
      ...(styles.colors[color] || styles.colors.rose),
    };

    return (
      <Box sx={styles.wizardContainer} ref={this.wizard}>
        <Card style={styles.card}>
          <Box sx={styles.wizardHeader}>
            <h3 style={styles.title}>{title}</h3>
            <h5 style={styles.subtitle}>{subtitle}</h5>
          </Box>
          <Box sx={styles.wizardNavigation}>
            <Box component="ul" sx={styles.nav}>
              {steps.map((prop, key) => (
                <Box
                  component="li"
                  sx={{ ...styles.steps, width: this.state.width }}
                  key={key}
                >
                  <a
                    href="#pablo"
                    style={styles.stepsAnchor}
                    onClick={(e) => {
                      e.preventDefault();
                      this.navigationStepChange(key);
                    }}
                  >
                    {prop.stepName}
                  </a>
                </Box>
              ))}
            </Box>
            <Box sx={movingTabSx} style={this.state.movingTabStyle}>
              {steps[this.state.currentStep].stepName}
            </Box>
          </Box>
          <Box sx={styles.content}>
            {steps.map((prop, key) => {
              const stepSx =
                this.state.currentStep === key
                  ? styles.stepContentActive
                  : styles.stepContent;
              return (
                <Box sx={stepSx} key={key}>
                  <prop.stepComponent
                    innerRef={(node) => (this[prop.stepId] = node)}
                    allStates={this.state.allStates}
                  />
                </Box>
              );
            })}
          </Box>
          <Box sx={styles.footer}>
            <Box sx={styles.left}>
              {this.state.previousButton ? (
                <Button
                  className={this.props.previousButtonClasses}
                  onClick={() => this.previousButtonClick()}
                >
                  {this.props.previousButtonText}
                </Button>
              ) : null}
            </Box>
            <Box sx={styles.right}>
              {this.state.nextButton ? (
                <Button
                  color="rose"
                  className={this.props.nextButtonClasses}
                  onClick={() => this.nextButtonClick()}
                >
                  {this.props.nextButtonText}
                </Button>
              ) : null}
              {this.state.finishButton ? (
                <Button
                  color="rose"
                  className={this.finishButtonClasses}
                  onClick={() => this.finishButtonClick()}
                >
                  {this.props.finishButtonText}
                </Button>
              ) : null}
            </Box>
            <Box sx={styles.clearfix} />
          </Box>
        </Card>
      </Box>
    );
  }
}

Wizard.defaultProps = {
  color: "rose",
  title: i18n.t("Here should go your title"),
  subtitle: i18n.t("And this would be your subtitle"),
  previousButtonText: "Previous",
  previousButtonClasses: "",
  nextButtonClasses: "",
  nextButtonText: "Next",
  finishButtonClasses: "",
  finishButtonText: "Finish",
};

Wizard.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      stepName: PropTypes.string.isRequired,
      stepComponent: PropTypes.object.isRequired,
      stepId: PropTypes.string.isRequired,
    }),
  ).isRequired,
  color: PropTypes.oneOf([
    "primary",
    "warning",
    "danger",
    "success",
    "info",
    "rose",
  ]),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  previousButtonClasses: PropTypes.string,
  previousButtonText: PropTypes.string,
  nextButtonClasses: PropTypes.string,
  nextButtonText: PropTypes.string,
  finishButtonClasses: PropTypes.string,
  finishButtonText: PropTypes.string,
  finishButtonClick: PropTypes.func,
  validate: PropTypes.bool,
};

export default Wizard;
