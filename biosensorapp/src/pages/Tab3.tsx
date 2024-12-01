import React, { useEffect, useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { LocalNotifications } from '@capacitor/local-notifications';

const DRUNK_LEVEL = 0.08;
const FETCH_INTERVAL = 5000; // 5 seconds

const Tab3: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const notificationSentRef = useRef<boolean>(false); // Use useRef instead of useState

  useEffect(() => {
    const url =
      'https://raw.githubusercontent.com/Bit-Programming/Biosensor-Repo/main/data.json';

    const fetchData = () => {
      console.log('Fetching data...');
      fetch(url)
        .then((response) => response.json())
        .then((jsonData) => {
          setData(jsonData);
          calculateStats(jsonData);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, FETCH_INTERVAL);

    requestNotificationPermission();

    return () => clearInterval(intervalId);
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendNotification = async (message: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Alcohol Level Alert',
            body: message,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const calculateStats = (data: any) => {
    const readings = data.readings;
    const levels = readings.map((reading: any) => reading.level);
  
    // Keep levels as numbers for calculation
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    const avgLevel = levels.reduce((sum: number, level: number) => sum + level, 0) / levels.length;
    const currentLevel = levels[levels.length - 1]; // This is a number
  
    // Set stats with formatted strings
    setStats({
      maxLevel: maxLevel.toFixed(2),
      minLevel: minLevel.toFixed(2),
      avgLevel: avgLevel.toFixed(2),
      currentLevel: currentLevel.toFixed(2),
    });
  
    // Use currentLevel as a number for comparison
    if (currentLevel >= DRUNK_LEVEL && !notificationSentRef.current) {
      sendNotification('Warning: Alcohol level is at or above the drunk threshold!');
      notificationSentRef.current = true;
      console.log('Notification sent.');
    } else if (currentLevel < DRUNK_LEVEL && notificationSentRef.current) {
      notificationSentRef.current = false;
      console.log('Alcohol level back to normal. Ready to send new notification.');
    }
  };

  const formatLabels = (readings: any) => {
    let lastDate = '';
    return readings.map((reading: any) => {
      const date = new Date(reading.time);
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      if (dateString !== lastDate) {
        lastDate = dateString;
        return `${dateString} ${timeString}`;
      }
      return timeString;
    });
  };

  const chartData = data
    ? {
        labels: formatLabels(data.readings),
        datasets: [
          {
            label: 'Alcohol Level (%)',
            data: data.readings.map((reading: any) => reading.level),
            fill: false,
            backgroundColor: data.readings.map((reading: any) =>
              reading.level >= DRUNK_LEVEL
                ? 'rgba(255, 99, 132, 0.6)'
                : 'rgba(38, 166, 154, 0.6)'
            ),
            borderColor: 'rgba(38, 166, 154, 1)',
            pointBorderColor: data.readings.map((reading: any) =>
              reading.level >= DRUNK_LEVEL
                ? 'rgba(255, 99, 132, 1)'
                : 'rgba(38, 166, 154, 1)'
            ),
            pointBackgroundColor: data.readings.map((reading: any) =>
              reading.level >= DRUNK_LEVEL
                ? 'rgba(255, 99, 132, 1)'
                : 'rgba(38, 166, 154, 1)'
            ),
          },
          {
            label: 'Drunk Level',
            data: new Array(data.readings.length).fill(DRUNK_LEVEL),
            borderColor: 'rgba(255, 99, 132, 1)',
            borderDash: [10, 5],
            fill: false,
            pointRadius: 0,
          },
        ],
      }
    : null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Alcohol Level Stats</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '16px' }}>
          {data && stats ? (
            <>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Current Alcohol Level</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h2>
                    {stats.currentLevel}%{' '}
                    {parseFloat(stats.currentLevel) >= DRUNK_LEVEL ? 'Drunk' : ''}
                  </h2>
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Statistics</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Maximum Level: {stats.maxLevel}%</p>
                  <p>Minimum Level: {stats.minLevel}%</p>
                  <p>Average Level: {stats.avgLevel}%</p>
                </IonCardContent>
              </IonCard>

              {chartData && (
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Alcohol Level Over Time</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <Line data={chartData} />
                  </IonCardContent>
                </IonCard>
              )}
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;