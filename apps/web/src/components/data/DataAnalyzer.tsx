import { useState, useRef } from 'react';
import Papa from 'papaparse';

interface AnalysisResult {
  summary: string;
  charts: ChartData[];
  insights: string[];
  statistics: Record<string, any>;
}

interface ChartData {
  type: 'bar' | 'line' | 'scatter' | 'pie';
  title: string;
  data: any[];
  xKey?: string;
  yKey?: string;
}

export default function DataAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a CSV or Excel file');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Parse CSV
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            // Send to backend for Gemini analysis
            const response = await fetch('http://localhost:3001/api/data/analyze', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: results.data,
                filename: file.name,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              const errorMessage = errorData.error || errorData.details || 'Analysis failed';
              throw new Error(errorMessage);
            }

            const result = await response.json();
            setAnalysis(result);

            // Auto-download PDF
            const pdfResponse = await fetch('http://localhost:3001/api/data/generate-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(result),
            });

            if (pdfResponse.ok) {
              const blob = await pdfResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `analysis-${file.name.replace(/\.[^/.]+$/, '')}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
          } finally {
            setLoading(false);
          }
        },
        error: (err) => {
          setError('Failed to parse CSV file');
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">📊 Data Analysis</h1>
      <p className="text-gray-400 mb-8">Upload CSV for AI-powered insights and automatic PDF report</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upload Data</h2>

          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-300 mb-2">
              {file ? file.name : 'Drop your CSV file here'}
            </p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {file && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full mt-4"
            >
              {loading ? 'Analyzing...' : '🚀 Analyze with Gemini AI'}
            </button>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <p className="text-red-200 font-semibold mb-2">❌ Error</p>
              <p className="text-red-200 text-sm mb-2">{error}</p>
              <details className="text-xs text-red-300 mt-2">
                <summary className="cursor-pointer hover:text-red-100">Troubleshooting tips</summary>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>Ensure API server is running on port 3001</li>
                  <li>Check GEMINI_API_KEY is set in .env file</li>
                  <li>Verify CSV file has headers in first row</li>
                  <li>See TROUBLESHOOTING.md for more help</li>
                </ul>
              </details>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-700 rounded-lg text-sm">
            <p className="font-semibold mb-2">What you'll get:</p>
            <ul className="space-y-1 text-gray-300">
              <li>✓ Automatic column type detection</li>
              <li>✓ Statistical analysis (mean, median, std dev)</li>
              <li>✓ Correlation identification</li>
              <li>✓ AI-powered insights and recommendations</li>
              <li>✓ Visual charts and graphs</li>
              <li>✓ Auto-generated PDF report (downloads automatically)</li>
            </ul>
          </div>
        </div>

        {/* Results Section */}
        {analysis && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-gray-300 text-sm">{analysis.summary}</p>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Key Insights</h3>
                <ul className="space-y-2">
                  {analysis.insights.map((insight, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Charts Generated</h3>
                <div className="space-y-2">
                  {analysis.charts.map((chart, idx) => (
                    <div key={idx} className="text-sm text-gray-300">
                      📊 {chart.title} ({chart.type})
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg">
                <p className="text-green-200 text-sm">
                  ✓ PDF report downloaded successfully!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
