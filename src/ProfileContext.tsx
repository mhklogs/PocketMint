import { createContext, useContext } from "react";
import { UserProfile } from "./types";

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
}

export const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => {},
});

export const useProfile = () => useContext(ProfileContext);
