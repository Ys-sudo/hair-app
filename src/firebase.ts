import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAiqKHSOc3387M8bfQ81BuPd8CBHPzDShM",
  authDomain: "hair-color-app.firebaseapp.com",
  projectId: "hair-color-app",
  storageBucket: "hair-color-app.appspot.com",
  messagingSenderId: "6670601575",
  appId: "1:6670601575:web:d48f2bdf90c1f5fdd0b3c2",
  databaseURL:
    "https://hair-color-app-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
