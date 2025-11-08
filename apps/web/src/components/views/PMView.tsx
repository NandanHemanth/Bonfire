export default function PMView() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">📊 Project Manager View</h1>
      <p className="text-gray-400 mb-8">Project timelines and dependencies</p>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
        <div className="space-y-4">
          {['Payment API v2', 'Mobile App Launch', 'Data Migration'].map((project) => (
            <div key={project} className="p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold">{project}</h3>
              <div className="mt-2 flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-600 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-sm text-gray-400">60%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
