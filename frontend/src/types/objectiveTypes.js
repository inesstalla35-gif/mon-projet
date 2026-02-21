/**
 * @file objectiveTypes.js
 * @description Définit les constantes de types d'actions pour la gestion des objectifs financiers.
 * 
 * Ce fichier centralise tous les types d'actions liées aux objectifs:
 * - Récupération de la liste des objectifs
 * - Création d'un nouvel objectif
 * - Mise à jour d'un objectif (optionnel)
 * - Suppression d'un objectif (optionnel)
 * 
 * @example
 * import { GET_OBJECTIVES_REQUEST } from '../types/objectiveTypes';
 * dispatch({ type: GET_OBJECTIVES_REQUEST });
 */

// ==================== GET OBJECTIVES TYPES ====================

/**
 * Action déclenchée au début de la récupération des objectifs
 * Signale que la requête est en cours
 */
export const GET_OBJECTIVES_REQUEST = "objective/GET_OBJECTIVES_REQUEST";

/**
 * Action déclenchée lors de la récupération réussie des objectifs
 * Contient le tableau des objectifs
 */
export const GET_OBJECTIVES_SUCCESS = "objective/GET_OBJECTIVES_SUCCESS";

/**
 * Action déclenchée en cas d'échec de récupération des objectifs
 * Contient le message d'erreur
 */
export const GET_OBJECTIVES_FAIL = "objective/GET_OBJECTIVES_FAIL";

// ==================== CREATE OBJECTIVE TYPES ====================

/**
 * Action déclenchée au début de la création d'un objectif
 * Signale que la requête est en cours
 */
export const CREATE_OBJECTIVE_REQUEST = "objective/CREATE_OBJECTIVE_REQUEST";

/**
 * Action déclenchée lors de la création réussie d'un objectif
 * Contient le nouvel objectif créé
 */
export const CREATE_OBJECTIVE_SUCCESS = "objective/CREATE_OBJECTIVE_SUCCESS";

/**
 * Action déclenchée en cas d'échec de la création d'un objectif
 * Contient le message d'erreur
 */
export const CREATE_OBJECTIVE_FAIL = "objective/CREATE_OBJECTIVE_FAIL";

// ==================== UPDATE OBJECTIVE TYPES (Optionnel) ====================

/**
 * Action déclenchée au début de la mise à jour d'un objectif
 */
export const UPDATE_OBJECTIVE_REQUEST = "objective/UPDATE_OBJECTIVE_REQUEST";

/**
 * Action déclenchée lors de la mise à jour réussie d'un objectif
 * Contient l'objectif mis à jour
 */
export const UPDATE_OBJECTIVE_SUCCESS = "objective/UPDATE_OBJECTIVE_SUCCESS";

/**
 * Action déclenchée en cas d'échec de la mise à jour d'un objectif
 */
export const UPDATE_OBJECTIVE_FAIL = "objective/UPDATE_OBJECTIVE_FAIL";

// ==================== DELETE OBJECTIVE TYPES (Optionnel) ====================

/**
 * Action déclenchée au début de la suppression d'un objectif
 */
export const DELETE_OBJECTIVE_REQUEST = "objective/DELETE_OBJECTIVE_REQUEST";

/**
 * Action déclenchée lors de la suppression réussie d'un objectif
 * Contient l'ID de l'objectif supprimé
 */
export const DELETE_OBJECTIVE_SUCCESS = "objective/DELETE_OBJECTIVE_SUCCESS";

/**
 * Action déclenchée en cas d'échec de la suppression d'un objectif
 */
export const DELETE_OBJECTIVE_FAIL = "objective/DELETE_OBJECTIVE_FAIL";

// ==================== CLEAR OBJECTIVE ERROR TYPE ====================

/**
 * Action pour清除 les erreurs liées aux objectifs
 */
export const CLEAR_OBJECTIVE_ERROR = "objective/CLEAR_ERROR";

// ==================== RESET OBJECTIVE STATE TYPE ====================

/**
 * Action pour réinitialiser complètement l'état des objectifs
 * Utile lors de la déconnexion
 */
export const RESET_OBJECTIVE_STATE = "objective/RESET_STATE";

