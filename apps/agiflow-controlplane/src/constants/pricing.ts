export const permissionList = {
  ['standard_professional_monthly']: {
    name: 'Professional',
    projects: 1,
    environments: 3,
    traces: 50000,
  },
  ['standard_startup_monthly']: {
    name: 'Startup',
    projects: 3,
    environments: 4,
    traces: 500000,
  },
  ['standard_hobby_monthly']: {
    name: 'Hobby',
    projects: 1,
    environments: 1,
    traces: 2000,
  },
};

export const isHobby = (sub: any) => {
  return !sub?.id || sub.price_key === 'standard_hobby_monthly';
};
