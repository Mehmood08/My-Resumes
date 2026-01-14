import axios from "axios";

// Base URL of your backend
const API_URL = import.meta.env.VITE_API_URL + "/api/resume";

// POST - save resume
export const saveResume = async (resumeData) => {
  try {
    const response = await axios.post(API_URL, resumeData);
    return response.data;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw error;
  }
};

// GET - fetch resume
export const fetchResume = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // JSON object of saved resume
  } catch (error) {
    console.error("Error fetching resume:", error);
    throw error;
  }
};
