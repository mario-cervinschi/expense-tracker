import { Redirect, Route, Switch } from "react-router-dom";
import {
  IonApp,
  IonHeader,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ellipse, square, triangle } from "ionicons/icons";
import Tab1 from "./pages/mainpage/Tab1";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import LoginPage from "./pages/auth/login/LoginPage";

// ... importurile CSS ...
import "./theme/variables.css";
import { AuthProvider } from "./pages/auth/AuthContext";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import RegisterPage from "./pages/auth/register/RegisterPage";

setupIonicReact();



const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            <Route exact path="/auth" component={LoginPage} />
            <Route exact path="/register" component={RegisterPage} />

            <ProtectedRoute exact path="/tab1">
              <Tab1 />
            </ProtectedRoute>

            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>

            <Redirect from="*" to="/auth" />
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
