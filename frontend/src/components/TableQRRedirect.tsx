import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { tableApi } from '../services/api';

/**
 * Komponent që merr table-{number} nga URL, krijon session dhe ridrejton në /{guid}/table-{number}
 */
const TableQRRedirect: React.FC = () => {
  const { tableNumber: tableNumberParam } = useParams<{ tableNumber: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');

  // Extract table number from URL path
  useEffect(() => {
    const path = location.pathname;
    const match = path.match(/^\/table-(\d+)$/);
    if (match && match[1]) {
      setTableNumber(match[1]);
    } else if (tableNumberParam) {
      setTableNumber(tableNumberParam);
    } else {
      setError('Invalid table number in URL');
    }
  }, [location.pathname, tableNumberParam]);

  console.log('TableQRRedirect rendered, tableNumber:', tableNumber, 'pathname:', location.pathname);

  useEffect(() => {
    const createSessionAndRedirect = async () => {
      if (!tableNumber) {
        setError('Invalid table number');
        return;
      }

      // tableNumber nga useParams është vetëm numri (p.sh. "1"), jo "table-1"
      const num = parseInt(tableNumber, 10);
      if (isNaN(num) || num <= 0) {
        setError(`Invalid table number: ${tableNumber}`);
        return;
      }

      try {
        console.log('Creating session for table:', num);
        // Krijo session për tavolinë
        const response = await tableApi.createTableSession(num);
        console.log('Session response:', response);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create session');
        }

        const sessionGuid = response.data;
        console.log('Session GUID:', sessionGuid);
        console.log('Redirecting to:', `/${sessionGuid}`);
        
        // Ridrejto në /{guid} (vetëm GUID, pa table-{number})
        navigate(`/${sessionGuid}`, { replace: true });
      } catch (err: any) {
        console.error('Error creating session:', err);
        setError(err?.message || 'Error creating session');
      }
    };

    void createSessionAndRedirect();
  }, [tableNumber, navigate]);

  if (error) {
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
        <h2>Gabim</h2>
        <p>{error}</p>
        <p style={{ marginTop: '20px', opacity: 0.8, fontSize: '0.9rem' }}>
          Ju lutem skanoni QR Code përsëri.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        border: '4px solid rgba(255, 255, 255, 0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />
      <p>Duke krijuar sesion...</p>
      <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '10px' }}>
        Tavolina: {tableNumber || 'N/A'}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TableQRRedirect;
