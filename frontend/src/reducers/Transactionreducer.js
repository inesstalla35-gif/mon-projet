/**
 * @file transactionReducer.js
 */
import {
  GET_TRANSACTIONS_REQUEST, GET_TRANSACTIONS_SUCCESS, GET_TRANSACTIONS_FAIL,
  CREATE_TRANSACTION_REQUEST, CREATE_TRANSACTION_SUCCESS, CREATE_TRANSACTION_FAIL,
  UPDATE_TRANSACTION_REQUEST, UPDATE_TRANSACTION_SUCCESS, UPDATE_TRANSACTION_FAIL,
  DELETE_TRANSACTION_REQUEST, DELETE_TRANSACTION_SUCCESS, DELETE_TRANSACTION_FAIL,
  DELETE_MANY_TRANSACTIONS_REQUEST, DELETE_MANY_TRANSACTIONS_SUCCESS, DELETE_MANY_TRANSACTIONS_FAIL,
  CLEAR_TRANSACTION_ERROR, RESET_TRANSACTION_STATE,
} from "../types/Transactiontypes";

const initialState = {
  transactions: [],
  isLoading:    false,
  error:        null,
};

export const transactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TRANSACTIONS_REQUEST:
    case CREATE_TRANSACTION_REQUEST:
    case UPDATE_TRANSACTION_REQUEST:
    case DELETE_TRANSACTION_REQUEST:
    case DELETE_MANY_TRANSACTIONS_REQUEST:
      return { ...state, isLoading: true, error: null };

    case GET_TRANSACTIONS_SUCCESS:
      return { ...state, isLoading: false, transactions: action.payload };

    case CREATE_TRANSACTION_SUCCESS:
      return { ...state, isLoading: false,
        transactions: [action.payload, ...state.transactions] };

    case UPDATE_TRANSACTION_SUCCESS:
      return { ...state, isLoading: false,
        transactions: state.transactions.map(t =>
          t._id === action.payload._id ? action.payload : t) };

    case DELETE_TRANSACTION_SUCCESS:
      return { ...state, isLoading: false,
        transactions: state.transactions.filter(t => t._id !== action.payload) };

    case DELETE_MANY_TRANSACTIONS_SUCCESS:
      return { ...state, isLoading: false,
        transactions: state.transactions.filter(t => !action.payload.includes(t._id)) };

    case GET_TRANSACTIONS_FAIL:
    case CREATE_TRANSACTION_FAIL:
    case UPDATE_TRANSACTION_FAIL:
    case DELETE_TRANSACTION_FAIL:
    case DELETE_MANY_TRANSACTIONS_FAIL:
      return { ...state, isLoading: false, error: action.payload };

    case CLEAR_TRANSACTION_ERROR:
      return { ...state, error: null };

    case RESET_TRANSACTION_STATE:
      return initialState;

    default:
      return state;
  }
};

export const selectTransactions    = s => s.transaction.transactions;
export const selectIncomes         = s => s.transaction.transactions.filter(t => t.type === "income");
export const selectExpenses        = s => s.transaction.transactions.filter(t => t.type === "expense");
export const selectTransactionLoad = s => s.transaction.isLoading;
export const selectTransactionError= s => s.transaction.error;
export const selectTotalIncome     = s => s.transaction.transactions.filter(t => t.type==="income").reduce((a,t)=>a+(t.amount||0),0);
export const selectTotalExpense    = s => s.transaction.transactions.filter(t => t.type==="expense").reduce((a,t)=>a+(t.amount||0),0);
export const selectBalance         = s => selectTotalIncome(s) - selectTotalExpense(s);