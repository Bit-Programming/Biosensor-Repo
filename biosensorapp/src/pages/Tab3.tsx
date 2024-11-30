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

const Tab3: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // GitHub raw file URL
    const url =
      'https://raw.githubusercontent.com/username/repo/branch/path/to/data.json';

    fetch(url)
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const chartData = data
    ? {
        labels: data.readings.map((reading: any) =>
          new Date(reading.time).toLocaleTimeString()
        ),
        datasets: [
          {
            label: 'Alcohol Level (%)',
            data: data.readings.map((reading: any) => reading.level),
            fill: false,
            backgroundColor: 'rgba(38, 166, 154, 0.6)',
            borderColor: 'rgba(38, 166, 154, 1)',
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
          {data ? (
            <>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Current Alcohol Level</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <h2>{data.alcohol_level}%</h2>
                </IonCardContent>
              </IonCard>

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