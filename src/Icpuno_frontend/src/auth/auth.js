import { AuthClient } from "@dfinity/auth-client";

export const initAuthClient = async () => {
  return await AuthClient.create();
};

export const loginWithII = async (authClient) => {
  await authClient.login({
    identityProvider: `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`,
    onSuccess: () => {
      console.log("Login successful");
    },
  });
  return authClient.getIdentity().getPrincipal().toString();
};