/**
 * @file index.js
 * @description Root reducer combinant tous les reducers de l'application.
 * 
 * Ce fichier utilise combineReducers pour créer le reducer racine
 * qui gère l'état global de l'application.
 * 
 * Structure de l'état:
 * - auth: État d'authentification
 * - income: État des revenus
 * - objective: État des objectifs
 * - profile: État du profil
 * 
 * @requires redux - Fonction combineReducers
 */

import { combineReducers } from "redux";

// Import des reducers
import { authReducer } from "./authReducer";
import { incomeReducer } from "./incomeReducer";
import { objectiveReducer } from "./objectiveReducer";
import { profileReducer } from "./profileReducer";

/**
 * Root reducer combinant tous les reducers de l'application
 * 
 * @type {Reducer}
 * 
 * @example
 * // Accès à l'état
 * const authState = store.getState().auth;
 * const incomes = store.getState().income.incomes;
 */
const rootReducer = combineReducers({
  auth: authReducer,
  income: incomeReducer,
  objective: objectiveReducer,
  profile: profileReducer,
});

export default rootReducer;

