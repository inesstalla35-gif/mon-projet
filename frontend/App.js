import React from "react";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import store from "./src/store";
import Navigation from "./src/Navigation";

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}
