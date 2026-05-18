import { useEffect, useRef } from 'react';
import axiosInstance from '../utils/axiosInstance.util.js';
import { useFirstVisit } from '../context/FirstVisitContext';

const getOrCreateDeviceId = () => {
  const STORAGE_KEY = 'analytics_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
};

export default function AnalyticsTracker() {
  const { isFirstVisit } = useFirstVisit();
  const hasRecorded = useRef(false);

  useEffect(() => {
    if (isFirstVisit && !hasRecorded.current) {
      hasRecorded.current = true;
      
      const deviceId = getOrCreateDeviceId();
      
      axiosInstance.post('/analytics/visit', { deviceId })
        .catch((error) => {
          console.error('Failed to record analytics visit:', error);
        });
    }
  }, [isFirstVisit]);

  return null;
}
