import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useLoadingMessage } from './hooks/useLoadingMessage';

const Analytics = ({ token }) => {
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
        <h2 style={{ marginBottom: '1.5rem' }}>Analytics</h2>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-container">
        <h2 style={{ marginBottom: '1.5rem' }}>Analytics</h2>
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
        <h2 style={{ marginBottom: '1.5rem' }}>Analytics</h2>
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
      <h2 style={{ marginBottom: '1.5rem' }}>Analytics</h2>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Submissions (Last 30 Days)</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyCounts} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                stroke="#a0a0a0" 
                tick={{ fill: '#a0a0a0', fontSize: 12 }} 
                tickMargin={10}
              />
              <YAxis 
                stroke="#a0a0a0" 
                tick={{ fill: '#a0a0a0', fontSize: 12 }}
                allowDecimals={false}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--text-primary)'
                }}
                itemStyle={{ color: '#22c55e' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#22c55e" 
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
        <div style={{ height: `${Math.max(200, data.byProject.length * 50)}px`, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.byProject} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" horizontal={false} />
              <XAxis 
                type="number" 
                stroke="#a0a0a0" 
                allowDecimals={false}
              />
              <YAxis 
                dataKey="projectName" 
                type="category" 
                stroke="#a0a0a0"
                tick={{ fill: '#a0a0a0', fontSize: 13 }}
                width={150}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)'
                }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} name="Submissions" barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
