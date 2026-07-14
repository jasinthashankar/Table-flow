import { create } from 'zustand';
import tableService from '../services/tableService';

const useTableStore = create((set) => ({
  tables: [],
  currentTable: null,
  isLoading: false,
  error: null,

  fetchTables: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tableService.getTables(params);
      set({ tables: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to load tables', isLoading: false });
      throw err;
    }
  },

  fetchTableDetails: async (id) => {
    set({ isLoading: true, error: null, currentTable: null });
    try {
      const response = await tableService.getTable(id);
      set({ currentTable: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to load table details', isLoading: false });
      throw err;
    }
  },

  createTable: async (tableData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tableService.createTable(tableData);
      set((state) => ({
        tables: [...state.tables, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to create table', isLoading: false });
      throw err;
    }
  },

  updateTable: async (id, tableData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tableService.updateTable(id, tableData);
      set((state) => ({
        tables: state.tables.map((t) => (t._id === id ? response.data : t)),
        currentTable: state.currentTable?._id === id ? response.data : state.currentTable,
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to update table', isLoading: false });
      throw err;
    }
  },

  deactivateTable: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tableService.deactivateTable(id);
      set((state) => ({
        tables: state.tables.map((t) => (t._id === id ? response.data : t)),
        currentTable: state.currentTable?._id === id ? response.data : state.currentTable,
        isLoading: false
      }));
      return response.data;
    } catch (err) {
      set({ error: err.message || 'Failed to deactivate table', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null })
}));

export default useTableStore;
