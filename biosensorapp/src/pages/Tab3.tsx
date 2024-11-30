import React, { useEffect, useState } from 'react';
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

const DRUNK_LEVEL = 0.08;
const FETCH_INTERVAL = 5000; // 5 seconds

const Tab3: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [notificationSent, setNotificationSent] = useState<boolean>(false);

  useEffect(() => {
    const url =
      'https://raw.githubusercontent.com/Bit-Programming/Biosensor-Repo/refs/heads/main/data.json';

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

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  };

  const sendNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(message);
    }
  };

  const calculateStats = (data: any) => {
    const readings = data.readings;
    const levels = readings.map((reading: any) => reading.level);
    const maxLevel = Math.max(...levels).toFixed(2);
    const minLevel = Math.min(...levels).toFixed(2);
    const avgLevel = (levels.reduce((sum: number, level: number) => sum + level, 0) / levels.length).toFixed(2);
    const currentLevel = levels[levels.length - 1].toFixed(2);

    setStats({
      maxLevel,
      minLevel,
      avgLevel,
      currentLevel,
    });

    if (parseFloat(currentLevel) > DRUNK_LEVEL && !notificationSent) {
      sendNotification('Warning: Alcohol level is above the drunk threshold!');
      setNotificationSent(true);
      console.log('Notification sent.');
    } else if (parseFloat(currentLevel) <= DRUNK_LEVEL && notificationSent) {
      setNotificationSent(false);
    }
  };

  const formatLabels = (readings: any) => {
    let lastDate = '';
    return readings.map((reading: any) => {
      const date = new Date(reading.time);
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
              reading.level > DRUNK_LEVEL ? 'rgba(255, 99, 132, 0.6)' : 'rgba(38, 166, 154, 0.6)'
            ),
            borderColor: 'rgba(38, 166, 154, 1)',
            pointBorderColor: data.readings.map((reading: any) =>
              reading.level > DRUNK_LEVEL ? 'rgba(255, 99, 132, 1)' : 'rgba(38, 166, 154, 1)'
            ),
            pointBackgroundColor: data.readings.map((reading: any) =>
              reading.level > DRUNK_LEVEL ? 'rgba(255, 99, 132, 1)' : 'rgba(38, 166, 154, 1)'
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
                  <h2>{stats.currentLevel}%</h2>
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