import { useState, type FormEvent, type ChangeEvent, useRef } from "react";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { uploadResume } from "../utils/api-service";

export interface UploadFormProps {
  onUploadSuccess: (analysisId: string) => void;
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setModalContent({
          title: "Invalid File Type",
          message: "Please upload a PDF file.",
        });
        setIsModalOpen(true);
        setResumeFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setResumeFile(file);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resumeFile || !jobUrl) {
      setModalContent({
        title: "Missing Information",
        message: "Please select a resume file and provide a job URL.",
      });
      setIsModalOpen(true);
      return;
    }

    if (!isValidUrl(jobUrl)) {
      setModalContent({
        title: "Invalid URL",
        message: "Please enter a valid job description URL.",
      });
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const { id } = await uploadResume(resumeFile, jobUrl);
      onUploadSuccess(id);
    } catch (error) {
      setModalContent({
        title: "Upload Failed",
        message:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
      >
        <p>{modalContent.message}</p>
      </Modal>
      <div className="max-w-xl mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
        <h1 className="text-3xl font-bold text-center mb-2">Resume Analyzer</h1>
        <p className="text-gray-600 text-center mb-6">
          Upload your resume and a job description link to get AI-powered
          insights.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="resume-file"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Resume (.pdf only)
            </label>
            <input
              ref={fileInputRef}
              id="resume-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm cursor-pointer text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              required
            />
          </div>
          <div>
            <label
              htmlFor="job-url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Job Description URL
            </label>
            <input
              id="job-url"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center cursor-pointer py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner />
                Analyzing...
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </form>
      </div>
    </>
  );
}
