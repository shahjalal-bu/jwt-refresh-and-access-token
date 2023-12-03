import { useState } from "react";
import useAxiosInterceptor from "./utils/useAxiosIntercepter";
function App() {
  const { login, test } = useAxiosInterceptor();
  const [state, setState] = useState({
    email: "",
    password: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };
  const loginFn = async () => {
    try {
      const res = await login(state);
      console.log(res);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("accessToken", res.data.accessToken);
    } catch (error) {
      console.log(error);
    }
  };
  const testRequest = async () => {
    try {
      const res = await test();
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <input
          onChange={inputHandle}
          value={state.email}
          type="email"
          name="email"
        />
        <input
          onChange={inputHandle}
          value={state.password}
          name="password"
          type="password"
        />
        <button onClick={loginFn}>Login</button>
        <button onClick={testRequest}>Test</button>
      </header>
    </div>
  );
}

export default App;
