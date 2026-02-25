/**
 * @file objectiveReducer.js
 */

import {
  GET_OBJECTIVES_REQUEST, GET_OBJECTIVES_SUCCESS, GET_OBJECTIVES_FAIL,
  CREATE_OBJECTIVE_REQUEST, CREATE_OBJECTIVE_SUCCESS, CREATE_OBJECTIVE_FAIL,
  UPDATE_OBJECTIVE_REQUEST, UPDATE_OBJECTIVE_SUCCESS, UPDATE_OBJECTIVE_FAIL,
  DELETE_OBJECTIVE_REQUEST, DELETE_OBJECTIVE_SUCCESS, DELETE_OBJECTIVE_FAIL,
  CLEAR_OBJECTIVE_ERROR, RESET_OBJECTIVE_STATE,
} from "../types/objectiveTypes";

const initialState = {
  objectives: [],
  isLoading:  false,
  error:      null,
};

export const objectiveReducer = (state = initialState, action) => {
  switch (action.type) {

    case GET_OBJECTIVES_REQUEST:
    case CREATE_OBJECTIVE_REQUEST:
    case UPDATE_OBJECTIVE_REQUEST:
    case DELETE_OBJECTIVE_REQUEST:
      return { ...state, isLoading: true, error: null };

    case GET_OBJECTIVES_SUCCESS:
      return { ...state, isLoading: false, objectives: action.payload };

    case CREATE_OBJECTIVE_SUCCESS:
      return { ...state, isLoading: false, objectives: [...state.objectives, action.payload] };

    case UPDATE_OBJECTIVE_SUCCESS:
      return {
        ...state, isLoading: false,
        objectives: state.objectives.map(o =>
          o._id === action.payload._id ? action.payload : o
        ),
      };

    case DELETE_OBJECTIVE_SUCCESS:
      return {
        ...state, isLoading: false,
        objectives: state.objectives.filter(o => o._id !== action.payload),
      };

    case GET_OBJECTIVES_FAIL:
    case CREATE_OBJECTIVE_FAIL:
    case UPDATE_OBJECTIVE_FAIL:
    case DELETE_OBJECTIVE_FAIL:
      return { ...state, isLoading: false, error: action.payload };

    case CLEAR_OBJECTIVE_ERROR:
      return { ...state, error: null };

    case RESET_OBJECTIVE_STATE:
      return initialState;

    default:
      return state;
  }
};

import { createSelector } from 'reselect';

// ── Selectors de base (primitifs — pas de nouveau tableau) ────────────────────
export const selectObjectives       = (state) => state.objective.objectives;
export const selectObjectiveLoading = (state) => state.objective.isLoading;
export const selectObjectiveError   = (state) => state.objective.error;

// ── Selectors dérivés — mémorisés avec createSelector ────────────────────────
// ✅ Ne recrée un nouveau tableau QUE si state.objective.objectives change réellement
export const selectInProgressObjectives = createSelector(
  [selectObjectives],
  (objectives) => objectives.filter(o => (o.montant_actuel || 0) < (o.montant_cible || 0))
);

export const selectCompletedObjectives = createSelector(
  [selectObjectives],
  (objectives) => objectives.filter(o => (o.montant_actuel || 0) >= (o.montant_cible || 0))
);

export const selectTotalSaved = createSelector(
  [selectObjectives],
  (objectives) => objectives.reduce((t, o) => t + (o.montant_actuel || 0), 0)
);

export const selectTotalTarget = createSelector(
  [selectObjectives],
  (objectives) => objectives.reduce((t, o) => t + (o.montant_cible || 0), 0)
);