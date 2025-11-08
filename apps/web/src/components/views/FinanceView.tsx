export default function FinanceView() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">💰 Finance View</h1>
      <p className="text-gray-400 mb-8">Cost analysis and budget tracking</p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-1">Monthly Budget</h3>
          <p className="text-3xl font-bold text-green-400">$10,000</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-1">Current Spend</h3>
          <p className="text-3xl font-bold text-yellow-400">$7,500</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-400 mb-1">Remaining</h3>
          <p className="text-3xl font-bold text-blue-400">$2,500</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
        <div className="space-y-3">
          {[
            { name: 'Compute', cost: 4500, color: 'bg-blue-500' },
            { name: 'Storage', cost: 1200, color: 'bg-green-500' },
            { name: 'Network', cost: 800, color: 'bg-yellow-500' },
            { name: 'Database', cost: 1000, color: 'bg-purple-500' }
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span>{item.name}</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.cost / 10000) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-gray-300 ml-4">${item.cost.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
