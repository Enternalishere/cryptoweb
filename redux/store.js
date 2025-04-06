import { configureStore, createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    weather: {},
    crypto: {},
    news: [],
    favorites: { cities: [], cryptos: [] },
    notifications: [],
    loading: false,
    error: null,
  },
  reducers: {
    setWeather: (state, action) => { state.weather = action.payload; },
    setCrypto: (state, action) => { state.crypto = action.payload; },
    setNews: (state, action) => { state.news = action.payload; },
    addFavorite: (state, action) => {
      const { type, item } = action.payload;
      if (!state.favorites[type].includes(item)) state.favorites[type].push(item);
    },
    addNotification: (state, action) => { state.notifications.unshift(action.payload); },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setWeather, setCrypto, setNews, addFavorite, addNotification, setLoading, setError } = appSlice.actions;
export const store = configureStore({ reducer: appSlice.reducer });