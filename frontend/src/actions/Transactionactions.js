/**
 * @file transactionActions.js
 */
import API from "../services/api";
import {
  GET_TRANSACTIONS_REQUEST, GET_TRANSACTIONS_SUCCESS, GET_TRANSACTIONS_FAIL,
  CREATE_TRANSACTION_REQUEST, CREATE_TRANSACTION_SUCCESS, CREATE_TRANSACTION_FAIL,
  UPDATE_TRANSACTION_REQUEST, UPDATE_TRANSACTION_SUCCESS, UPDATE_TRANSACTION_FAIL,
  DELETE_TRANSACTION_REQUEST, DELETE_TRANSACTION_SUCCESS, DELETE_TRANSACTION_FAIL,
  DELETE_MANY_TRANSACTIONS_REQUEST, DELETE_MANY_TRANSACTIONS_SUCCESS, DELETE_MANY_TRANSACTIONS_FAIL,
  CLEAR_TRANSACTION_ERROR,
} from "../types/Transactiontypes";

// ── GET toutes les transactions ──────────────────────────────────────────────
export const getTransactions = () => async (dispatch) => {
  try {
    dispatch({ type: GET_TRANSACTIONS_REQUEST });
    const { data } = await API.get("/api/transaction/all");
    dispatch({ type: GET_TRANSACTIONS_SUCCESS, payload: data.transactions || [] });
  } catch (error) {
    dispatch({ type: GET_TRANSACTIONS_FAIL,
      payload: error.response?.data?.message || error.message || "Erreur récupération" });
  }
};

// ── CREATE income ou expense ─────────────────────────────────────────────────
export const createTransaction = (type, payload) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_TRANSACTION_REQUEST });
    const endpoint = type === "income" ? "/api/transaction/income" : "/api/transaction/expense";
    const { data } = await API.post(endpoint, payload);
    const tx = { ...(data.transaction || data.income || data.expense || data), type };
    dispatch({ type: CREATE_TRANSACTION_SUCCESS, payload: tx });
    return { success: true, transaction: tx };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Erreur création";
    dispatch({ type: CREATE_TRANSACTION_FAIL, payload: msg });
    return { success: false, error: msg };
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
export const updateTransaction = (type, id, payload) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_TRANSACTION_REQUEST });
    const { data } = await API.put(`/api/transaction/${type}/${id}`, payload);
    const tx = { ...(data.transaction || data), type };
    dispatch({ type: UPDATE_TRANSACTION_SUCCESS, payload: tx });
    return { success: true, transaction: tx };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Erreur modification";
    dispatch({ type: UPDATE_TRANSACTION_FAIL, payload: msg });
    return { success: false, error: msg };
  }
};

// ── DELETE one ───────────────────────────────────────────────────────────────
export const deleteTransaction = (type, id) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_TRANSACTION_REQUEST });
    await API.delete(`/api/transaction/${type}/${id}`);
    dispatch({ type: DELETE_TRANSACTION_SUCCESS, payload: id });
    return { success: true };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Erreur suppression";
    dispatch({ type: DELETE_TRANSACTION_FAIL, payload: msg });
    return { success: false, error: msg };
  }
};

// ── DELETE many ──────────────────────────────────────────────────────────────
export const deleteManyTransactions = (type, ids) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_MANY_TRANSACTIONS_REQUEST });
    await API.delete(`/api/transaction/${type}`, { data: { ids } });
    dispatch({ type: DELETE_MANY_TRANSACTIONS_SUCCESS, payload: ids });
    return { success: true };
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Erreur suppression";
    dispatch({ type: DELETE_MANY_TRANSACTIONS_FAIL, payload: msg });
    return { success: false, error: msg };
  }
};

// ── Import revenus profil → transactions ────────────────────────────────────
export const importProfileRevenues = () => async (dispatch) => {
  try {
    await API.post("/api/transaction/import-profile");
    // Re-fetch après import
    dispatch(getTransactions());
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

export const clearTransactionError = () => (dispatch) =>
  dispatch({ type: CLEAR_TRANSACTION_ERROR });