const SESSION_KEYS = {
  USER_SESSION: 'agiflow-user-session',
  SESSION_DATA: 'agiflow-session-data',
};
export const setUserSession = (sessionId: string, token: string) => {
  sessionStorage.setItem(SESSION_KEYS.USER_SESSION, JSON.stringify({ sessionId, token }));
};

export const getUserSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEYS.USER_SESSION) || '');
  } catch (_) {
    return;
  }
};

export const setSessionData = (data: any) => {
  sessionStorage.setItem(SESSION_KEYS.SESSION_DATA, JSON.stringify(data));
};

export const getSessionData = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEYS.SESSION_DATA) || '');
  } catch (_) {
    return;
  }
};
