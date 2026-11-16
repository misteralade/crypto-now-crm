import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { authServiceApi } from "../../api/auth.api";
import { LOCAL_STORAGE_KEYS, ROUTES } from "../../util/constants.util.ts";
import type { FormEvent } from "react";


export const useSignInPage = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const { email: queryEmail, password: queryPassword } = useSearch({
    from: "/",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    pingAdminUser();
  }, []);

  useEffect(() => {
    if (queryEmail) setEmail(queryEmail);
    if (queryPassword) setPassword(queryPassword);
  }, [queryEmail, queryPassword]);

  const pingAdminUser = () => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      navigate({ to: ROUTES.DASHBOARD });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const { success, message, data } = await authServiceApi.login({
        email,
        password,
      });

      if (!success) {
        setError(message || "Login failed. Please check your credentials.");
      } else if (data?.passwordResetRequired) {
        setError(message);
      } else if (data?.twoFactorRequired && data.challengeToken) {
        sessionStorage.setItem("adminVerificationChallenge", data.challengeToken);
        navigate({
          to: ROUTES.VERIFY_TWO_FACTOR,
          search: { email },
        });
      } else {
        setError("Unable to start verification. Please sign in again.");
      }
    } catch (error: any) {
      setError(
        error.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // 🧩 Values
    error,
    email,
    password,
    showPassword,
    isLoading,

    // ⚙️ Functions
    handleSubmit,
    setEmail,
    setPassword,
    setShowPassword,
  };
};
