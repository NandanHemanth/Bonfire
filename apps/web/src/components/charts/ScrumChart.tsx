interface SprintData {
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
  inProgressPoints: number;
  todoPoints: number;
}

interface ScrumChartProps {
  currentSprint: SprintData;
  sprints: SprintData[];
}

export default function ScrumChart({ currentSprint, sprints }: ScrumChartProps) {
  const completionPercentage = (currentSprint.completedPoints / currentSprint.totalPoints) * 100;
  const inProgressPercentage = (currentSprint.inProgressPoints / currentSprint.totalPoints) * 100;
  const todoPercentage = (currentSprint.todoPoints / currentSprint.totalPoints) * 100;

  // Calculate days remaining
  const now = new Date();
  const endDate = new Date(currentSprint.endDate);
  const startDate = new Date(currentSprint.startDate);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  // Calculate ideal burndown line
  const idealProgress = (daysElapsed / totalDays) * 100;

  // Historical sprint data for trend
  const recentSprints = sprints.slice(-3);

  return (
    <div className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg" style={{ width: '340px' }}>
      <h3 className="text-white font-bold text-sm mb-3">{currentSprint.name}</h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Sprint Progress</span>
          <span>{daysRemaining} days remaining</span>
        </div>
        <div className="w-full h-8 bg-gray-800 rounded overflow-hidden flex">
          <div
            className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${completionPercentage}%` }}
            title={`Completed: ${currentSprint.completedPoints} pts`}
          >
            {completionPercentage > 10 && `${completionPercentage.toFixed(0)}%`}
          </div>
          <div
            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${inProgressPercentage}%` }}
            title={`In Progress: ${currentSprint.inProgressPoints} pts`}
          >
            {inProgressPercentage > 10 && `${inProgressPercentage.toFixed(0)}%`}
          </div>
          <div
            className="bg-gray-600 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${todoPercentage}%` }}
            title={`Todo: ${currentSprint.todoPoints} pts`}
          >
            {todoPercentage > 10 && `${todoPercentage.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {/* Burndown Chart */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Burndown Chart</div>
        <svg width="100%" height="120" viewBox="0 0 300 120">
          {/* Grid lines */}
          <line x1="30" y1="10" x2="30" y2="100" stroke="#374151" strokeWidth="2" />
          <line x1="30" y1="100" x2="290" y2="100" stroke="#374151" strokeWidth="2" />

          {/* Ideal line (diagonal from top-left to bottom-right) */}
          <line
            x1="30"
            y1="10"
            x2="290"
            y2="100"
            stroke="#6b7280"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x="250" y="95" fill="#6b7280" fontSize="10">Ideal</text>

          {/* Actual progress line */}
          <line
            x1="30"
            y1="10"
            x2={30 + (260 * idealProgress / 100)}
            y2={10 + (90 * (100 - completionPercentage) / 100)}
            stroke="#10b981"
            strokeWidth="3"
          />
          <circle
            cx={30 + (260 * idealProgress / 100)}
            cy={10 + (90 * (100 - completionPercentage) / 100)}
            r="4"
            fill="#10b981"
          />

          {/* Axis labels */}
          <text x="5" y="15" fill="#9ca3af" fontSize="10">{currentSprint.totalPoints}</text>
          <text x="5" y="105" fill="#9ca3af" fontSize="10">0</text>
          <text x="140" y="118" fill="#9ca3af" fontSize="10">Sprint Timeline</text>

          {/* Status indicator */}
          {completionPercentage >= idealProgress ? (
            <g>
              <circle cx="250" cy="30" r="3" fill="#10b981" />
              <text x="258" y="33" fill="#10b981" fontSize="10">On Track</text>
            </g>
          ) : (
            <g>
              <circle cx="250" cy="30" r="3" fill="#ef4444" />
              <text x="258" y="33" fill="#ef4444" fontSize="10">Behind</text>
            </g>
          )}
        </svg>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-green-400 text-xl font-bold">{currentSprint.completedPoints}</div>
          <div className="text-gray-400 text-xs">Done</div>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-yellow-400 text-xl font-bold">{currentSprint.inProgressPoints}</div>
          <div className="text-gray-400 text-xs">In Progress</div>
        </div>
        <div className="bg-gray-800 p-2 rounded text-center">
          <div className="text-gray-500 text-xl font-bold">{currentSprint.todoPoints}</div>
          <div className="text-gray-400 text-xs">Todo</div>
        </div>
      </div>

      {/* Historical Performance */}
      <div className="pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Recent Sprints</div>
        <div className="space-y-1">
          {recentSprints.map((sprint, index) => {
            const velocity = (sprint.completedPoints / sprint.totalPoints) * 100;
            return (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{sprint.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-700 rounded overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${velocity}%` }}
                    />
                  </div>
                  <span className="text-gray-400 w-10 text-right">
                    {velocity.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
