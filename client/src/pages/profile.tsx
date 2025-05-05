import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Save, User } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Profile schema
const profileSchema = z.object({
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Current password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Please confirm your new password.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

const ProfilePage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}") as {
    id?: number;
    fullName?: string;
    email?: string;
    phone?: string;
    userType?: string;
    isVerified?: boolean;
  };
  
  const userId = userData?.id;

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });

  // Setup form for profile
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: userData?.fullName || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      profileForm.setValue("fullName", user.fullName);
      profileForm.setValue("email", user.email);
      profileForm.setValue("phone", user.phone);
    }
  }, [user, profileForm]);

  // Setup form for password change
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle profile update
  const handleProfileUpdate = async (data: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/users/${userId}`, data);
      
      // Update user data in localStorage
      const updatedUserData = { ...userData, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      
      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      
      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.profileUpdated'),
      });
    } catch (error: any) {
      toast({
        title: t('profile.updateFailed'),
        description: error.message || t('profile.updateError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (data: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/auth/change-password`, {
        userId,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      toast({
        title: t('profile.passwordChangeSuccess'),
        description: t('profile.passwordChanged'),
      });
      
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: t('profile.passwordChangeFailed'),
        description: error.message || t('profile.passwordChangeError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user initials for avatar
  const userInitials = userData?.fullName
    ? userData.fullName.split(" ").map((n: string) => n[0]).join("")
    : "U";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate font-heading">
                {t('profile.title')}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t('profile.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarFallback className="bg-primary text-white text-xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold">{userData?.fullName}</h3>
                    <p className="text-sm text-gray-500 mb-1">{userData?.email}</p>
                    <p className="text-sm text-gray-500 mb-4">{userData?.phone}</p>
                    
                    <div className="w-full">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">User Type:</span>
                        <span className="text-sm capitalize">{userData?.userType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Verified:</span>
                        <span className="text-sm">{userData?.isVerified ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="col-span-1 md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.manageProfile')}</CardTitle>
                  <CardDescription>
                    {t('profile.manageProfileDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-8">
                      <TabsTrigger value="profile">
                        {t('profile.personalInfo')}
                      </TabsTrigger>
                      <TabsTrigger value="security">
                        {t('profile.security')}
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Profile Tab */}
                    <TabsContent value="profile">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('profile.fullName')}</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.email')}</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.phone')}</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                              <Save className="mr-2 h-4 w-4" />
                              {isSubmitting ? t('actions.saving') : t('actions.saveChanges')}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    {/* Security Tab */}
                    <TabsContent value="security">
                      <div>
                        <h3 className="text-lg font-medium mb-4">{t('profile.changePassword')}</h3>
                        <Separator className="mb-6" />
                        
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6">
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('profile.currentPassword')}</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('profile.newPassword')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t('profile.confirmPassword')}</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <Button type="submit" disabled={isSubmitting}>
                                <User className="mr-2 h-4 w-4" />
                                {isSubmitting ? t('actions.saving') : t('actions.updatePassword')}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;