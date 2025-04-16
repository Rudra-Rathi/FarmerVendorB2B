import { useTranslation } from "react-i18next";
import AuthForm from "@/components/auth/AuthForm";
import { Card, CardContent } from "@/components/ui/card";

const LoginPage = () => {
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
          {t('auth.accountAccess')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm initialTab="login" />
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    {t('auth.demoCredentials')}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <p><strong>{t('auth.farmer')}:</strong> farmer1 / password123</p>
                <p><strong>{t('auth.vendor')}:</strong> vendor1 / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
