import { useEffect } from "react";
import axios from "axios";
import jwtConfig from "./jwtConfig";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

const setAccessToken = (value) => {
  localStorage.setItem(jwtConfig.accessTokenKey, value);
};
const setRefreshToken = (value) => {
  localStorage.setItem(jwtConfig.refreshTokenKey, value);
};
// getAccessToken will access the access token form the local store age
const getAccessToken = () => {
  return localStorage.getItem(jwtConfig.accessTokenKey);
};
const getRefreshToken = () => {
  return api.post(
    jwtConfig.refreshTokenEndPoint,
    {},
    { withCredentials: true }
  );
};
const useAxiosInterceptor = () => {
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const accessToken = getAccessToken();
        if (accessToken) {
          //and set in request header
          config.headers.Authorization = `${jwtConfig.tokenType} ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // Response interceptor
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          try {
            const newToken = await getRefreshToken();
            setAccessToken(newToken.data.accessToken);
            setRefreshToken(newToken.data.refreshToken);
            return api.request(error.config);
          } catch (refreshError) {
            console.error("Error refreshing access token", refreshError);
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);
  const login = (data) => {
    return api.post(jwtConfig.login, data, { withCredentials: true });
  };
  const test = () => {
    return api.post("/test-request", {}, { withCredentials: true });
  };
  return {
    api,
    login,
    test,
  };
};

export default useAxiosInterceptor;
