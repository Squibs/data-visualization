import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {},
});

// use custom hooks 'useAppDispatch' & 'useAppSelector' now instead
// https://react-redux.js.org/using-react-redux/usage-with-typescript
// https://chrisfrew.in/blog/typescript-gatsby-and-redux-toolkit/

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
