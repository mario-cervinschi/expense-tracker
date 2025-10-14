import {
  IonAlert,
  IonContent,
  IonPage,
  IonLoading,
  useIonRouter,
} from "@ionic/react";
import LoginForm from "../../components/login/LoginForm";
import { useState } from "react";
import { LoginData } from "../../models/login";
import "./Authentification.css";

const Authentification: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginData | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const ionRouter = useIonRouter();

  const handleLoginSubmit = async (obj: LoginData) => {
    setLoginData(obj);
    setShowLoading(true);

    setTimeout(() => {
      setShowLoading(false);
      setAlertMessage(`Email: ${obj.email}; Password: ${obj.password}`);
      setShowAlert(true);
    }, 1500);
  };

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

          <LoginForm onSubmit={handleLoginSubmit} />

          <div className="auth-links">
            <p>
              Not a user?{" "}
              <a href="/register" style={{ color: "#8fa1f4" }}>
                Register
              </a>
            </p>
            <a href="/forgot-password" style={{ color: "#8fa1f4" }}>
              Forgot your password?
            </a>
          </div>
        </div>

        <IonLoading isOpen={showLoading} message={"Processing..."} />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={"Succes"}
          message={alertMessage}
          buttons={[
            {
              text: "OK",
              role: "confirm",
              handler: () => {
                ionRouter.push("/tab1", "forward", "replace");
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Authentification;
