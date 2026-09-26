import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useLoadingMessage } from './hooks/useLoadingMessage';

const Analytics = ({ token, title = 'Usage & Analytics' }) => {
  const [data, setData] = useState({ dailyCounts: [], byProject: [] });
  const [isLoading, setIsLoading] = useState(true);
  const loadingMessage = useLoadingMessage(isLoading);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const json = await response.json();
        
        // Format dates for display
        const formattedDaily = json.dailyCounts.map(item => {
          // Keep it simple and assume UTC from server is what we want for day mapping
          // or at least consistently map to month/date
          const date = new Date(item.date);
          // adjust for timezone issues, item.date is YYYY-MM-DD
          const parts = item.date.split('-');
          const year = parseInt(parts[0], 10);
          const monthIndex = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const localDate = new Date(year, monthIndex, day);
          
          const monthStr = localDate.toLocaleString('default', { month: 'short' });
          const dayStr = localDate.getDate();
          return {
            ...item,
            displayDate: `${monthStr} ${dayStr}`
          };
        });

        // Sort byProject descending
        const sortedProjects = [...json.byProject].sort((a, b) => b.count - a.count);

        setData({
          dailyCounts: formattedDaily,
          byProject: sortedProjects
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, API_URL]);

  if (isLoading) {
    return (
      <div className="analytics-container">
        {title && <h2 style={{ marginBottom: '1.5rem' }}>{title}</h2>}
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        {title && <h2 style={{ marginBottom: '1.5rem' }}>{title}</h2>}
        <div className="card" style={{ color: 'var(--danger-color)' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const totalSubmissions = data.byProject.reduce((sum, p) => sum + p.count, 0);

  if (totalSubmissions === 0) {
    return (
      <div className="analytics-container">
        {title && <h2 style={{ marginBottom: '1.5rem' }}>{title}</h2>}
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>
            No submissions yet — data will appear here once your forms start receiving messages.
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {title && <h2 style={{ marginBottom: '1.5rem' }}>{title}</h2>}
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Submissions (Last 30 Days)</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyCounts} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#cbd5e1" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickMargin={10}
              />
              <YAxis 
                stroke="#cbd5e1" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                allowDecimals={false}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#111827',
                  boxShadow: 'var(--shadow-md)'
                }}
                itemStyle={{ color: '#154234', fontWeight: 600 }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#154234" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#22c55e' }}
                name="Submissions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Submissions by Project</h3>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ height: `${Math.max(200, data.byProject.length * 50)}px`, minWidth: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byProject} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#cbd5e1" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="projectName" 
                  type="category" 
                  stroke="#cbd5e1"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  width={120}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                  cursor={{ fill: 'rgba(21, 66, 52, 0.04)' }}
                />
                <Bar dataKey="count" fill="#154234" radius={[0, 8, 8, 0]} name="Submissions" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
