import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonItemGroup,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Home.css';
import React from 'react';

const Home = function Home() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItemGroup>
          <IonItem>
            <IonButton
              className="submit-button"
              shape="round"
              onClick={() => {
                console.log('Clicked 1');
              }}
            >
              Oh no!
            </IonButton>
          </IonItem>
          <IonItem>
            <IonButton
              onClick={() => {
                console.log('Clicked 1');
              }}
            >
              View stats
            </IonButton>
          </IonItem>
        </IonItemGroup>
      </IonContent>
    </IonPage>
  );
};

export default Home;
