
// src/reducers/usuarioReducer.js

const initialState = {
  permisos: {},
};

export default function usuarioReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_PERMISOS":
      return {
        ...state,
        permisos: action.payload,
      };
    default:
      return state;
  }
}
