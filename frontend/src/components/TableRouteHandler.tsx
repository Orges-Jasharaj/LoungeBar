import React from 'react';
import { useLocation } from 'react-router-dom';
import TableQRRedirect from './TableQRRedirect';
import ClientDashboard from './ClientDashboard';

/**
 * Komponent që kontrollon URL-në dhe e renderon komponentin e duhur
 * Kjo është e nevojshme sepse React Router v7 nuk e njeh pattern-in /table-:tableNumber siç duhet
 */
const TableRouteHandler: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Kontrollo nëse URL-ja fillon me /table- ose është vetëm një GUID format
  const isTableRoute = path.startsWith('/table-') || /^\/[a-f0-9-]{36}$/.test(path);
  
  // Nëse nuk është table route, mos rendero asgjë (do të kapet nga routes të tjera)
  if (!isTableRoute) {
    return null;
  }

  // Kontrollo nëse është format /{guid} (vetëm GUID)
  const sessionMatch = path.match(/^\/([a-f0-9-]{36})$/i);
  if (sessionMatch) {
    // Ka session GUID, shfaq ClientDashboard
    return <ClientDashboard />;
  }

  // Kontrollo nëse është format /table-{number}
  const tableMatch = path.match(/^\/table-(\d+)$/);
  if (tableMatch) {
    // Nuk ka session GUID, shfaq TableQRRedirect për të krijuar session
    return <TableQRRedirect />;
  }

  // Nëse nuk match-on asnjë pattern, kthe error
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
      <h2>URL e pavlefshme</h2>
      <p>URL-ja nuk është në formatin e duhur.</p>
    </div>
  );
};

export default TableRouteHandler;
