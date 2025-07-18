// src/reducers/index.js
import { combineReducers } from "@reduxjs/toolkit";
import usuarioReducer from "./usuarioReducer"; // Asegúrate que el archivo y exportación sean correctos

const rootReducer = combineReducers({
  usuario: usuarioReducer,
});

export default rootReducer;
