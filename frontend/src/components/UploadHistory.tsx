import { useEffect, useState } from "react";
import { getUploadHistory, type UploadHistoryItem } from "../services/api";

interface UploadHistoryProps {
  onSelectAnalysis: (id: string) => void;
}

export function UploadHistory({ onSelectAnalysis }: UploadHistoryProps) {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getUploadHistory();
        setHistory(data);
      } catch (err) {
        setError("Failed to load upload history.");
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-6 p-8 border rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Upload History</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-3">
        {history.map((item) => (
          <li
            key={item.id}
            className="p-3 border rounded-md flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{item.fileName}</p>
              <p className="text-sm text-gray-500">Status: {item.status}</p>
            </div>
            <button
              onClick={() => onSelectAnalysis(item.id)}
              className="text-indigo-600 hover:underline text-sm"
            >
              View Analysis
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
