/**
 * @file objectiveActions.js
 * @description Actions Redux pour les objectifs financiers.
 */

import API from "../services/api";

import {
  GET_OBJECTIVES_REQUEST, GET_OBJECTIVES_SUCCESS, GET_OBJECTIVES_FAIL,
  CREATE_OBJECTIVE_REQUEST, CREATE_OBJECTIVE_SUCCESS, CREATE_OBJECTIVE_FAIL,
  UPDATE_OBJECTIVE_REQUEST, UPDATE_OBJECTIVE_SUCCESS, UPDATE_OBJECTIVE_FAIL,
  DELETE_OBJECTIVE_REQUEST, DELETE_OBJECTIVE_SUCCESS, DELETE_OBJECTIVE_FAIL,
  CLEAR_OBJECTIVE_ERROR,
} from "../types/objectiveTypes";

// ── Action creators privés ────────────────────────────────────────────────────
const getObjectivesRequest    = ()           => ({ type: GET_OBJECTIVES_REQUEST });
const getObjectivesSuccess    = (objectives) => ({ type: GET_OBJECTIVES_SUCCESS,    payload: objectives });
const getObjectivesFail       = (error)      => ({ type: GET_OBJECTIVES_FAIL,       payload: error });

const createObjectiveRequest  = ()           => ({ type: CREATE_OBJECTIVE_REQUEST });
const createObjectiveSuccess  = (objective)  => ({ type: CREATE_OBJECTIVE_SUCCESS,  payload: objective });
const createObjectiveFail     = (error)      => ({ type: CREATE_OBJECTIVE_FAIL,     payload: error });

const updateObjectiveRequest  = ()           => ({ type: UPDATE_OBJECTIVE_REQUEST });
const updateObjectiveSuccess  = (objective)  => ({ type: UPDATE_OBJECTIVE_SUCCESS,  payload: objective });
const updateObjectiveFail     = (error)      => ({ type: UPDATE_OBJECTIVE_FAIL,     payload: error });

const deleteObjectiveRequest  = ()           => ({ type: DELETE_OBJECTIVE_REQUEST });
const deleteObjectiveSuccess  = (id)         => ({ type: DELETE_OBJECTIVE_SUCCESS,  payload: id });
const deleteObjectiveFail     = (error)      => ({ type: DELETE_OBJECTIVE_FAIL,     payload: error });

// ── GET tous les objectifs ────────────────────────────────────────────────────
export const getObjectives = () => async (dispatch) => {
  try {
    dispatch(getObjectivesRequest());
    const { data } = await API.get("/api/objectives");
    dispatch(getObjectivesSuccess(data.objectives));
  } catch (error) {
    dispatch(getObjectivesFail(
      error.response?.data?.message || error.message || "Erreur de récupération"
    ));
  }
};

// ── CREATE objectif ───────────────────────────────────────────────────────────
export const createObjective = (objectiveData) => async (dispatch) => {
  try {
    dispatch(createObjectiveRequest());
    const { data } = await API.post("/api/objectives", objectiveData);
    dispatch(createObjectiveSuccess(data.objective));
    return { success: true, objective: data.objective };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Erreur lors de la création";
    dispatch(createObjectiveFail(msg));
    return { success: false, error: msg };
  }
};

// ── UPDATE objectif ───────────────────────────────────────────────────────────
export const updateObjective = (objectiveId, updateData) => async (dispatch) => {
  try {
    dispatch(updateObjectiveRequest());
    const { data } = await API.put(`/api/objectives/${objectiveId}`, updateData);
    dispatch(updateObjectiveSuccess(data.objective));
    return { success: true, objective: data.objective };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Erreur lors de la mise à jour";
    dispatch(updateObjectiveFail(msg));
    return { success: false, error: msg };
  }
};

// ── DELETE objectif ───────────────────────────────────────────────────────────
export const deleteObjective = (objectiveId) => async (dispatch) => {
  try {
    dispatch(deleteObjectiveRequest());
    await API.delete(`/api/objectives/${objectiveId}`);
    dispatch(deleteObjectiveSuccess(objectiveId));
    return { success: true };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Erreur lors de la suppression";
    dispatch(deleteObjectiveFail(msg));
    return { success: false, error: msg };
  }
};

// ── Clear error ───────────────────────────────────────────────────────────────
export const clearError = () => (dispatch) => {
  dispatch({ type: CLEAR_OBJECTIVE_ERROR });
};