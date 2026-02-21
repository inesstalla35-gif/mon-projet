/**
 * @file objectiveReducer.js
 * @description Reducer Redux pour la gestion des objectifs financiers.
 * 
 * Ce reducer gère l'état lié aux objectifs:
 * - Liste des objectifs (objectives)
 * - État de chargement (isLoading)
 * - Messages d'erreur (error)
 * 
 * @requires redux - Fonction reducer
 */

import {
  GET_OBJECTIVES_REQUEST,
  GET_OBJECTIVES_SUCCESS,
  GET_OBJECTIVES_FAIL,
  CREATE_OBJECTIVE_REQUEST,
  CREATE_OBJECTIVE_SUCCESS,
  CREATE_OBJECTIVE_FAIL,
  UPDATE_OBJECTIVE_REQUEST,
  UPDATE_OBJECTIVE_SUCCESS,
  UPDATE_OBJECTIVE_FAIL,
  DELETE_OBJECTIVE_REQUEST,
  DELETE_OBJECTIVE_SUCCESS,
  DELETE_OBJECTIVE_FAIL,
  CLEAR_OBJECTIVE_ERROR,
  RESET_OBJECTIVE_STATE,
} from "../types/objectiveTypes";

// ==================== ÉTAT INITIAL ====================

/**
 * État initial du reducer d'objectifs
 * 
 * @property {Array} objectives - Tableau des objectifs (vide au début)
 * @property {boolean} isLoading - Indique si une requête est en cours
 * @property {string|null} error - Message d'erreur ou null
 */
const initialState = {
  objectives: [],
  isLoading: false,
  error: null,
};

// ==================== REDUCER ====================

/**
 * Reducer pour les objectifs
 * 
 * @param {Object} state - État actuel (défaut: initialState)
 * @param {Object} action - Action Dispatchée
 * @returns {Object} Nouvel état
 * 
 * @example
 * // Après récupération des objectifs
 * const newState = objectiveReducer(initialState, {
 *   type: GET_OBJECTIVES_SUCCESS,
 *   payload: [{ id: 1, nom: 'Vacances', montant_cible: 3000 }]
 * });
 */
export const objectiveReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==================== GET OBJECTIVES ====================
    
    case GET_OBJECTIVES_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case GET_OBJECTIVES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        objectives: action.payload,
        error: null,
      };

    case GET_OBJECTIVES_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== CREATE OBJECTIVE ====================
    
    case CREATE_OBJECTIVE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case CREATE_OBJECTIVE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // Ajout du nouvel objectif à la liste existante
        objectives: [...state.objectives, action.payload],
        error: null,
      };

    case CREATE_OBJECTIVE_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== UPDATE OBJECTIVE ====================
    
    case UPDATE_OBJECTIVE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case UPDATE_OBJECTIVE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // Mise à jour de l'objectif dans la liste
        objectives: state.objectives.map((objective) =>
          objective._id === action.payload._id ? action.payload : objective
        ),
        error: null,
      };

    case UPDATE_OBJECTIVE_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== DELETE OBJECTIVE ====================
    
    case DELETE_OBJECTIVE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case DELETE_OBJECTIVE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // Filtrage de l'objectif supprimé de la liste
        objectives: state.objectives.filter(
          (objective) => objective._id !== action.payload
        ),
        error: null,
      };

    case DELETE_OBJECTIVE_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== CLEAR ERROR ====================
    
    case CLEAR_OBJECTIVE_ERROR:
      return {
        ...state,
        error: null,
      };

    // ==================== RESET STATE ====================
    
    case RESET_OBJECTIVE_STATE:
      return initialState;

    // ==================== DEFAULT ====================
    
    default:
      return state;
  }
};

// Selectors (fonctions pour lire l'état)

/**
 * Selector pour obtenir tous les objectifs
 * @param {Object} state - État global Redux
 * @returns {Array}
 */
export const selectObjectives = (state) => state.objective.objectives;

/**
 * Selector pour vérifier si une requête est en cours
 * @param {Object} state - État global Redux
 * @returns {boolean}
 */
export const selectObjectiveLoading = (state) => state.objective.isLoading;

/**
 * Selector pour obtenir l'erreur
 * @param {Object} state - État global Redux
 * @returns {string|null}
 */
export const selectObjectiveError = (state) => state.objective.error;

/**
 * Selector pour calculer le montant total économisé
 * @param {Object} state - État global Redux
 * @returns {number}
 */
export const selectTotalSaved = (state) => {
  return state.objective.objectives.reduce(
    (total, objective) => total + (objective.montant_actuel || 0),
    0
  );
};

/**
 * Selector pour calculer le montant total cible
 * @param {Object} state - État global Redux
 * @returns {number}
 */
export const selectTotalTarget = (state) => {
  return state.objective.objectives.reduce(
    (total, objective) => total + (objective.montant_cible || 0),
    0
  );
};

/**
 * Selector pour obtenir les objectifs atteints (100%)
 * @param {Object} state - État global Redux
 * @returns {Array}
 */
export const selectCompletedObjectives = (state) => {
  return state.objective.objectives.filter(
    (objective) =>
      (objective.montant_actuel || 0) >= (objective.montant_cible || 0)
  );
};

/**
 * Selector pour obtenir les objectifs en cours
 * @param {Object} state - État global Redux
 * @returns {Array}
 */
export const selectInProgressObjectives = (state) => {
  return state.objective.objectives.filter(
    (objective) =>
      (objective.montant_actuel || 0) < (objective.montant_cible || 0)
  );
};

