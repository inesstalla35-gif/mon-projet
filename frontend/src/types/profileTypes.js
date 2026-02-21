/**
 * @file profileTypes.js
 * @description Définit les constantes de types d'actions pour la gestion du profil utilisateur.
 * 
 * Ce fichier centralise tous les types d'actions liées au profil:
 * - Récupération du profil utilisateur
 * - Création/Mise à jour du profil
 * 
 * @example
 * import { GET_PROFILE_REQUEST } from '../types/profileTypes';
 * dispatch({ type: GET_PROFILE_REQUEST });
 */

// ==================== GET PROFILE TYPES ====================

/**
 * Action déclenchée au début de la récupération du profil
 * Signale que la requête est en cours
 */
export const GET_PROFILE_REQUEST = "profile/GET_PROFILE_REQUEST";

/**
 * Action déclenchée lors de la récupération réussie du profil
 * Contient les données du profil
 */
export const GET_PROFILE_SUCCESS = "profile/GET_PROFILE_SUCCESS";

/**
 * Action déclenchée en cas d'échec de récupération du profil
 * Contient le message d'erreur
 */
export const GET_PROFILE_FAIL = "profile/GET_PROFILE_FAIL";

// ==================== UPDATE PROFILE TYPES ====================

/**
 * Action déclenchée au début de la mise à jour du profil
 * Signale que la requête est en cours
 */
export const UPDATE_PROFILE_REQUEST = "profile/UPDATE_PROFILE_REQUEST";

/**
 * Action déclenchée lors de la mise à jour réussie du profil
 * Contient les données du profil mises à jour
 */
export const UPDATE_PROFILE_SUCCESS = "profile/UPDATE_PROFILE_SUCCESS";

/**
 * Action déclenchée en cas d'échec de mise à jour du profil
 * Contient le message d'erreur
 */
export const UPDATE_PROFILE_FAIL = "profile/UPDATE_PROFILE_FAIL";

// ==================== CREATE PROFILE TYPES ====================

/**
 * Action déclenchée au début de la création du profil
 * Signale que la requête est en cours
 */
export const CREATE_PROFILE_REQUEST = "profile/CREATE_PROFILE_REQUEST";

/**
 * Action déclenchée lors de la création réussie du profil
 * Contient les données du nouveau profil
 */
export const CREATE_PROFILE_SUCCESS = "profile/CREATE_PROFILE_SUCCESS";

/**
 * Action déclenchée en cas d'échec de création du profil
 * Contient le message d'erreur
 */
export const CREATE_PROFILE_FAIL = "profile/CREATE_PROFILE_FAIL";

// ==================== CLEAR PROFILE ERROR TYPE ====================

/**
 * Action pour清除 les erreurs liées au profil
 */
export const CLEAR_PROFILE_ERROR = "profile/CLEAR_ERROR";

// ==================== RESET PROFILE STATE TYPE ====================

/**
 * Action pour réinitialiser complètement l'état du profil
 * Utile lors de la déconnexion
 */
export const RESET_PROFILE_STATE = "profile/RESET_STATE";

