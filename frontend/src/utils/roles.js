const backendToFrontendRoleMap = {
  student: 'etudiant',
  teacher: 'enseignant',
  admin: 'admin',
};

const frontendToBackendRoleMap = {
  etudiant: 'student',
  enseignant: 'teacher',
  admin: 'admin',
};

const rolePriority = ['admin', 'teacher', 'student'];

export const normalizeRoleFromBackend = (roles = []) => {
  const matchedRole = rolePriority.find((role) => roles.includes(role));
  return backendToFrontendRoleMap[matchedRole] || 'etudiant';
};

export const toBackendRole = (role) => {
  return frontendToBackendRoleMap[role] || 'student';
};

export const getRoleLabel = (role) => {
  switch (role) {
    case 'enseignant':
      return 'Enseignant';
    case 'admin':
      return 'Administrateur';
    case 'etudiant':
    default:
      return 'Étudiant';
  }
};

export const getRoleIcon = (role) => {
  switch (role) {
    case 'enseignant':
      return '👨‍🏫';
    case 'admin':
      return '👨‍💼';
    case 'etudiant':
    default:
      return '👨‍🎓';
  }
};
