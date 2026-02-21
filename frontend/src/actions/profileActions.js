/**
 * @file profileActions.js
 * @description Actions Redux pour la gestion du profil utilisateur.
 * 
 * Ce fichier contient toutes les actions liées au profil:
 * - Récupération du profil utilisateur
 * - Création/Mise à jour du profil
 * 
 * Ces actions interagissent avec l'API backend pour gérer le cycle
 * de vie du profil de l'utilisateur.
 * 
 * @requires redux-thunk - Pour les actions asynchrones
 * @requires axios - Service API
 */

import API from "../services/api";

// Import des types d'actions
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

// ==================== ACTION CREATORS ====================

/**
 * Action creator pour le début de la récupération du profil
 * @returns {Object} Action avec type GET_PROFILE_REQUEST
 */
const getProfileRequest = () => ({
  type: GET_PROFILE_REQUEST,
});

/**
 * Action creator pour la récupération réussie du profil
 * @param {Object} profile - Données du profil
 * @returns {Object} Action avec type GET_PROFILE_SUCCESS et payload
 */
const getProfileSuccess = (profile) => ({
  type: GET_PROFILE_SUCCESS,
  payload: profile,
});

/**
 * Action creator pour l'échec de récupération du profil
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type GET_PROFILE_FAIL et payload
 */
const getProfileFail = (error) => ({
  type: GET_PROFILE_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de la mise à jour du profil
 * @returns {Object} Action avec type UPDATE_PROFILE_REQUEST
 */
const updateProfileRequest = () => ({
  type: UPDATE_PROFILE_REQUEST,
});

/**
 * Action creator pour la mise à jour réussie du profil
 * @param {Object} profile - Données du profil mises à jour
 * @returns {Object} Action avec type UPDATE_PROFILE_SUCCESS et payload
 */
const updateProfileSuccess = (profile) => ({
  type: UPDATE_PROFILE_SUCCESS,
  payload: profile,
});

/**
 * Action creator pour l'échec de la mise à jour du profil
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type UPDATE_PROFILE_FAIL et payload
 */
const updateProfileFail = (error) => ({
  type: UPDATE_PROFILE_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de la création du profil
 * @returns {Object} Action avec type CREATE_PROFILE_REQUEST
 */
const createProfileRequest = () => ({
  type: CREATE_PROFILE_REQUEST,
});

/**
 * Action creator pour la création réussie du profil
 * @param {Object} profile - Nouveau profil créé
 * @returns {Object} Action avec type CREATE_PROFILE_SUCCESS et payload
 */
const createProfileSuccess = (profile) => ({
  type: CREATE_PROFILE_SUCCESS,
  payload: profile,
});

/**
 * Action creator pour l'échec de la création du profil
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type CREATE_PROFILE_FAIL et payload
 */
const createProfileFail = (error) => ({
  type: CREATE_PROFILE_FAIL,
  payload: error,
});

/**
 * Action creator pour清除 les erreurs
 * @returns {Object} Action avec type CLEAR_PROFILE_ERROR
 */
const clearProfileError = () => ({
  type: CLEAR_PROFILE_ERROR,
});

// ==================== THUNK ACTIONS ====================

/**
 * Thunk action pour récupérer le profil de l'utilisateur
 * 
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(getProfile())
 */
export const getProfile = () => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(getProfileRequest());

      // Appel API
      const { data } = await API.get("/api/profile");

      // Succès
      dispatch(getProfileSuccess(data));
    } catch (error) {
      // Erreur - 404 peut signifier qu'aucun profil n'existe encore
      if (error.response?.status === 404) {
        // Pas de profil, ce n'est pas une erreur critique
        dispatch(getProfileFail("Aucun profil trouvé"));
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur de récupération du profil";
        
        dispatch(getProfileFail(errorMessage));
      }
    }
  };
};

/**
 * Thunk action pour créer ou mettre à jour le profil
 * Si le profil existe déjà, il sera mis à jour
 * 
 * @param {Object} profileData - Données du profil
 * @param {string} profileData.nom - Nom
 * @param {string} profileData.prenom - Prénom
 * @param {string} profileData.telephone - Téléphone
 * @param {string} profileData.adresse - Adresse
 * @param {Date} profileData.date_naissance - Date de naissance
 * @param {string} profileData.avatar - URL de l'avatar (optionnel)
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(updateProfile({
 *   nom: 'Dupont',
 *   prenom: 'Jean',
 *   telephone: '0612345678',
 *   adresse: '123 Rue de la Paix',
 *   date_naissance: '1990-01-15'
 * }))
 */
export const updateProfile = (profileData) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(updateProfileRequest());

      // Appel API
      const { data } = await API.post("/api/profile", profileData);

      // Succès - le backend retourne le profil créé/mis à jour
      dispatch(updateProfileSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour du profil";
      
      dispatch(updateProfileFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour créer un profil (si aucun profil n'existe)
 * C'est un alias de updateProfile car l'endpoint fait createOrUpdate
 * 
 * @param {Object} profileData - Données du profil à créer
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(createProfile({
 *   nom: 'Dupont',
 *   prenom: 'Jean'
 * }))
 */
export const createProfile = (profileData) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(createProfileRequest());

      // Appel API
      const { data } = await API.post("/api/profile", profileData);

      // Succès
      dispatch(createProfileSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création du profil";
      
      dispatch(createProfileFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour清除 les erreurs liées au profil
 * Utile après l'affichage d'une erreur à l'utilisateur
 * 
 * @returns {Function} Fonction dispatch synchrone
 * 
 * @example
 * dispatch(clearError())
 */
export const clearError = () => {
  return (dispatch) => {
    dispatch(clearProfileError());
  };
};

