
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

function Analytics({ applications }) {
  const total = applications.length;

  const applied = applications.filter(
    (app) => app.status === 'Applied'
  ).length;

  const interviews = applications.filter(
    (app) => app.status === 'Interview'
  ).length;

  const offers = applications.filter(
    (app) => app.status === 'Offer'
  ).length;

  const rejected = applications.filter(
    (app) => app.status === 'Rejected'
  ).length;

  const interviewRate =
    total > 0
      ? ((interviews / total) * 100).toFixed(1)
      : '0.0';

  const offerRate =
    total > 0
      ? ((offers / total) * 100).toFixed(1)
      : '0.0';

  const statusData = [
    {
      name: 'Applied',
      value: applied,
    },
    {
      name: 'Interview',
      value: interviews,
    },
    {
      name: 'Offer',
      value: offers,
    },
    {
      name: 'Rejected',
      value: rejected,
    },
  ];

  const barData = [
    {
      name: 'Applied',
      applications: applied,
    },
    {
      name: 'Interview',
      applications: interviews,
    },
    {
      name: 'Offer',
      applications: offers,
    },
    {
      name: 'Rejected',
      applications: rejected,
    },
  ];

  const chartColors = [
    '#3B82F6',
    '#8B5CF6',
    '#22C55E',
    '#EF4444',
  ];

  return (
    <section
      className="analytics-section"
      style={{
        marginTop: '30px',
      }}
    >
      <div
        className="analytics-header"
        style={{
          marginBottom: '20px',
        }}
      >
        <p className="eyebrow">Analytics</p>

        <h2>Application Performance</h2>

        <p>
          Understand your job search progress with real-time
          application metrics.
        </p>
      </div>

      <div
        className="analytics-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="analytics-card">
          <p>Total Applications</p>
          <h3>{total}</h3>
        </div>

        <div className="analytics-card">
          <p>Interview Rate</p>
          <h3>{interviewRate}%</h3>
        </div>

        <div className="analytics-card">
          <p>Offer Rate</p>
          <h3>{offerRate}%</h3>
        </div>

        <div className="analytics-card">
          <p>Rejected</p>
          <h3>{rejected}</h3>
        </div>
      </div>

      <div
        className="analytics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* PIE CHART */}

        <div className="panel analytics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                Distribution
              </p>

              <h3>Application Status</h3>
            </div>
          </div>

          <div
            className="chart-container"
            style={{
              width: '100%',
              height: '320px',
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {statusData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          chartColors[index]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}

        <div className="panel analytics-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">
                Overview
              </p>

              <h3>
                Applications by Status
              </h3>
            </div>
          </div>

          <div
            className="chart-container"
            style={{
              width: '100%',
              height: '320px',
            }}
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="name" />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Bar
                  dataKey="applications"
                  fill="#3B82F6"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Analytics;

