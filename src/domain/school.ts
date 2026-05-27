const schools = [ 'QC Career School', 'QC Makeup Academy', 'QC Design School', 'QC Event School', 'QC Pet Studies', 'QC Wellness Studies', 'Winghill Writing School', 'Paw Parent Academy' ];

export type School = typeof schools[number];

const schoolSet = new Set<School>(schools);

export const isSchool = (obj: unknown): obj is School => {
  return typeof obj === 'string' && schoolSet.has(obj);
};
