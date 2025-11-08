export default function DevOpsView() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">🚀 DevOps View</h1>
      <p className="text-gray-400 mb-8">Infrastructure and system health</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {['API Gateway', 'Auth Service', 'Payment Service'].map((service) => (
          <div key={service} className="card">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{service}</span>
              <span className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
            <p className="text-sm text-gray-400 mt-2">Healthy</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Deployments</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>payment-api v2.1.0</span>
            <span className="text-green-400">Success</span>
          </div>
          <div className="flex justify-between">
            <span>auth-service v1.5.2</span>
            <span className="text-green-400">Success</span>
          </div>
        </div>
      </div>
    </div>
  );
}
