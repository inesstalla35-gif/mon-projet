/**
 * @file authReducer.js
 * @description Reducer Redux pour l'authentification utilisateur.
 * 
 * Ce reducer gère l'état lié à l'authentification:
 * - Données de l'utilisateur (user)
 * - Token JWT (token)
 * - État de chargement (isLoading)
 * - Messages d'erreur (error)
 * 
 * @requires redux - Fonction reducer
 */

import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  GET_CURRENT_USER_REQUEST,
  GET_CURRENT_USER_SUCCESS,
  GET_CURRENT_USER_FAIL,
  LOGOUT,
  CLEAR_AUTH_ERROR,
} from "../types/authTypes";

// ==================== ÉTAT INITIAL ====================

/**
 * État initial du reducer d'authentification
 * 
 * @property {Object|null} user - Données de l'utilisateur ou null
 * @property {string|null} token - Token JWT ou null
 * @property {boolean} isLoading - Indique si une requête est en cours
 * @property {string|null} error - Message d'erreur ou null
 */
const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// ==================== REDUCER ====================

/**
 * Reducer pour l'authentification
 * 
 * @param {Object} state - État actuel (défaut: initialState)
 * @param {Object} action - Action Dispatchée
 * @returns {Object} Nouvel état
 * 
 * @example
 * // Après une connexion réussie
 * const newState = authReducer(initialState, {
 *   type: LOGIN_SUCCESS,
 *   payload: { user: {...}, token: '...' }
 * });
 * // newState = { user: {...}, token: '...', isLoading: false, error: null }
 */
export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==================== LOGIN ====================
    
    case LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case LOGIN_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        // Ne pas clear user/token sur échec de login
      };

    // ==================== REGISTER ====================
    
    case REGISTER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case REGISTER_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== GET CURRENT USER ====================
    
    case GET_CURRENT_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case GET_CURRENT_USER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user || action.payload,
        token: action.payload.token || state.token,
        error: null,
      };

    case GET_CURRENT_USER_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        // Garder le token en cas d'erreur temporaire
      };

    // ==================== LOGOUT ====================
    
    case LOGOUT:
      return initialState;

    // ==================== CLEAR ERROR ====================
    
    case CLEAR_AUTH_ERROR:
      return {
        ...state,
        error: null,
      };

    // ==================== DEFAULT ====================
    
    default:
      return state;
  }
};

// Selectors (fonctions pour lire l'état)
/**
 * Selector pour vérifier si l'utilisateur est connecté
 * @param {Object} state - État global Redux
 * @returns {boolean}
 */
export const selectIsAuthenticated = (state) => !!state.auth.token;

/**
 * Selector pour obtenir l'utilisateur actuel
 * @param {Object} state - État global Redux
 * @returns {Object|null}
 */
export const selectCurrentUser = (state) => state.auth.user;

/**
 * Selector pour obtenir le token
 * @param {Object} state - État global Redux
 * @returns {string|null}
 */
export const selectAuthToken = (state) => state.auth.token;

/**
 * Selector pour vérifier si une requête auth est en cours
 * @param {Object} state - État global Redux
 * @returns {boolean}
 */
export const selectAuthLoading = (state) => state.auth.isLoading;

/**
 * Selector pour obtenir l'erreur d'authentification
 * @param {Object} state - État global Redux
 * @returns {string|null}
 */
export const selectAuthError = (state) => state.auth.error;

