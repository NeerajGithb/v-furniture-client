import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "@/components/NavigationLoader/useNavigate";

export const useLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return async () => {
    // Navigate away first
    navigate.push("/");
    
    // Call logout (handles everything: server logout, query clearing, state clearing, localStorage)
    await logout();
  };
};