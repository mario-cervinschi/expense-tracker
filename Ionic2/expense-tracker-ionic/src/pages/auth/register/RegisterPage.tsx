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

const RegisterPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useIonRouter();

  const [showAlert, setShowAlert] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [headerMessage, setHeaderMessage] = useState("");

  const handleRegisterSubmit = async (obj: AuthData) => {
    setShowLoading(true);

    try {
      const response = await AuthService.userRegister(obj);
      router.push("/auth", "root", "replace");
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
      router.push("/transactions", "root", "replace");
    }
  }, [isAuthenticated, router]);

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <div className="auth-container">
          <div className="welcome-section">
            <h1>
              Join the best expense manager platform
              <span style={{ fontSize: "0.8rem" }}></span>
            </h1>
          </div>

          <AuthForm
            onSubmit={handleRegisterSubmit}
            title="Register now"
            buttonName="REGISTER"
          />

          <div className="auth-links">
            <p>
              Already an user?{" "}
              <a href="/auth" style={{ color: "#8fa1f4" }}>
                Login
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

export default RegisterPage;
