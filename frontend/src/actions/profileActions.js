/**
 * @file profileActions.js
 * @description Actions Redux pour la gestion du profil utilisateur.
 */

import API from "../services/api";

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
  DELETE_PROFILE_REQUEST,
  DELETE_PROFILE_SUCCESS,
  DELETE_PROFILE_FAIL,
  CLEAR_PROFILE_ERROR,
  RESET_PROFILE_STATE,
} from "../types/profileTypes";

// ── Action creators privés ────────────────────────────────────────────────────
const getProfileRequest    = ()        => ({ type: GET_PROFILE_REQUEST });
const getProfileSuccess    = (profile) => ({ type: GET_PROFILE_SUCCESS,    payload: profile });
const getProfileFail       = (error)   => ({ type: GET_PROFILE_FAIL,       payload: error   });

const updateProfileRequest = ()        => ({ type: UPDATE_PROFILE_REQUEST });
const updateProfileSuccess = (profile) => ({ type: UPDATE_PROFILE_SUCCESS, payload: profile });
const updateProfileFail    = (error)   => ({ type: UPDATE_PROFILE_FAIL,    payload: error   });

const createProfileRequest = ()        => ({ type: CREATE_PROFILE_REQUEST });
const createProfileSuccess = (profile) => ({ type: CREATE_PROFILE_SUCCESS, payload: profile });
const createProfileFail    = (error)   => ({ type: CREATE_PROFILE_FAIL,    payload: error   });

const deleteProfileRequest = ()        => ({ type: DELETE_PROFILE_REQUEST });
const deleteProfileSuccess = ()        => ({ type: DELETE_PROFILE_SUCCESS });
const deleteProfileFail    = (error)   => ({ type: DELETE_PROFILE_FAIL,    payload: error   });

// ── Thunk : Récupérer le profil ───────────────────────────────────────────────
export const getProfile = () => async (dispatch) => {
  try {
    dispatch(getProfileRequest());
    const { data } = await API.get("/api/profile");
    dispatch(getProfileSuccess(data.profile));
  } catch (error) {
    if (error.response?.status === 404) {
      // Pas encore de profil — pas d'erreur critique
      dispatch(getProfileFail(null));
    } else {
      dispatch(getProfileFail(
        error.response?.data?.message || error.message || "Erreur de récupération du profil"
      ));
    }
  }
};

// ── Thunk : Créer ou mettre à jour le profil ──────────────────────────────────
export const updateProfile = (profileData) => async (dispatch) => {
  try {
    dispatch(updateProfileRequest());
    const { data } = await API.post("/api/profile", profileData);
    dispatch(updateProfileSuccess(data.profile));
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Erreur lors de la mise à jour du profil";
    dispatch(updateProfileFail(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// ── Thunk : Créer le profil (alias updateProfile) ─────────────────────────────
export const createProfile = (profileData) => async (dispatch) => {
  try {
    dispatch(createProfileRequest());
    const { data } = await API.post("/api/profile", profileData);
    dispatch(createProfileSuccess(data.profile));
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Erreur lors de la création du profil";
    dispatch(createProfileFail(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// ── Thunk : Supprimer le profil ───────────────────────────────────────────────
export const deleteProfile = () => async (dispatch) => {
  try {
    dispatch(deleteProfileRequest());
    await API.delete("/api/profile");
    dispatch(deleteProfileSuccess());
    return { success: true };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Erreur lors de la suppression du profil";
    dispatch(deleteProfileFail(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// ── Clear error ───────────────────────────────────────────────────────────────
export const clearError = () => (dispatch) => {
  dispatch({ type: CLEAR_PROFILE_ERROR });
};