my-react-app/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── robots.txt
│
├── src/
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Spinner/
│   │   │   └── Toast/
│   │   │
│   │   └── shared/
│   │       ├── Layout/
│   │       ├── Navbar/
│   │       ├── Sidebar/
│   │       └── Footer/
│   │
│   ├── features/
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts                # Wrapper sur useSelector/useDispatch
│   │   │   ├── services/
│   │   │   │   └── authApi.ts                # RTK Query endpoints
│   │   │   ├── store/
│   │   │   │   ├── authSlice.ts              # createSlice (state, reducers, extraReducers)
│   │   │   │   ├── authSelectors.ts          # createSelector (memoïsation)
│   │   │   │   └── authThunks.ts             # createAsyncThunk (si hors RTK Query)
│   │   │   ├── types/
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── users/
│   │   │   ├── components/
│   │   │   │   ├── UserCard.tsx
│   │   │   │   └── UserList.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useUsers.ts
│   │   │   ├── services/
│   │   │   │   └── usersApi.ts               # RTK Query endpoints
│   │   │   ├── store/
│   │   │   │   ├── usersSlice.ts
│   │   │   │   ├── usersSelectors.ts
│   │   │   │   └── usersThunks.ts
│   │   │   ├── types/
│   │   │   │   └── users.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   │   ├── dashboardSlice.ts
│   │   │   │   └── dashboardSelectors.ts
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── notifications/
│   │       ├── components/
│   │       │   └── NotificationCenter.tsx
│   │       ├── store/
│   │       │   ├── notificationsSlice.ts
│   │       │   └── notificationsSelectors.ts
│   │       └── index.ts
│   │
│   ├── store/                                # Store Redux global
│   │   ├── index.ts                          # configureStore + export store, RootState, AppDispatch
│   │   ├── rootReducer.ts                    # combineReducers de tous les slices
│   │   ├── middleware/
│   │   │   ├── errorMiddleware.ts            # Middleware custom gestion d'erreurs
│   │   │   ├── loggerMiddleware.ts           # Middleware de logging (dev)
│   │   │   └── index.ts
│   │   ├── enhancers/
│   │   │   └── monitorReducer.ts             # Enhancer custom (optionnel)
│   │   └── hooks.ts                          # useAppDispatch / useAppSelector typés
│   │
│   ├── services/
│   │   ├── api/
│   │   │   └── baseApi.ts                    # createApi (RTK Query) — base URL, headers, auth
│   │   └── apiClient.ts                      # Axios instance (si utilisé en dehors de RTK Query)
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── usePrevious.ts
│   │
│   ├── lib/
│   │   ├── axios.ts
│   │   └── i18n.ts
│   │
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   └── index.ts
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Users/
│   │   └── NotFound/
│   │
│   ├── router/
│   │   ├── index.tsx
│   │   ├── PrivateRoute.tsx
│   │   └── routes.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── themes/
│   │       ├── light.ts
│   │       └── dark.ts
│   │
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── common.types.ts
│   │   ├── store.types.ts                    # RootState, AppDispatch, AppThunk
│   │   └── env.d.ts
│   │
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── formatCurrency.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── tests/
│   ├── e2e/
│   │   └── auth.spec.ts
│   ├── store/
│   │   ├── authSlice.test.ts                 # Tests unitaires des slices
│   │   └── usersSlice.test.ts
│   └── setup.ts
│
├── .env
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── package.json
