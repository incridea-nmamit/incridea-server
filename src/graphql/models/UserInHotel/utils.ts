const checkIfAccommodationMember = (id: number) => {
  const accommodationMembers = [1, 2, 3, 14];
  return accommodationMembers.find((memberId) => memberId === id);
};

const checkIfPublicityMember = (id: number) => {
  const publicityMembers = [404, 533, 538, 2721, 2941, 95];
  return publicityMembers.find((memberId) => memberId === id);
};

export { checkIfAccommodationMember, checkIfPublicityMember };
