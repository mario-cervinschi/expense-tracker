import {
  IonAlert,
  IonContent,
  IonPage,
  IonLoading,
  useIonRouter,
} from "@ionic/react";
import AuthForm from "../../../components/auth/AuthForm";
import { useEffect, useState } from "react";
import { AuthData } from "../../../models/auth";
import "./../Authentification.css";

import * as AuthService from "../../../services/AuthService";
import { useAuth } from "../AuthContext";

const LoginPage: React.FC = () => {
  const { login, isAuthenticated  } = useAuth();
  const router = useIonRouter();

  const [showAlert, setShowAlert] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [headerMessage, setHeaderMessage] = useState("");

  const handleLoginSubmit = async (obj: AuthData) => {
    setShowLoading(true);

    try {
      const response = await AuthService.userLogin(obj);
      login(response.token);
      router.push("/tab1", "root", "replace");
    } catch (err) {
      console.error(err);
      setAlertMessage(`Invalid credentials. ${err}`);
      setHeaderMessage(`Error`);
      setShowAlert(true);
    } finally {
        setShowLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/tab1", "root", "replace");
    }
  }, [isAuthenticated, router]);

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <div className="auth-container">
          <div className="welcome-section">
            <h1>
              All your expenses<span style={{ fontSize: "0.8rem" }}></span> in
              one place
            </h1>
          </div>

          <AuthForm onSubmit={handleLoginSubmit} title="Connect to your account" buttonName="LOGIN" />

          <div className="auth-links">
            <p>
              Not a user?{" "}
              <a href="/register" style={{ color: "#8fa1f4" }}>
                Register
              </a>
            </p>
          </div>
        </div>

        <IonLoading isOpen={showLoading} message={"Processing..."} />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={headerMessage}
          message={alertMessage}
          buttons={[
            {
              text: "OK",
              role: "confirm",
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
