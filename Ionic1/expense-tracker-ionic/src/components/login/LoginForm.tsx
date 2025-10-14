import {
  IonButton,
  IonInput,
  IonList,
} from "@ionic/react";
import {
} from "ionicons/icons";
import { useState } from "react";
import "./LoginForm.css";
import { LoginData } from "../../models/login";

interface LoginFormProps {
  onSubmit: (obj: LoginData) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

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
            paddingRight: "12px"
          }}
        >
          Connect to your account
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
          type={showPassword ? "text" : "password"}
          fill="outline"
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
          Login
        </IonButton>
      </IonList>
    </div>
  );
};

export default LoginForm;
