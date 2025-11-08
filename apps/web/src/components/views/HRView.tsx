export default function HRView() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">👥 HR View</h1>
      <p className="text-gray-400 mb-8">Team ownership and capacity planning</p>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Team Capacity</h2>
          <div className="space-y-3">
            {['Platform Team', 'Frontend Team', 'Data Team'].map((team) => (
              <div key={team} className="flex justify-between items-center">
                <span>{team}</span>
                <span className="text-green-400">75% Available</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">On-Call Schedule</h2>
          <div className="space-y-2 text-sm">
            <p>This week: <span className="text-blue-400">Charlie</span></p>
            <p>Next week: <span className="text-purple-400">Dana</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
