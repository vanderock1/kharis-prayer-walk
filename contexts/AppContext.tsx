import { createContext, Dispatch, SetStateAction } from "react";

export type AppContextType = {
  walking: boolean;
  setWalking: Dispatch<SetStateAction<boolean>>;
  permissions: string[];
  setPermissions: Dispatch<SetStateAction<string[]>>;
};

export const AppContext = createContext<AppContextType>({
  walking: false,
  setWalking: () => {},
  permissions: [],
  setPermissions: () => {},
});
