import React, { useState, useEffect } from 'react';
import { healthDataService, HealthData, HealthMetric } from '../services/healthDataService';

interface HealthDataFormProps {
  onSuccess?: (data: HealthData) => void;
  onCancel?: () => void;
  initialData?: HealthData;
}

const HealthDataForm: React.FC<HealthDataFormProps> = ({ 
  onSuccess, 
  onCancel, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    heartRate: { value: '', unit: 'bpm', timestamp: new Date().toISOString(), notes: '' },
    steps: { value: '', unit: 'steps', timestamp: new Date().toISOString(), notes: '' },
    sleep: { value: '', unit: 'hours', timestamp: new Date().toISOString(), notes: '' },
    bloodPressure: { value: '', unit: 'mmHg', timestamp: new Date().toISOString(), notes: '' },
    weight: { value: '', unit: 'kg', timestamp: new Date().toISOString(), notes: '' },
    temperature: { value: '', unit: '°C', timestamp: new Date().toISOString(), notes: '' }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.healthMetrics) {
      const newFormData = { ...formData };
      Object.keys(initialData.healthMetrics).forEach(key => {
        const metric = initialData.healthMetrics[key as keyof typeof initialData.healthMetrics];
        if (metric) {
          newFormData[key as keyof typeof newFormData] = {
            value: metric.value.toString(),
            unit: metric.unit,
            timestamp: metric.timestamp,
            notes: metric.notes || ''
          };
        }
      });
      setFormData(newFormData);
    }
  }, [initialData]);

  const handleInputChange = (metric: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty metrics
      const healthMetrics: Record<string, HealthMetric> = {};
      Object.entries(formData).forEach(([key, metric]) => {
        if (metric.value && metric.value.toString().trim() !== '') {
          healthMetrics[key] = {
            value: parseFloat(metric.value.toString()),
            unit: metric.unit,
            timestamp: metric.timestamp,
            notes: metric.notes
          };
        }
      });

      const response = await healthDataService.updateBulkHealthData({ healthMetrics });
      
      if (onSuccess) {
        onSuccess(response.data.healthData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save health data');
    } finally {
      setLoading(false);
    }
  };

  const healthMetrics = [
    {
      key: 'heartRate',
      label: 'Heart Rate',
      placeholder: 'Enter heart rate',
      type: 'number',
      min: 40,
      max: 200
    },
    {
      key: 'steps',
      label: 'Steps',
      placeholder: 'Enter steps count',
      type: 'number',
      min: 0,
      max: 50000
    },
    {
      key: 'sleep',
      label: 'Sleep Duration',
      placeholder: 'Enter sleep hours',
      type: 'number',
      min: 0,
      max: 24,
      step: 0.5
    },
    {
      key: 'bloodPressure',
      label: 'Blood Pressure',
      placeholder: 'Enter blood pressure (e.g., 120/80)',
      type: 'text'
    },
    {
      key: 'weight',
      label: 'Weight',
      placeholder: 'Enter weight',
      type: 'number',
      min: 30,
      max: 200,
      step: 0.1
    },
    {
      key: 'temperature',
      label: 'Body Temperature',
      placeholder: 'Enter temperature',
      type: 'number',
      min: 35,
      max: 42,
      step: 0.1
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Health Data Entry</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthMetrics.map((metric) => (
            <div key={metric.key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {metric.label}
              </label>
              <div className="flex space-x-2">
                <input
                  type={metric.type}
                  value={formData[metric.key as keyof typeof formData].value}
                  onChange={(e) => handleInputChange(metric.key, 'value', e.target.value)}
                  placeholder={metric.placeholder}
                  min={metric.min}
                  max={metric.max}
                  step={metric.step}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData[metric.key as keyof typeof formData].unit}
                  onChange={(e) => handleInputChange(metric.key, 'unit', e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                type="text"
                value={formData[metric.key as keyof typeof formData].notes}
                onChange={(e) => handleInputChange(metric.key, 'notes', e.target.value)}
                placeholder="Notes (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Health Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthDataForm;
