# React Technical Reference

## Virtual DOM and Reconciliation
React uses an in-memory Virtual DOM representation. When component state or props change, React constructs a new Virtual DOM tree and performs a diffing algorithm (Reconciliation) against the previous tree to minimize real DOM mutations.

## React Component Lifecycle and Hooks
Hooks enable functional components to manage state and side effects. `useState` manages local state, `useEffect` handles side effects and cleanup, `useMemo` memoizes expensive calculations, and `useCallback` preserves function reference identity across renders.

## State Management Patterns
React supports unidirectional data flow. Local state is managed via `useState` or `useReducer`. Context API provides prop-drilling avoidance for global state. External libraries like Redux or Zustand manage complex shared application state using immutable state trees and actions.

## Performance Optimization
Component re-renders are optimized using `React.memo` for shallow prop comparisons, key prop stability in dynamic lists, code splitting with `React.lazy` and `Suspense`, and avoiding inline function definitions inside render loops.
