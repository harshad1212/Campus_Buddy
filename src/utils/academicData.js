// src/utils/academicData.js

export const streamsList = [
  "CE-FOT1 (MU)",
  "CE-FOT2 (MU)",
  "IT (MU)",
  "ME (MU)",
  "EE (MU)",
  "ECE (MU)",
  "CSE (MU)",
  "AE (MU)",
  "BT (MU)",
  "CH (MU)"
];

export const semestersList = [1, 2, 3, 4, 5, 6, 7, 8];

// Generate subjects dynamically for each stream-semester combination
export const generateSubjects = () => {
  const data = {};
  streamsList.forEach((stream) => {
    data[stream] = {};
    semestersList.forEach((sem) => {
      data[stream][sem] = [];
      for (let i = 1; i <= 6; i++) {
        data[stream][sem].push(`Subject ${i} (${stream}-S${sem})`);
      }
    });
  });
  return data;
};

// Precomputed subjects object
export const resourcesData = generateSubjects();
