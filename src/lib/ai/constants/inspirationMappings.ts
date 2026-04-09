// Map room-type keywords to inspiration slugs
export const ROOM_TO_INSPIRATION: Record<string, string> = {
  "living room": "living-room",
  "living": "living-room",
  "bedroom": "bedroom-inspiration",
  "bed room": "bedroom-inspiration",
  "dining room": "dining-inspiration",
  "dining": "dining-inspiration",
  "storage": "storage-inspiration",
  "outdoor": "outdoor-inspiration",
  "garden": "outdoor-inspiration",
  "balcony": "outdoor-inspiration",
  "office": "office-inspiration",
  "home office": "office-inspiration",
  "study": "study-room",
  "study room": "study-room",
  "guest room": "guest-room",
  "guest": "guest-room",
};

// Map inspiration slugs to category slugs for navigation
export const INSPIRATION_TO_CATEGORY: Record<string, string> = {
  "bedroom-inspiration": "beds",
  "living-room": "sofas",
  "dining-inspiration": "dining-tables",
  "storage-inspiration": "storage",
  "outdoor-inspiration": "outdoor",
  "office-inspiration": "office-furniture",
  "study-room": "office-furniture",
  "guest-room": "beds",
};
