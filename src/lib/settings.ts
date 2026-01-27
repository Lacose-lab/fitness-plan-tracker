import { loadState, saveState, type Settings } from "./storage";

export function getSettings(): Settings {
  return loadState().settings;
}

export function updateSettings(patch: Partial<Settings>) {
  const state = loadState();
  state.settings = { ...state.settings, ...patch };
  saveState(state);
}
