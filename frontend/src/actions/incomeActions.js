/**
 * @file incomeActions.js
 * @description Actions Redux pour la gestion des revenus.
 * 
 * Ce fichier contient toutes les actions liées aux revenus:
 * - Récupération de la liste des revenus
 * - Ajout d'un nouveau revenu
 * - Suppression d'un revenu (optionnel)
 * 
 * Ces actions interagissent avec l'API backend pour gérer le cycle
 * de vie des revenus de l'utilisateur.
 * 
 * @requires redux-thunk - Pour les actions asynchrones
 * @requires axios - Service API
 */

import API from "../services/api";

// Import des types d'actions
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

// ==================== ACTION CREATORS ====================

/**
 * Action creator pour le début de la récupération des revenus
 * @returns {Object} Action avec type GET_INCOMES_REQUEST
 */
const getIncomesRequest = () => ({
  type: GET_INCOMES_REQUEST,
});

/**
 * Action creator pour la récupération réussie des revenus
 * @param {Array} incomes - Tableau des revenus
 * @returns {Object} Action avec type GET_INCOMES_SUCCESS et payload
 */
const getIncomesSuccess = (incomes) => ({
  type: GET_INCOMES_SUCCESS,
  payload: incomes,
});

/**
 * Action creator pour l'échec de récupération des revenus
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type GET_INCOMES_FAIL et payload
 */
const getIncomesFail = (error) => ({
  type: GET_INCOMES_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de l'ajout d'un revenu
 * @returns {Object} Action avec type ADD_INCOME_REQUEST
 */
const addIncomeRequest = () => ({
  type: ADD_INCOME_REQUEST,
});

/**
 * Action creator pour l'ajout réussi d'un revenu
 * @param {Object} income - Nouveau revenu créé
 * @returns {Object} Action avec type ADD_INCOME_SUCCESS et payload
 */
const addIncomeSuccess = (income) => ({
  type: ADD_INCOME_SUCCESS,
  payload: income,
});

/**
 * Action creator pour l'échec de l'ajout d'un revenu
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type ADD_INCOME_FAIL et payload
 */
const addIncomeFail = (error) => ({
  type: ADD_INCOME_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de la suppression d'un revenu
 * @returns {Object} Action avec type DELETE_INCOME_REQUEST
 */
const deleteIncomeRequest = () => ({
  type: DELETE_INCOME_REQUEST,
});

/**
 * Action creator pour la suppression réussie d'un revenu
 * @param {string} incomeId - ID du revenu supprimé
 * @returns {Object} Action avec type DELETE_INCOME_SUCCESS et payload
 */
const deleteIncomeSuccess = (incomeId) => ({
  type: DELETE_INCOME_SUCCESS,
  payload: incomeId,
});

/**
 * Action creator pour l'échec de la suppression d'un revenu
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type DELETE_INCOME_FAIL et payload
 */
const deleteIncomeFail = (error) => ({
  type: DELETE_INCOME_FAIL,
  payload: error,
});

/**
 * Action creator pour清除 les erreurs
 * @returns {Object} Action avec type CLEAR_INCOME_ERROR
 */
const clearIncomeError = () => ({
  type: CLEAR_INCOME_ERROR,
});

// ==================== THUNK ACTIONS ====================

/**
 * Thunk action pour récupérer tous les revenus de l'utilisateur
 * 
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(getIncomes())
 */
export const getIncomes = () => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(getIncomesRequest());

      // Appel API
      const { data } = await API.get("/api/incomes");

      // Succès
      dispatch(getIncomesSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur de récupération des revenus";
      
      dispatch(getIncomesFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour ajouter un nouveau revenu
 * 
 * @param {Object} incomeData - Données du revenu à créer
 * @param {number} incomeData.montant - Montant du revenu
 * @param {string} incomeData.source - Source du revenu (salaire, investissement, etc.)
 * @param {Date} incomeData.date - Date du revenu
 * @param {string} incomeData.description - Description optionnelle
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(addIncome({
 *   montant: 2500,
 *   source: 'Salaire',
 *   date: '2024-01-15',
 *   description: 'Salaire de Janvier'
 * }))
 */
export const addIncome = (incomeData) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(addIncomeRequest());

      // Appel API
      const { data } = await API.post("/api/incomes", incomeData);

      // Succès - ajout du nouveau revenu à la liste
      dispatch(addIncomeSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'ajout du revenu";
      
      dispatch(addIncomeFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour supprimer un revenu
 * 
 * @param {string} incomeId - ID du revenu à supprimer
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(deleteIncome('income_123'))
 */
export const deleteIncome = (incomeId) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(deleteIncomeRequest());

      // Appel API
      await API.delete(`/api/incomes/${incomeId}`);

      // Succès
      dispatch(deleteIncomeSuccess(incomeId));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la suppression du revenu";
      
      dispatch(deleteIncomeFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour清除 les erreurs liées aux revenus
 * Utile après l'affichage d'une erreur à l'utilisateur
 * 
 * @returns {Function} Fonction dispatch synchrone
 * 
 * @example
 * dispatch(clearError())
 */
export const clearError = () => {
  return (dispatch) => {
    dispatch(clearIncomeError());
  };
};

