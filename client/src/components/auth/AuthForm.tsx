import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Upload } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { userTypes, registerUserSchema, loginSchema } from "@shared/schema";

interface AuthFormProps {
  initialTab?: "login" | "register";
}

const AuthForm = ({ initialTab = "login" }: AuthFormProps) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [licenseUrl, setLicenseUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      phone: "",
      userType: userTypes.VENDOR,
      licenseUrl: "",
    },
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const userData = await response.json();
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.welcomeBack', { name: userData.fullName }),
      });
      
      // Redirect based on user type
      if (userData.userType === userTypes.FARMER) {
        setLocation("/farmer/dashboard");
      } else {
        setLocation("/vendor/dashboard");
      }
    } catch (error: any) {
      toast({
        title: t('auth.loginError'),
        description: error.message || t('auth.invalidCredentials'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (data: z.infer<typeof registerUserSchema>) => {
    setIsSubmitting(true);
    try {
      // If farmer type, validate license
      if (data.userType === userTypes.FARMER && !licenseUrl) {
        toast({
          title: t('auth.error'),
          description: t('auth.licenseMissing'),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Set license URL
      if (data.userType === userTypes.FARMER) {
        data.licenseUrl = licenseUrl;
      }

      // Register user
      const response = await apiRequest("POST", "/api/auth/register", data);
      const userData = await response.json();
      
      toast({
        title: t('auth.registerSuccess'),
        description: userData.isVerified 
          ? t('auth.accountCreated') 
          : t('auth.accountPendingVerification'),
      });
      
      // Switch to login tab after successful registration
      setActiveTab("login");
      loginForm.setValue("username", data.username);
    } catch (error: any) {
      toast({
        title: t('auth.registerError'),
        description: error.message || t('auth.registrationFailed'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    // In a real app, upload the file to a server
    // For this prototype, we'll simulate an upload
    
    try {
      // Simulate file upload
      setLicenseUrl("https://example.com/licenses/dummy-license.jpg");
      
      toast({
        title: t('auth.uploadSuccess'),
        description: t('auth.licenseUploaded'),
      });
    } catch (error) {
      toast({
        title: t('auth.uploadError'),
        description: t('auth.licenseUploadFailed'),
        variant: "destructive",
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {t('auth.welcomeToUnited')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.platformDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.username')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.usernamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder={t('auth.passwordPlaceholder')} 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={toggleShowPassword}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          {/* Register Form */}
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.fullName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.fullNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.username')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('auth.usernamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.phonePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.password')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder={t('auth.passwordPlaceholder')} 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder={t('auth.confirmPasswordPlaceholder')} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={registerForm.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.userType')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('auth.selectUserType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={userTypes.FARMER}>{t('auth.farmer')}</SelectItem>
                          <SelectItem value={userTypes.VENDOR}>{t('auth.vendor')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* License upload for farmers */}
                {registerForm.watch("userType") === userTypes.FARMER && (
                  <div className="space-y-2">
                    <FormLabel>{t('auth.farmingLicense')}</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        id="license"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={handleLicenseUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("license")?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {licenseUrl ? t('auth.licenseUploaded') : t('auth.uploadLicense')}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('auth.licenseNote')}
                    </p>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('auth.registering') : t('auth.register')}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
