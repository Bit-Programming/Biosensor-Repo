import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Tab3.css';

const Tab3: React.FC = () => {
  const [alcoholLevel, setAlcoholLevel] = useState<number | null>(null);

  useEffect(() => {
    // GitHub raw file URL
    const url = 'https://raw.githubusercontent.com/username/repo/branch/path/to/data.json';

    fetch(url)
      .then(response => response.json())
      .then(data => {
        // Assuming the JSON has an "alcohol_level" field
        setAlcoholLevel(data.alcohol_level);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Alcohol Level Stats</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ padding: '16px' }}>
          {alcoholLevel !== null ? (
            <h2>Current Alcohol Level: {alcoholLevel}%</h2>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;