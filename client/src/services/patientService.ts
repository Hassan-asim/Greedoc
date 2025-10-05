import api from "./api";
import { Patient, PatientCredentials, PatientData } from "../types";

const patientService = {
  getPatients: async (): Promise<Patient[]> => {
    try {
      console.log("Fetching patients...");
      const response = await api.get("/patients");
      console.log("Patients fetched successfully:", response.data);

      // Handle the response structure properly
      if (response.data && response.data.data && response.data.data.patients) {
        return response.data.data.patients;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn("Unexpected response structure:", response.data);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  },

  createPatient: async (patientData: PatientData): Promise<PatientCredentials> => {
    try {
      const response = await api.post("/patients", patientData);
      return response.data.data;
    } catch (error: any) {
      console.error("Error creating patient:", error);
      throw error;
    }
  },

  getPatient: async (patientId: string): Promise<Patient> => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching patient:", error);
      throw error;
    }
  },

  getPatientCredentials: async (patientId: string): Promise<PatientCredentials> => {
    try {
      const response = await api.get(`/patients/${patientId}/credentials`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching patient credentials:", error);
      throw error;
    }
  },

  resetPatientPassword: async (patientId: string): Promise<PatientCredentials> => {
    try {
      const response = await api.post(`/patients/${patientId}/reset-password`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error resetting patient password:", error);
      throw error;
    }
  },
};

export default patientService;
