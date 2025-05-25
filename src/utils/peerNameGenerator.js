const verbs = [
  "Jumping", "Running", "Dancing", "Singing", "Crawling",
  "Flying", "Hopping", "Swimming", "Walking", "Rolling",
  "Climbing", "Slithering",
];

const animals = [
  "bear", "elephant", "fox", "frog", "hen",
  "hippo", "lion", "owl", "panda", "rabbit",
];

export const generatePeerName = () => {
  const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  return `${randomVerb} ${randomAnimal}`;
}; 