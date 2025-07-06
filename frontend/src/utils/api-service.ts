const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
}

export interface AnalysisResult {
  id: string;
  status: string;
  insights?: {
    summary: string;
    keywords: string[];
  };
  message: string;
}

export const uploadResume = async (
  file: File,
  jobUrl: string
): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jobUrl", jobUrl);

  const response = await fetch(`${API_BASE_URL}/resume/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload resume.");
  }

  return response.json();
};

export const getResumeAnalysis = async (
  id: string
): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/resume/analysis/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch resume analysis.");
  }
  return response.json();
};

export const getUploadHistory = async (): Promise<UploadHistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/resume/upload-history`);
  if (!response.ok) {
    throw new Error("Failed to fetch upload history.");
  }
  return response.json();
};
