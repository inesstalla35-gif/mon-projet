/**
 * @file store.js
 * @description Configuration du store Redux de l'application.
 * 
 * Ce fichier configure et exporte le store Redux avec:
 * - Le root reducer combiné
 * - Le middleware Redux Thunk pour les actions asynchrones
 * 
 * Compatible avec Redux 5.x et react-redux 9.x
 * 
 * @requires redux - Fonctions createStore, applyMiddleware
 * @requires redux-thunk - Middleware pour les actions asynchrones
 */

import { createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import rootReducer from "./reducers";

// ==================== CONFIGURATION ====================

/**
 * Configuration du store Redux
 * Version simplifiée pour compatibilité maximale
 */

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

// ==================== EXPORT ====================

/**
 * Store Redux configuré et prêt à être utilisé
 * 
 * @type {Store}
 */
export default store;

