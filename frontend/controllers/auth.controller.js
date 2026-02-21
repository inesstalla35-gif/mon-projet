import { loginService } from "../services/auth.service";

export const handleLoginController = async ({
  email,
  motDePasse,
  navigation,
  setIsLoading,
  setMessage,
}) => {
  setIsLoading(true);
  setMessage("");

  try {
    const data = await loginService(email, motDePasse);

    setMessage(data.message || "Connexion réussie");

    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  } catch (error) {
    setMessage(error.message || "Email ou mot de passe incorrect");
  } finally {
    setIsLoading(false);
  }
};
