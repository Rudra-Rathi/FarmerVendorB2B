import { useTranslation } from "react-i18next";
import AuthForm from "@/components/auth/AuthForm";

const RegisterPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <svg className="h-12 w-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2L1,9L5,11V22H19V11L23,9L12,2M12,5.5L18,9.5V10H6V9.5L12,5.5M6,12H18V20H6V12M9.5,13A1.5,1.5 0 0,0 8,14.5A1.5,1.5 0 0,0 9.5,16A1.5,1.5 0 0,0 11,14.5A1.5,1.5 0 0,0 9.5,13M14.5,13A1.5,1.5 0 0,0 13,14.5A1.5,1.5 0 0,0 14.5,16A1.5,1.5 0 0,0 16,14.5A1.5,1.5 0 0,0 14.5,13Z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-heading">
          {t('auth.createAccount')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.registerSubtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm initialTab="register" />
      </div>
    </div>
  );
};

export default RegisterPage;
