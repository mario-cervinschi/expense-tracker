import {
  IonButton,
  IonInput,
  IonList,
} from "@ionic/react";
import {
} from "ionicons/icons";
import { useState } from "react";
import "./AuthForm.css";
import { AuthData } from "../../models/auth";

interface AuthFormProps {
  title: string;
  buttonName: string;
  onSubmit: (obj: AuthData) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, buttonName, title }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onSubmit({ email, password });
  };

  return (
    <div className="container">
      <IonList className="login-form-list">
        <p
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "18px",
            paddingLeft:"12px",
            paddingRight: "12px",
            minWidth: "346px"
          }}
        >
          {title}
        </p>
        <IonInput
          className="login-form-input"
          value={email}
          onIonInput={(e) => setEmail(e.detail.value!)}
          label="Email"
          clearInput={true}
          labelPlacement="floating"
          fill="outline"
          placeholder="Enter your email"
        ></IonInput>
        <IonInput
          label="Password"
          value={password}
          fill="outline"
          type="password"
          labelPlacement="floating"
          onIonInput={(e) => setPassword(e.detail.value!)}
          placeholder="Enter your password"
        ></IonInput>
        <IonButton
          expand="block"
          fill="outline"
          shape="round"
          onClick={handleSubmit}
          className="login-button"
          size="default"
        >
          {buttonName}
        </IonButton>
      </IonList>
    </div>
  );
};

export default AuthForm;
