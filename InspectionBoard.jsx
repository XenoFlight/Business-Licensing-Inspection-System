import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed: npm install axios
import InspectionMap from './InspectionMap';

const InspectionBoard = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMap, setShowMap] = useState(false);

  // Fetch reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Assuming token is stored in localStorage after login
        const token = localStorage.getItem('token');
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 8000, // Timeout after 8 seconds
        };

        console.log('Fetching reports...');
        const response = await axios.get('/api/reports', config);
        setReports(response.data);
        setFilteredReports(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('לא ניתן לטעון את הנתונים. אנא נסה שנית מאוחר יותר.');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filter logic
  useEffect(() => {
    const results = reports.filter(report => {
      const reportDate = new Date(report.visitDate);
      const isSameMonth = reportDate.getMonth() === currentDate.getMonth() &&
                          reportDate.getFullYear() === currentDate.getFullYear();

      if (!isSameMonth) return false;

      const businessName = report.Business?.businessName?.toLowerCase() || '';
      const inspectorName = report.inspector?.fullName?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      return businessName.includes(search) || inspectorName.includes(search);
    });
    setFilteredReports(results);
  }, [searchTerm, reports, currentDate]);

  // Helper to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper for status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pass':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">עבר בהצלחה</span>;
      case 'fail':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">נכשל</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">אזהרה</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">ממתין</span>;
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Calendar Logic
  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const getReportsForDay = (dayDate) => {
    if (!dayDate) return [];
    return reports.filter(r => {
      const d = new Date(r.visitDate);
      return d.getDate() === dayDate.getDate() && 
             d.getMonth() === dayDate.getMonth() && 
             d.getFullYear() === dayDate.getFullYear();
    });
  };

  const calendarDays = getDaysInMonth();

  if (loading) return <div className="text-center p-10">טוען ביקורות...</div>;
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">לוח ביקורות ופיקוח</h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {showMap ? 'הסתר מפה' : 'חיפוש במפה'}
          </button>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="חפש לפי שם עסק או מפקח..."
              className="border border-gray-300 rounded-lg py-2 px-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Map Section */}
      {showMap && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">איתור וסינון לפי מיקום</h3>
          <InspectionMap onLocationSelect={(loc) => setSearchTerm(loc.address)} />
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8 p-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              היום
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
            <div key={day} className="font-bold text-gray-500">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayReports = getReportsForDay(day);
            return (
              <div key={index} className={`h-24 border rounded-lg p-2 flex flex-col items-start justify-between ${day ? 'bg-gray-50 hover:bg-gray-100' : 'bg-transparent border-none'}`}>
                {day && (
                  <>
                    <span className="font-semibold text-gray-700">{day.getDate()}</span>
                    <div className="flex flex-wrap gap-1 w-full">
                      {dayReports.map(r => (
                        <div key={r.id} 
                             className={`w-2 h-2 rounded-full ${r.status === 'pass' ? 'bg-green-500' : r.status === 'fail' ? 'bg-red-500' : 'bg-yellow-500'}`} 
                             title={r.Business?.businessName}
                        />
                      ))}
                      {dayReports.length > 0 && <span className="text-xs text-gray-500 mr-auto">{dayReports.length}</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                תאריך ביקור
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                שם העסק
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                כתובת
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                מפקח אחראי
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                סטטוס
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 text-sm">{formatDate(report.visitDate)}</td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm font-medium">{report.Business?.businessName}</td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">{report.Business?.address}</td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">{report.inspector?.fullName}</td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">{getStatusBadge(report.status)}</td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  <button 
                    onClick={() => setSelectedReport(report)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    צפה בדו"ח
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReports.length === 0 && (
          <div className="p-5 text-center text-gray-500">לא נמצאו דו"חות התואמים את החיפוש</div>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              דו"ח ביקורת: {selectedReport.Business?.businessName}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">תאריך ביקור</p>
                <p className="font-medium">{formatDate(selectedReport.visitDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">מפקח</p>
                <p className="font-medium">{selectedReport.inspector?.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">סטטוס</p>
                <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">כתובת</p>
                <p className="font-medium">{selectedReport.Business?.address}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-700">ממצאי הביקורת</h3>
              <p className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                {selectedReport.findings || 'אין ממצאים רשומים.'}
              </p>
            </div>

            {selectedReport.aiRiskAssessment && (
              <div className="mb-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2 text-purple-700 flex items-center">
                  <span className="ml-2">🤖</span> ניתוח סיכונים (AI)
                </h3>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="mb-2">
                    <span className="font-bold">רמת סיכון: </span>
                    <span className={`font-bold ${getRiskLevelColor(selectedReport.aiRiskAssessment.riskLevel)}`}>
                      {selectedReport.aiRiskAssessment.riskLevel}
                    </span>
                  </div>
                  <p className="mb-3 text-gray-700">{selectedReport.aiRiskAssessment.summary}</p>
                  
                  {selectedReport.aiRiskAssessment.recommendations && (
                    <div>
                      <span className="font-bold block mb-1">המלצות:</span>
                      <ul className="list-disc list-inside text-gray-700">
                        {selectedReport.aiRiskAssessment.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              {selectedReport.pdfPath && (
                <a 
                  href={selectedReport.pdfPath} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  הורד PDF
                </a>
              )}
              <button 
                onClick={() => setSelectedReport(null)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionBoard;