/**
 * @file profileReducer.js
 * @description Reducer Redux pour la gestion du profil utilisateur.
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
  DELETE_PROFILE_REQUEST,
  DELETE_PROFILE_SUCCESS,
  DELETE_PROFILE_FAIL,
  CLEAR_PROFILE_ERROR,
  RESET_PROFILE_STATE,
} from "../types/profileTypes";

const initialState = {
  profile:   null,
  isLoading: false,
  error:     null,
};

export const profileReducer = (state = initialState, action) => {
  switch (action.type) {

    // ── GET ──────────────────────────────────────────────────────────────────
    case GET_PROFILE_REQUEST:
      return { ...state, isLoading: true, error: null };

    case GET_PROFILE_SUCCESS:
      return { ...state, isLoading: false, profile: action.payload, error: null };

    case GET_PROFILE_FAIL:
      return { ...state, isLoading: false, error: action.payload };

    // ── UPDATE ───────────────────────────────────────────────────────────────
    case UPDATE_PROFILE_REQUEST:
      return { ...state, isLoading: true, error: null };

    case UPDATE_PROFILE_SUCCESS:
      return { ...state, isLoading: false, profile: action.payload, error: null };

    case UPDATE_PROFILE_FAIL:
      return { ...state, isLoading: false, error: action.payload };

    // ── CREATE ───────────────────────────────────────────────────────────────
    case CREATE_PROFILE_REQUEST:
      return { ...state, isLoading: true, error: null };

    case CREATE_PROFILE_SUCCESS:
      return { ...state, isLoading: false, profile: action.payload, error: null };

    case CREATE_PROFILE_FAIL:
      return { ...state, isLoading: false, error: action.payload };

    // ── DELETE ───────────────────────────────────────────────────────────────
    case DELETE_PROFILE_REQUEST:
      return { ...state, isLoading: true, error: null };

    case DELETE_PROFILE_SUCCESS:
      return { ...state, isLoading: false, profile: null, error: null };

    case DELETE_PROFILE_FAIL:
      return { ...state, isLoading: false, error: action.payload };

    // ── UTILS ────────────────────────────────────────────────────────────────
    case CLEAR_PROFILE_ERROR:
      return { ...state, error: null };

    case RESET_PROFILE_STATE:
      return initialState;

    default:
      return state;
  }
};

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectProfile        = (state) => state.profile.profile;
export const selectProfileLoading = (state) => state.profile.isLoading;
export const selectProfileError   = (state) => state.profile.error;
export const selectHasProfile     = (state) => !!state.profile.profile;