import { useState, useEffect } from 'react'
import { Folder, MessageSquare, Clock } from 'lucide-react'

// Helper for relative time formatting without external libraries
function getRelativeTime(isoDate) {
  if (!isoDate) return 'No activity yet';
  
  const now = new Date();
  const date = new Date(isoDate);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <div style={{ padding: '2rem', color: '#8b92a5' }}>Loading stats...</div>;
  }

  if (error) {
    return <div className="error-message" style={{ padding: '2rem' }}>Error: {error}</div>;
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: Folder,
      color: '#5865F2'
    },
    {
      title: 'Total Submissions',
      value: stats?.totalSubmissions || 0,
      icon: MessageSquare,
      color: '#43b581'
    },
    {
      title: 'Last Activity',
      value: getRelativeTime(stats?.lastActivity),
      icon: Clock,
      color: '#faa61a'
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '2rem', marginTop: 0 }}>Dashboard</h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: 0 }}>
              <div style={{
                backgroundColor: `${card.color}20`, // 20% opacity background
                padding: '1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={32} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#8b92a5', marginBottom: '0.25rem' }}>{card.title}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
