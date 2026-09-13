import { create } from "zustand";
import { parseJwt } from "../utils/auth";

const useUserStore = create((set) => ({
  token: null,
  user: null,
  setToken: (token) =>
    set(() => ({
      token,
      user: token ? parseJwt(token) : null,
    })),
  setUser: (user) => set({ user }),
  resetUser: () => set({ token: null, user: null }),
}));

export default useUserStore;
