export const isAdmin = (user) => {
  return user?.roles?.includes('ROLE_ADMIN') || false;
};

export const hasRole = (user, role) => {
  return user?.roles?.includes(role) || false;
};