import React, { useContext, useState} from "react";
import Toast from "../components/Toast";
import { useQuery } from "react-query";
import * as apiClient from "../api-client"

type ToastMessage={
    message:string;
    type:"SUCCESS"|"ERROR";
}
type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  isLoading: boolean;
};

const AppContext = React.createContext<AppContext | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasVerified, setHasVerified] = useState<boolean>(false);

  const { isLoading: queryLoading } = useQuery(
    "verifyToken",
    apiClient.validateToken,
    {
      retry: false,
      onSuccess: () => {
        setIsLoggedIn(true);
        setHasVerified(true);
      },
      onError: () => {
        setIsLoggedIn(false);
        setHasVerified(true);
      },
    }
  );

  // Stay in "loading" state until both the query has finished AND the
  // isLoggedIn state update from onSuccess/onError has been applied.
  // Without this, there is one render where isLoading=false but
  // isLoggedIn=false, causing ProtectedRoute to redirect to /sign-in.
  const isLoading = queryLoading || !hasVerified;

  return (
    <AppContext.Provider
      value={{
        showToast: (toastMessage) => {
          setToast(toastMessage);
        },
        isLoggedIn,
        setIsLoggedIn,
        isLoading,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToast(undefined);
          }}
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext=()=>{
    const context= useContext(AppContext);
    return context as AppContext;
}