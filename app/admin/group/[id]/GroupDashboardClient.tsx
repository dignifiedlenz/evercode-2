"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Users, MapPin, ChevronLeft } from "lucide-react";
import { UserRole } from "@prisma/client";

interface GroupDashboardClientProps {
  group: {
    id: string;
    name: string;
    managers: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    }[];
    region?: {
      id: string;
      name: string;
      managers: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
      }[];
      diocese?: {
        id: string;
        name: string;
        managers: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          email: string;
        }[];
      } | null;
    } | null;
    users: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      role: UserRole;
    }[];
  };
}

export default function GroupDashboardClient({ group }: GroupDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("management");

  const totalUsers = group.users.length;
  const activeUsers = group.users.filter(user => user.role !== "USER").length;
  const completionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 w-full h-full"
        style={{
          backgroundImage: "url('/540598ldsdl.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 sm:px-28 md:px-48 w-full min-h-screen">
        {/* Header Section */}
        <div className="flex items-center gap-4 py-10 sm:pt-20 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="bg-black/85 border-white/10 text-white hover:bg-black/90"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-morion text-white">{group.name}</h1>
            <p className="text-white/60 font-morion-light mt-1">
              {group.region?.diocese?.name || "No Diocese"} - {group.region?.name || "No Region"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 font-morion-medium">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-black/85 backdrop-blur-md border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-white text-sm">Total Users</p>
                  <p className="text-2xl text-white">{totalUsers}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-black/85 backdrop-blur-md border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-white text-sm">Active Users</p>
                  <p className="text-2xl text-white">{activeUsers}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-black/85 backdrop-blur-md border-white/10 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/20 w-12 h-12 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-white text-sm">Completion Rate</p>
                  <p className="text-2xl text-white">{completionRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-black/85 backdrop-blur-md border border-white/10">
                <TabsTrigger 
                  value="management" 
                  className="text-white data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
                >
                  Management
                </TabsTrigger>
                <TabsTrigger 
                  value="progress" 
                  className="text-white data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
                >
                  Progress
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="text-white data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
                >
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="management" className="mt-4">
                <div className="space-y-4">
                  {group.users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg text-white">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>
                        <div className="text-white/60 text-sm">
                          Role: {user.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="progress" className="mt-4">
                <div className="text-white">Progress tracking coming soon...</div>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-white/10">
                    <h3 className="text-lg text-white mb-2">Group Details</h3>
                    <div className="space-y-2">
                      <p className="text-white/60">
                        <span className="text-white">Region:</span> {group.region?.name || "No Region"}
                      </p>
                      <p className="text-white/60">
                        <span className="text-white">Diocese:</span> {group.region?.diocese?.name || "No Diocese"}
                      </p>
                      <p className="text-white/60">
                        <span className="text-white">Managers:</span>{" "}
                        {group.managers.length > 0
                          ? group.managers.map(manager => 
                              `${manager.firstName} ${manager.lastName}`
                            ).join(", ")
                          : "No Managers"}
                      </p>
                      <p className="text-white/60">
                        <span className="text-white">Manager Emails:</span>{" "}
                        {group.managers.length > 0
                          ? group.managers.map(manager => manager.email).join(", ")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 