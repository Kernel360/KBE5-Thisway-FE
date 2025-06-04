import { create } from "zustand";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const useUserStore = create((set) => ({
  token: null,
  user: null,
  setToken: (token) =>
    set((state) => ({
      token,
      user: token ? parseJwt(token) : null,
    })),
  setUser: (user) => set({ user }),
  resetUser: () => set({ token: null, user: null }),
}));

export default useUserStore;
