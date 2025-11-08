export default function DataAnalyzer() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">📊 Data Analysis</h1>
      <p className="text-gray-400 mb-8">Upload CSV/Excel for AI-powered insights</p>

      <div className="card max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Upload Data</h2>

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-gray-300 mb-2">Drop your CSV or Excel file here</p>
          <p className="text-sm text-gray-500">or click to browse</p>
          <button className="btn-primary mt-4">Select File</button>
        </div>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg text-sm">
          <p className="font-semibold mb-2">What you'll get:</p>
          <ul className="space-y-1 text-gray-300">
            <li>✓ Automatic column type detection</li>
            <li>✓ Statistical analysis (mean, median, std dev)</li>
            <li>✓ Correlation identification</li>
            <li>✓ AI-powered insights and recommendations</li>
            <li>✓ Visual charts and graphs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
