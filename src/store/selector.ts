import {
  TypedUseSelectorHook,
  useSelector as useSelectorOriginal,
} from "react-redux";
import { State } from ".";

// Partially monomorphise useSelector with State
export const useSelector: TypedUseSelectorHook<State> = useSelectorOriginal;
