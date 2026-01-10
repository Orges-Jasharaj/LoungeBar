import React from 'react';
import { useLocation } from 'react-router-dom';
import TableQRRedirect from './TableQRRedirect';
import ClientDashboard from './ClientDashboard';

/**
 * Component that checks the URL and renders the appropriate component
 * This is necessary because React Router v7 doesn't recognize the /table-:tableNumber pattern properly
 */
const TableRouteHandler: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Check if URL starts with /table- or is just a GUID format
  const isTableRoute = path.startsWith('/table-') || /^\/[a-f0-9-]{36}$/.test(path);
  
  // If it's not a table route, don't render anything (will be caught by other routes)
  if (!isTableRoute) {
    return null;
  }

  // Check if it's format /{guid} (just GUID)
  const sessionMatch = path.match(/^\/([a-f0-9-]{36})$/i);
  if (sessionMatch) {
    // Has session GUID, show ClientDashboard
    return <ClientDashboard />;
  }

  // Check if it's format /table-{number}
  const tableMatch = path.match(/^\/table-(\d+)$/);
  if (tableMatch) {
    // No session GUID, show TableQRRedirect to create session
    return <TableQRRedirect />;
  }

  // If it doesn't match any pattern, return error
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
      <h2>Invalid URL</h2>
      <p>The URL is not in the correct format.</p>
    </div>
  );
};

export default TableRouteHandler;
