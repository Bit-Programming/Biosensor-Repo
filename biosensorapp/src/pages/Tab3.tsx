import React, { useState, useMemo } from 'react';
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
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToggle,
  useIonViewWillEnter,
} from '@ionic/react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Chart,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
Chart.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

import './Tab3.css';

interface Reading {
  time: string;
  level: number;
}

interface Data {
  alcohol_level: number;
  max_level: number;
  min_level: number;
  average_level: number;
  readings: Reading[];
}

const Tab3: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const url =
    'https://raw.githubusercontent.com/Bit-Programming/Biosensor-Repo/main/data.json';

  const fetchData = () => {
    return fetch(url)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        setError(null);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setError('Failed to load data.');
      });
  };

  useIonViewWillEnter(() => {
    fetchData();
  });

  const filteredReadings = useMemo(() => {
    if (data) {
      const now = new Date();
      let filtered = data.readings;

      if (timeRange === '24h') {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filtered = data.readings.filter(
          (reading) => new Date(reading.time) >= yesterday
        );
      } else if (timeRange === '7d') {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = data.readings.filter(
          (reading) => new Date(reading.time) >= lastWeek
        );
      } else if (timeRange === '30d') {
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = data.readings.filter(
          (reading) => new Date(reading.time) >= lastMonth
        );
      }
      return filtered;
    }
    return [];
  }, [data, timeRange]);

  const chartData = useMemo(() => {
    if (filteredReadings.length > 0) {
      return {
        datasets: [
          {
            label: 'Alcohol Level (%)',
            data: filteredReadings.map((reading) => ({
              x: new Date(reading.time),
              y: reading.level,
            })),
            fill: false,
            backgroundColor: 'rgba(38, 166, 154, 0.6)',
            borderColor: 'rgba(38, 166, 154, 1)',
            tension: 0.1,
          },
        ],
      };
    }
    return null;
  }, [filteredReadings]);

  const chartOptions = {
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit:
            timeRange === '24h'
              ? 'hour'
              : timeRange === '7d'
              ? 'day'
              : 'week',
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
  };

  const refreshData = (event: CustomEvent) => {
    fetchData().then(() => event.detail.complete());
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark', !darkMode);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Alcohol Level Stats</IonTitle>
          <IonToggle
            slot="end"
            checked={darkMode}
            onIonChange={toggleDarkMode}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refreshData}>
          <IonRefresherContent />
        </IonRefresher>
        <div className="container">
          {data ? (
            <>
              <IonSegment
                value={timeRange}
                onIonChange={(e) => setTimeRange(e.detail.value!)}
              >
                <IonSegmentButton value="24h">
                  <IonLabel>Last 24h</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="7d">
                  <IonLabel>Last 7d</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="30d">
                  <IonLabel>Last 30d</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Current Alcohol Level</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <h2 className="level-text">{data.alcohol_level}%</h2>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Statistics</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p>Maximum Level: {data.max_level}%</p>
                        <p>Minimum Level: {data.min_level}%</p>
                        <p>Average Level: {data.average_level}%</p>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    {chartData ? (
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>Alcohol Level Over Time</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <Line data={chartData} options={chartOptions} />
                        </IonCardContent>
                      </IonCard>
                    ) : (
                      <p>No data available for this time range.</p>
                    )}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <IonLoading isOpen={!data} message={'Please wait...'} />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;