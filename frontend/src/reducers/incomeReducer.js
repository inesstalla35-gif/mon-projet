/**
 * @file incomeReducer.js
 * @description Reducer Redux pour la gestion des revenus.
 * 
 * Ce reducer gère l'état lié aux revenus:
 * - Liste des revenus (incomes)
 * - État de chargement (isLoading)
 * - Messages d'erreur (error)
 * 
 * @requires redux - Fonction reducer
 */

import {
  GET_INCOMES_REQUEST,
  GET_INCOMES_SUCCESS,
  GET_INCOMES_FAIL,
  ADD_INCOME_REQUEST,
  ADD_INCOME_SUCCESS,
  ADD_INCOME_FAIL,
  DELETE_INCOME_REQUEST,
  DELETE_INCOME_SUCCESS,
  DELETE_INCOME_FAIL,
  CLEAR_INCOME_ERROR,
  RESET_INCOME_STATE,
} from "../types/incomeTypes";

// ==================== ÉTAT INITIAL ====================

/**
 * État initial du reducer de revenus
 * 
 * @property {Array} incomes - Tableau des revenus (vide au début)
 * @property {boolean} isLoading - Indique si une requête est en cours
 * @property {string|null} error - Message d'erreur ou null
 */
const initialState = {
  incomes: [],
  isLoading: false,
  error: null,
};

// ==================== REDUCER ====================

/**
 * Reducer pour les revenus
 * 
 * @param {Object} state - État actuel (défaut: initialState)
 * @param {Object} action - Action Dispatchée
 * @returns {Object} Nouvel état
 * 
 * @example
 * // Après récupération des revenus
 * const newState = incomeReducer(initialState, {
 *   type: GET_INCOMES_SUCCESS,
 *   payload: [{ id: 1, montant: 1000 }]
 * });
 */
export const incomeReducer = (state = initialState, action) => {
  switch (action.type) {
    // ==================== GET INCOMES ====================
    
    case GET_INCOMES_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case GET_INCOMES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        incomes: action.payload,
        error: null,
      };

    case GET_INCOMES_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== ADD INCOME ====================
    
    case ADD_INCOME_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case ADD_INCOME_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // Ajout du nouveau revenu à la liste existante
        incomes: [...state.incomes, action.payload],
        error: null,
      };

    case ADD_INCOME_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== DELETE INCOME ====================
    
    case DELETE_INCOME_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case DELETE_INCOME_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // Filtrage du revenu supprimé de la liste
        incomes: state.incomes.filter(
          (income) => income._id !== action.payload
        ),
        error: null,
      };

    case DELETE_INCOME_FAIL:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    // ==================== CLEAR ERROR ====================
    
    case CLEAR_INCOME_ERROR:
      return {
        ...state,
        error: null,
      };

    // ==================== RESET STATE ====================
    
    case RESET_INCOME_STATE:
      return initialState;

    // ==================== DEFAULT ====================
    
    default:
      return state;
  }
};

// Selectors (fonctions pour lire l'état)

/**
 * Selector pour obtenir tous les revenus
 * @param {Object} state - État global Redux
 * @returns {Array}
 */
export const selectIncomes = (state) => state.income.incomes;

/**
 * Selector pour vérifier si une requête est en cours
 * @param {Object} state - État global Redux
 * @returns {boolean}
 */
export const selectIncomeLoading = (state) => state.income.isLoading;

/**
 * Selector pour obtenir l'erreur
 * @param {Object} state - État global Redux
 * @returns {string|null}
 */
export const selectIncomeError = (state) => state.income.error;

/**
 * Selector pour calculer le total des revenus
 * @param {Object} state - État global Redux
 * @returns {number}
 */
export const selectTotalIncome = (state) => {
  return state.income.incomes.reduce(
    (total, income) => total + (income.montant || 0),
    0
  );
};

