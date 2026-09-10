/**
 * Authentication routes
 */
import { useTranslation } from "react-i18next";
import React from "react";
import i18n from "i18n";
const LoginPage = React.lazy(() => import("view/Auth/LoginPage.jsx"));
const PatientLoginPage = React.lazy(
  () => import("view/Patient/Auth/PatientLoginPage.jsx"),
);
const RegisterPage = React.lazy(() => import("view/Auth/RegisterPage.jsx"));
const ForgetPassword = React.lazy(() => import("view/Auth/ForgetPassword.jsx"));
const ResetPassword = React.lazy(() => import("view/Auth/ResetPassword.jsx"));
const FileUploadPage = React.lazy(() => import("view/FileUpload.jsx"));

const authRoutes = [
  // test layout
  {
    path: "/FileUpload",
    redirect: true,
    component: FileUploadPage,
    layout: "/test",
  },
  // auth layout
  {
    path: "/login",
    redirect: true,
    component: LoginPage,
    layout: "/auth",
  },
  {
    path: "/register",
    redirect: true,
    component: RegisterPage,
    layout: "/auth",
  },
  {
    path: "/forget-password",
    redirect: true,
    component: ForgetPassword,
    layout: "/auth",
  },
  {
    path: "/ResetPassword",
    redirect: true,
    component: ResetPassword,
    layout: "/auth",
  },
  // patientAuth layout
  {
    path: "/login",
    redirect: true,
    component: PatientLoginPage,
    layout: "/patientAuth",
  },
];

export default authRoutes;
