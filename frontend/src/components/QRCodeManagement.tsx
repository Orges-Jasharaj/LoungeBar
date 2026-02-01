import React, { useState, useEffect } from 'react';
import { tableApi } from '../services/api';
import type { TableDto } from '../types/table';
import './QRCodeManagement.css';

const QRCodeManagement: React.FC = () => {
  const [tables, setTables] = useState<TableDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState<number | null>(null);
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await tableApi.getAllTables();
      if (response.success && response.data) {
        setTables(response.data);
      } else {
        setError(response.message || 'Failed to load tables');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading tables');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRCode = async (tableId: number) => {
    try {
      setGenerating(tableId);
      setError('');
      const response = await tableApi.generateQRCode(tableId, baseUrl || undefined);
      if (response.success) {
        await loadTables();
      } else {
        setError(response.message || 'Failed to generate QR code');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating QR code');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadQRCode = async (tableNumber: number) => {
    try {
      const blob = await tableApi.getQRCode(tableNumber);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-${tableNumber}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error downloading QR code');
    }
  };

  const [qrCodeUrls, setQrCodeUrls] = useState<Record<number, string>>({});
  const [loadingQR, setLoadingQR] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadQRCodeImages = async () => {
      const urls: Record<number, string> = {};
      const loading: Record<number, boolean> = {};
      
      for (const table of tables) {
        if (table.qrCodeImage) {
          loading[table.number] = true;
          try {
            if (typeof table.qrCodeImage === 'string') {
              urls[table.number] = `data:image/png;base64,${table.qrCodeImage}`;
            } else if (Array.isArray(table.qrCodeImage)) {
              const bytes = new Uint8Array(table.qrCodeImage);
              const binary = String.fromCharCode(...bytes);
              const base64 = btoa(binary);
              urls[table.number] = `data:image/png;base64,${base64}`;
            } else {
              const blob = await tableApi.getQRCode(table.number);
              const reader = new FileReader();
              const url = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              urls[table.number] = url;
            }
          } catch (err) {
            console.error(`Failed to load QR code for table ${table.number}:`, err);
          } finally {
            loading[table.number] = false;
          }
        }
      }
      setQrCodeUrls(urls);
      setLoadingQR(loading);
    };

    if (tables.length > 0) {
      void loadQRCodeImages();
    }
  }, [tables]);

  const getQRCodeImageUrl = (table: TableDto) => {
    return qrCodeUrls[table.number] || null;
  };

  const hasQRCode = (table: TableDto) => {
    return !!table.qrCodeImage || !!qrCodeUrls[table.number];
  };

  if (loading) {
    return (
      <div className="qrcode-management">
        <div className="loading">Loading tables...</div>
      </div>
    );
  }

  return (
    <div className="qrcode-management">
      <div className="qrcode-header">
        <h2>QR Code Management</h2>
        <div className="base-url-input">
          <label htmlFor="baseUrl">Frontend Base URL:</label>
          <input
            id="baseUrl"
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className="url-input"
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {(() => {
        const totalPages = Math.ceil(tables.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentTables = tables.slice(startIndex, endIndex);

        return (
          <>
            <div className="tables-grid">
              {currentTables.map((table) => {
          const qrCodeUrl = getQRCodeImageUrl(table);
          const tableHasQRCode = hasQRCode(table);
          const isLoading = loadingQR[table.number];

          return (
            <div key={table.id} className="table-card">
              <div className="table-card-header">
                <h3>Table {table.number}</h3>
                <span className="capacity">Capacity: {table.capacity}</span>
              </div>

              <div className="qrcode-preview">
                {isLoading ? (
                  <div className="loading-qrcode">Loading...</div>
                ) : qrCodeUrl ? (
                  <img src={qrCodeUrl} alt={`QR Code for Table ${table.number}`} />
                ) : (
                  <div className="no-qrcode">
                    <span>No QR Code</span>
                  </div>
                )}
              </div>

              <div className="table-card-actions">
                <button
                  onClick={() => handleGenerateQRCode(table.id)}
                  disabled={generating === table.id}
                  className="btn-generate"
                >
                  {generating === table.id ? 'Generating...' : tableHasQRCode ? 'Regenerate' : 'Generate QR Code'}
                </button>
                {tableHasQRCode && (
                  <button
                    onClick={() => handleDownloadQRCode(table.number)}
                    className="btn-download"
                  >
                    Download
                  </button>
                )}
              </div>
            </div>
          );
        })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <div className="pagination-info">
                  Page {currentPage} of {totalPages} ({tables.length} tables)
                </div>
                <button
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};

export default QRCodeManagement;
