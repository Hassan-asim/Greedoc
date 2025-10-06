import React, { useState, useEffect } from 'react';
import { healthDataService, HealthData, HealthMetric } from '../services/healthDataService';

interface HealthDataDisplayProps {
  patientId?: string;
  showEditButton?: boolean;
  onEdit?: () => void;
}

const HealthDataDisplay: React.FC<HealthDataDisplayProps> = ({ 
  patientId, 
  showEditButton = true, 
  onEdit 
}) => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHealthData();
  }, [patientId]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const response = await healthDataService.getHealthData();
      if (response.data.healthData && response.data.healthData.length > 0) {
        setHealthData(response.data.healthData[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (metric: HealthMetric | undefined) => {
    if (!metric || !metric.value) return 'Not recorded';
    return `${metric.value} ${metric.unit}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetricColor = (type: string) => {
    const colors: Record<string, string> = {
      heartRate: 'text-red-600',
      steps: 'text-blue-600',
      sleep: 'text-purple-600',
      bloodPressure: 'text-green-600',
      weight: 'text-orange-600',
      temperature: 'text-yellow-600'
    };
    return colors[type] || 'text-gray-600';
  };

  const getMetricIcon = (type: string) => {
    const icons: Record<string, string> = {
      heartRate: '❤️',
      steps: '👟',
      sleep: '😴',
      bloodPressure: '🩸',
      weight: '⚖️',
      temperature: '🌡️'
    };
    return icons[type] || '📊';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!healthData || !healthData.healthMetrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No health data recorded yet.</p>
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Health Data
          </button>
        )}
      </div>
    );
  }

  const metrics = [
    { key: 'heartRate', label: 'Heart Rate' },
    { key: 'steps', label: 'Steps' },
    { key: 'sleep', label: 'Sleep Duration' },
    { key: 'bloodPressure', label: 'Blood Pressure' },
    { key: 'weight', label: 'Weight' },
    { key: 'temperature', label: 'Body Temperature' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Health Data</h2>
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Health Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const metricData = healthData.healthMetrics[metric.key as keyof typeof healthData.healthMetrics];
          const hasData = metricData && metricData.value;
          
          return (
            <div key={metric.key} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{getMetricIcon(metric.key)}</span>
                <h3 className="font-semibold text-gray-700">{metric.label}</h3>
              </div>
              
              <div className={`text-lg font-bold ${getMetricColor(metric.key)}`}>
                {formatValue(metricData)}
              </div>
              
              {hasData && metricData && (
                <div className="mt-2 text-sm text-gray-500">
                  <div>Updated: {formatDate(metricData.timestamp)}</div>
                  {metricData.notes && (
                    <div className="mt-1 italic">"{metricData.notes}"</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(healthData.lastUpdated)}
        </div>
      </div>
    </div>
  );
};

export default HealthDataDisplay;
