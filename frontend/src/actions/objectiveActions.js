/**
 * @file objectiveActions.js
 * @description Actions Redux pour la gestion des objectifs financiers.
 * 
 * Ce fichier contient toutes les actions liées aux objectifs:
 * - Récupération de la liste des objectifs
 * - Création d'un nouvel objectif
 * - Mise à jour d'un objectif (optionnel)
 * - Suppression d'un objectif (optionnel)
 * 
 * Ces actions interagissent avec l'API backend pour gérer le cycle
 * de vie des objectifs financiers de l'utilisateur.
 * 
 * @requires redux-thunk - Pour les actions asynchrones
 * @requires axios - Service API
 */

import API from "../services/api";

// Import des types d'actions
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

// ==================== ACTION CREATORS ====================

/**
 * Action creator pour le début de la récupération des objectifs
 * @returns {Object} Action avec type GET_OBJECTIVES_REQUEST
 */
const getObjectivesRequest = () => ({
  type: GET_OBJECTIVES_REQUEST,
});

/**
 * Action creator pour la récupération réussie des objectifs
 * @param {Array} objectives - Tableau des objectifs
 * @returns {Object} Action avec type GET_OBJECTIVES_SUCCESS et payload
 */
const getObjectivesSuccess = (objectives) => ({
  type: GET_OBJECTIVES_SUCCESS,
  payload: objectives,
});

/**
 * Action creator pour l'échec de récupération des objectifs
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type GET_OBJECTIVES_FAIL et payload
 */
const getObjectivesFail = (error) => ({
  type: GET_OBJECTIVES_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de la création d'un objectif
 * @returns {Object} Action avec type CREATE_OBJECTIVE_REQUEST
 */
const createObjectiveRequest = () => ({
  type: CREATE_OBJECTIVE_REQUEST,
});

/**
 * Action creator pour la création réussie d'un objectif
 * @param {Object} objective - Nouvel objectif créé
 * @returns {Object} Action avec type CREATE_OBJECTIVE_SUCCESS et payload
 */
const createObjectiveSuccess = (objective) => ({
  type: CREATE_OBJECTIVE_SUCCESS,
  payload: objective,
});

/**
 * Action creator pour l'échec de la création d'un objectif
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type CREATE_OBJECTIVE_FAIL et payload
 */
const createObjectiveFail = (error) => ({
  type: CREATE_OBJECTIVE_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de la mise à jour d'un objectif
 * @returns {Object} Action avec type UPDATE_OBJECTIVE_REQUEST
 */
const updateObjectiveRequest = () => ({
  type: UPDATE_OBJECTIVE_REQUEST,
});

/**
 * Action creator pour la mise à jour réussie d'un objectif
 * @param {Object} objective - Objectif mis à jour
 * @returns {Object} Action avec type UPDATE_OBJECTIVE_SUCCESS et payload
 */
const updateObjectiveSuccess = (objective) => ({
  type: UPDATE_OBJECTIVE_SUCCESS,
  payload: objective,
});

/**
 * Action creator pour l'échec de la mise à jour d'un objectif
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type UPDATE_OBJECTIVE_FAIL et payload
 */
const updateObjectiveFail = (error) => ({
  type: UPDATE_OBJECTIVE_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de la suppression d'un objectif
 * @returns {Object} Action avec type DELETE_OBJECTIVE_REQUEST
 */
const deleteObjectiveRequest = () => ({
  type: DELETE_OBJECTIVE_REQUEST,
});

/**
 * Action creator pour la suppression réussie d'un objectif
 * @param {string} objectiveId - ID de l'objectif supprimé
 * @returns {Object} Action avec type DELETE_OBJECTIVE_SUCCESS et payload
 */
const deleteObjectiveSuccess = (objectiveId) => ({
  type: DELETE_OBJECTIVE_SUCCESS,
  payload: objectiveId,
});

/**
 * Action creator pour l'échec de la suppression d'un objectif
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type DELETE_OBJECTIVE_FAIL et payload
 */
const deleteObjectiveFail = (error) => ({
  type: DELETE_OBJECTIVE_FAIL,
  payload: error,
});

/**
 * Action creator pour清除 les erreurs
 * @returns {Object} Action avec type CLEAR_OBJECTIVE_ERROR
 */
const clearObjectiveError = () => ({
  type: CLEAR_OBJECTIVE_ERROR,
});

// ==================== THUNK ACTIONS ====================

/**
 * Thunk action pour récupérer tous les objectifs de l'utilisateur
 * 
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(getObjectives())
 */
export const getObjectives = () => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(getObjectivesRequest());

      // Appel API
      const { data } = await API.get("/api/objectives");

      // Succès
      dispatch(getObjectivesSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur de récupération des objectifs";
      
      dispatch(getObjectivesFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour créer un nouvel objectif
 * 
 * @param {Object} objectiveData - Données de l'objectif à créer
 * @param {string} objectiveData.nom - Nom de l'objectif
 * @param {number} objectiveData.montant_cible - Montant cible à atteindre
 * @param {number} objectiveData.montant_actuel - Montant actuel économisé
 * @param {Date} objectiveData.date_echeance - Date d'échéance
 * @param {string} objectiveData.description - Description optionnelle
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(createObjective({
 *   nom: 'Vacances',
 *   montant_cible: 3000,
 *   montant_actuel: 1500,
 *   date_echeance: '2024-06-01',
 *   description: 'Vacances d\'été'
 * }))
 */
export const createObjective = (objectiveData) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(createObjectiveRequest());

      // Appel API
      const { data } = await API.post("/api/objectives", objectiveData);

      // Succès - ajout du nouvel objectif à la liste
      dispatch(createObjectiveSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création de l'objectif";
      
      dispatch(createObjectiveFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour mettre à jour un objectif existant
 * 
 * @param {string} objectiveId - ID de l'objectif à mettre à jour
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(updateObjective('objective_123', {
 *   montant_actuel: 2000
 * }))
 */
export const updateObjective = (objectiveId, updateData) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(updateObjectiveRequest());

      // Appel API
      const { data } = await API.put(`/api/objectives/${objectiveId}`, updateData);

      // Succès
      dispatch(updateObjectiveSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour de l'objectif";
      
      dispatch(updateObjectiveFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour supprimer un objectif
 * 
 * @param {string} objectiveId - ID de l'objectif à supprimer
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(deleteObjective('objective_123'))
 */
export const deleteObjective = (objectiveId) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(deleteObjectiveRequest());

      // Appel API
      await API.delete(`/api/objectives/${objectiveId}`);

      // Succès
      dispatch(deleteObjectiveSuccess(objectiveId));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la suppression de l'objectif";
      
      dispatch(deleteObjectiveFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour清除 les erreurs liées aux objectifs
 * Utile après l'affichage d'une erreur à l'utilisateur
 * 
 * @returns {Function} Fonction dispatch synchrone
 * 
 * @example
 * dispatch(clearError())
 */
export const clearError = () => {
  return (dispatch) => {
    dispatch(clearObjectiveError());
  };
};

