import { useEffect, useState } from "react";
import { getResumeAnalysis, type AnalysisResult } from "../services/api";
import { Spinner } from "./Spinner";

interface AnalysisViewProps {
  analysisId: string;
  onBack: () => void;
}

export function AnalysisView({ analysisId, onBack }: AnalysisViewProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pollAnalysis = async () => {
      try {
        const result = await getResumeAnalysis(analysisId);
        if (result.status === "PROCESSED" || result.status === "INVALID") {
          setAnalysis(result);
        } else {
          setTimeout(pollAnalysis, 3000);
          setAnalysis(result);
        }
      } catch (err) {
        setError("Failed to fetch analysis.");
        console.error(err);
      }
    };

    pollAnalysis();
  }, [analysisId]);

  const renderContent = () => {
    if (error) {
      return <p className="text-red-500">{error}</p>;
    }
    if (!analysis) {
      return (
        <div className="flex items-center justify-center">
          <Spinner /> <span className="ml-2">Loading analysis...</span>
        </div>
      );
    }
    if (analysis.status === "PENDING" || analysis.status === "NEW") {
      return (
        <div className="flex items-center justify-center">
          <Spinner /> <span className="ml-2">{analysis.message}</span>
        </div>
      );
    }
    if (analysis.status === "INVALID") {
      return <p className="text-red-500">{analysis.message}</p>;
    }
    if (analysis.status === "PROCESSED" && analysis.insights) {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Summary</h3>
            <p className="text-gray-700">{analysis.insights.summary}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Keyword Analysis</h3>
            <ul className="list-disc list-inside">
              {analysis.insights.keywords.map((keyword, index) => (
                <li key={index} className="text-gray-700">
                  {keyword}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return <p>No insights available.</p>;
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 border rounded-lg shadow-lg bg-white">
      <button onClick={onBack} className="mb-4 text-indigo-600 hover:underline">
        &larr; Back to Upload
      </button>
      <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
      {renderContent()}
    </div>
  );
}
