import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentUser, getApiErrorMessage, loginUser } from '../services/api';
import {
  clearSession,
  getStoredUser,
  getToken,
  setRefreshToken,
  setSession,
  setStoredUser,
  setToken,
} from '../utils/auth';
import { normalizeRoleFromBackend } from '../utils/roles';

const AuthContext = createContext(null);

const buildUserFromProfile = (profile) => {
  const backendRoles = profile?.roles || [];

  return {
    username: profile?.username || '',
    email: profile?.email || '',
    role: normalizeRoleFromBackend(backendRoles),
    backendRoles,
    claims: profile?.claims || {},
  };
};

const formatLoginError = (error) => {
  const message = getApiErrorMessage(error, 'Nom d utilisateur ou mot de passe incorrect.');
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('disabled') ||
    normalizedMessage.includes('inactive') ||
    normalizedMessage.includes('not fully set up') ||
    normalizedMessage.includes('approve')
  ) {
    return 'Votre compte est en attente de validation par un administrateur.';
  }

  return message;
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await fetchCurrentUser();
        const nextUser = buildUserFromProfile(profile);
        if (mounted) {
          setUser(nextUser);
          setStoredUser(nextUser);
        }
      } catch {
        clearSession();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);

    try {
      const tokenPayload = await loginUser(username, password);
      setToken(tokenPayload.access_token);
      setRefreshToken(tokenPayload.refresh_token);
      const profile = await fetchCurrentUser();
      const nextUser = buildUserFromProfile(profile);

      setSession({
        accessToken: tokenPayload.access_token,
        refreshToken: tokenPayload.refresh_token,
        user: nextUser,
      });
      setUser(nextUser);

      return { success: true, user: nextUser };
    } catch (error) {
      clearSession();
      setUser(null);
      return {
        success: false,
        error: formatLoginError(error),
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
};
