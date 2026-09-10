import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import system from "./reducers/system";
import tabs from "./reducers/system/tabs";
import form from "./reducers/system/form";
import dataGrid from "./reducers/system/dataGrid";
import component from "./reducers/system/component";
import auth from "./reducers/system/auth";

import options from "./reducers/options";
import doctorsProfile from "./reducers/core/doctorsProfile";

import HavhlagaEmgeg from "./reducers/core/HavhlagaEmgeg";
import Icd from "./reducers/core/Icd";
import Pm from "./reducers/core/Pm";
import TurulhiinGajig from "./reducers/core/TurulhiinGajig";
import Organization from "./reducers/core/Organization";

//import logger from './middleware/logger';

export default configureStore({
  reducer: {
    system,
    tabs,
    component,
    auth,
    form,
    dataGrid,
    options,
    HavhlagaEmgeg,
    Icd,
    Pm,
    TurulhiinGajig,
    Organization,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
