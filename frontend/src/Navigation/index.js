import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Register from "../screens/register";
import Login from "../screens/login";
import Home from "../screens/Home";
import ProfileScreen from "../screens/profile";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profil" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
