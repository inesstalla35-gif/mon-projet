/**
 * @file profileReducer.js
 * @description Reducer Redux pour la gestion du profil utilisateur.
 * 
 * Ce reducer gère l'état lié au profil:
 * - Données du profil (profile)
 * - État de chargement (isLoading)
 * - Messages d'erreur (error)
 * 
 * @requires redux - Fonction reducer
 */

import {
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_FAIL,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  CREATE_PROFILE_REQUEST,
  CREATE_PROFILE_SUCCESS,
  CREATE_PROFILE_FAIL,
  CLEAR_PROFILE_ERROR,
  RESET_PROFILE_STATE,
} from "../types/profileTypes";

// ==================== ÉTAT INITIAL ====================

/**
 * État initial du reducer de profil
 * 
 * @property {Object|null} profile - Données du profil ou null
 * @property {boolean} isLoading - Indique si une requête est en cours
 * @property {string|null} error - Message d'erreur ou null
 */
const initialState = {
  profile: null,
  isLoading: false,
  error: null,
};

// ==================== REDUCER ====================

/**
 * Reducer pour le profil
 * 
 * @param {Object} state - État actuel (défaut: initialState)
 * @param {Object} action - Action Dispatchée
 * @returns {Object} Nouvel état
 * 
 * @example
 * // Après récupération du profil
 * const newState = profileReducer(initialState, {
 *   type: GET_PROFILE_SUCCESS,
 *   payload: { nom: 'Dupont', prenom: 'Jean' }
 * });
 */
export const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==================== GET PROFILE ====================
    
    case GET_PROFILE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case GET_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        profile: action.payload,
        error: null,
      };

    case GET_PROFILE_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== UPDATE PROFILE ====================
    
    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // Mise à jour du profil
        profile: action.payload,
        error: null,
      };

    case UPDATE_PROFILE_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== CREATE PROFILE ====================
    
    case CREATE_PROFILE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case CREATE_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // Création du profil
        profile: action.payload,
        error: null,
      };

    case CREATE_PROFILE_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== CLEAR ERROR ====================
    
    case CLEAR_PROFILE_ERROR:
      return {
        ...state,
        error: null,
      };

    // ==================== RESET STATE ====================
    
    case RESET_PROFILE_STATE:
      return initialState;

    // ==================== DEFAULT ====================
    
    default:
      return state;
  }
};

// Selectors (fonctions pour lire l'état)

/**
 * Selector pour obtenir le profil
 * @param {Object} state - État global Redux
 * @returns {Object|null}
 */
export const selectProfile = (state) => state.profile.profile;

/**
 * Selector pour vérifier si une requête est en cours
 * @param {Object} state - État global Redux
 * @returns {boolean}
 */
export const selectProfileLoading = (state) => state.profile.isLoading;

/**
 * Selector pour obtenir l'erreur
 * @param {Object} state - État global Redux
 * @returns {string|null}
 */
export const selectProfileError = (state) => state.profile.error;

/**
 * Selector pour vérifier si le profil existe
 * @param {Object} state - État global Redux
 * @returns {boolean}
 */
export const selectHasProfile = (state) => !!state.profile.profile;

