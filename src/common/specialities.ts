export const SPECIALITIES = ['medecine', 'dentaire', 'pharmacie'] as const;

export type Speciality = (typeof SPECIALITIES)[number];
