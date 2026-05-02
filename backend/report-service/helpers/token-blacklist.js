const revokedTokens = new Set();

export const revokeToken = (jti) => {
  if (jti) {
    revokedTokens.add(jti);
  }
};

export const isTokenRevoked = (jti) => {
  if (!jti) {
    return false;
  }

  return revokedTokens.has(jti);
};

export const clearTokenBlacklist = () => {
  revokedTokens.clear();
};
