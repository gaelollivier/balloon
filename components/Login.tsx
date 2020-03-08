import React from 'react';

const login = async () => {
  const authInstance = gapi.auth2.getAuthInstance();
  return authInstance.signIn();
};

const Login = ({
  onLogin,
}: {
  onLogin: (user: gapi.auth2.GoogleUser) => void;
}) => {
  const handleLogin = async () => {
    onLogin(await login());
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg overflow-hidden bg-fixed p-5">
        <p className="text-xl leading-tight text-center">Cloud Balloon</p>
        <div className="mt-4">
          <button
            className="text-green-500 hover:text-white hover:bg-green-500 border border-green-500 text-xs font-semibold rounded-full px-4 py-1 leading-normal"
            onClick={handleLogin}
          >
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
