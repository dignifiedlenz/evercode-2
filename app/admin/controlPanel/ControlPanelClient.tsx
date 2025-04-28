"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Users, UserCheck, BarChart, User, Search, LayoutGrid, Table2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserRole } from "@prisma/client";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface User {
  id: string;
  auth_id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  groupId: string | null;
  group?: {
    id: string;
    name: string;
    regionId: string;
  };
}

interface Group {
  id: string;
  name: string;
  regionId: string;
  managers: Manager[];
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }[];
  statistics: {
    totalUsers: number;
    usersWithProgress: number;
    averageProgress: number;
  };
}

interface Region {
  id: string;
  name: string;
  dioceseId: string;
  managers: Manager[];
  groups: Group[];
}

interface Diocese {
  id: string;
  name: string;
  managers: Manager[];
  regions: Region[];
}

interface ControlPanelClientProps {
  initialUsers: User[];
  initialGroups: Group[];
  initialRegions: Region[];
  initialDioceses: Diocese[];
}

interface EditManagersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'diocese' | 'region' | 'group';
  entityId: string;
  currentManagers: Manager[];
  onSave: (entityType: 'diocese' | 'region' | 'group', entityId: string, managerIds: string[]) => Promise<void>;
}

function EditManagersDialog({
  isOpen,
  onClose,
  entityType,
  entityId,
  currentManagers,
  onSave
}: EditManagersDialogProps) {
  const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedManagerIds(currentManagers.map(m => m.id));
      fetchAvailableManagers(entityType);
    }
  }, [isOpen, currentManagers, entityType]);

  const fetchAvailableManagers = async (type: string) => {
    try {
      // Map the entity type to the correct role
      const roleMap: Record<string, string> = {
        'diocese': 'SUPER_ADMIN',
        'region': 'REGIONAL_ADMIN',
        'group': 'LOCAL_ADMIN'
      };

      const role = roleMap[type];
      if (!role) {
        throw new Error('Invalid entity type');
      }

      const response = await fetch(`/api/managers?role=${role}`);
      if (!response.ok) throw new Error('Failed to fetch managers');
      const data = await response.json();
      setAvailableManagers(data);
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to fetch available managers');
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(entityType, entityId, selectedManagerIds);
      onClose();
      toast.success('Managers updated successfully');
    } catch (error) {
      console.error('Error updating managers:', error);
      toast.error('Failed to update managers');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/85 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Edit Managers</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/60">Select Managers</label>
            <Select
              value={selectedManagerIds.join(',')}
              onValueChange={(value) => setSelectedManagerIds(value.split(',').filter(Boolean))}
            >
              <SelectTrigger className="bg-black/25 border-white/10">
                <SelectValue placeholder="Select managers" />
              </SelectTrigger>
              <SelectContent className="bg-black/85 border-white/10">
                <ScrollArea className="h-72">
                  {availableManagers.map((manager) => (
                    <SelectItem
                      key={manager.id}
                      value={manager.id}
                      className="text-white hover:bg-white/10"
                    >
                      {manager.firstName} {manager.lastName} ({manager.email})
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-black/25 border-white/10 text-white hover:bg-black/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-secondary hover:bg-secondary/80"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ControlPanelClient({
  initialUsers,
  initialGroups,
  initialRegions,
  initialDioceses
}: ControlPanelClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [dioceses, setDioceses] = useState<Diocese[]>(initialDioceses);
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingRegion, setIsCreatingRegion] = useState(false);
  const [isCreatingDiocese, setIsCreatingDiocese] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedDiocese, setSelectedDiocese] = useState<Diocese | null>(null);
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [newGroup, setNewGroup] = useState({
    name: "",
    regionId: "",
    managerIds: [] as string[]
  });
  const [newRegion, setNewRegion] = useState({
    name: "",
    dioceseId: "",
  });
  const [newDiocese, setNewDiocese] = useState({
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "hierarchy">("table");
  const [availableManagers, setAvailableManagers] = useState<Manager[]>([]);
  const [editManagersDialog, setEditManagersDialog] = useState<{
    isOpen: boolean;
    entityType: 'diocese' | 'region' | 'group';
    entityId: string;
    currentManagers: Manager[];
  } | null>(null);

  // Filter data based on search query and active tab
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return initialUsers;
    const query = searchQuery.toLowerCase();
    return initialUsers.filter(user => 
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [initialUsers, searchQuery]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return initialGroups;
    const query = searchQuery.toLowerCase();
    return initialGroups.filter(group => 
      group.name.toLowerCase().includes(query) ||
      group.managers.some(manager => 
        `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(query)
      )
    );
  }, [initialGroups, searchQuery]);

  const filteredRegions = useMemo(() => {
    if (!searchQuery) return initialRegions;
    const query = searchQuery.toLowerCase();
    return initialRegions.filter(region => 
      region.name.toLowerCase().includes(query)
    );
  }, [initialRegions, searchQuery]);

  const filteredDioceses = useMemo(() => {
    if (!searchQuery) return initialDioceses;
    const query = searchQuery.toLowerCase();
    return initialDioceses.filter(diocese => 
      diocese.name.toLowerCase().includes(query)
    );
  }, [initialDioceses, searchQuery]);

  // Get placeholder text based on active tab
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "users":
        return "Search users by name or email...";
      case "groups":
        return "Search groups by name or manager...";
      case "regions":
        return "Search regions by name or manager...";
      case "dioceses":
        return "Search dioceses by name or manager...";
      default:
        return "Search...";
    }
  };

  // Function to fetch all data
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all data...");
      
      const [usersRes, groupsRes, regionsRes, diocesesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/groups'),
        fetch('/api/regions'),
        fetch('/api/dioceses')
      ]);

      if (!usersRes.ok || !groupsRes.ok || !regionsRes.ok || !diocesesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [usersData, groupsData, regionsData, diocesesData] = await Promise.all([
        usersRes.json(),
        groupsRes.json(),
        regionsRes.json(),
        diocesesRes.json()
      ]);

      // Update all state variables with the new data
      setUsers(usersData);
      setGroups(groupsData);
      setRegions(regionsData);
      setDioceses(diocesesData);
      
      console.log("Data refreshed successfully");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  // Set up automatic data fetching
  useEffect(() => {
    // Initial fetch
    fetchAllData();

    // Set up interval for periodic updates (every 5 seconds)
    const interval = setInterval(fetchAllData, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch("/api/managers?role=LOCAL_ADMIN");
        if (!response.ok) throw new Error("Failed to fetch managers");
        const managers = await response.json();
        setAvailableManagers(managers);
      } catch (error) {
        console.error("Error fetching managers:", error);
        toast.error("Failed to fetch available managers");
      }
    };

    fetchManagers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Optimistically update the user's role in the UI
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole as UserRole }
            : user
        )
      );

      const response = await fetch('/api/users/role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }
      
      // Fetch fresh data to ensure everything is in sync
      await fetchAllData();
      toast.success("Role updated successfully");
    } catch (error) {
      console.error("Error updating role:", error);
      // Revert optimistic update by fetching fresh data
      await fetchAllData();
      toast.error("Failed to update role");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(newUser.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation - at least 8 characters
    if (newUser.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(),
          email: newUser.email.trim().toLowerCase(),
          password: newUser.password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }
      
      await fetchAllData(); // Refresh all data
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setIsAddingUser(false);
      toast.success("User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name) {
      toast.error("Please enter a group name");
      return;
    }
    if (!newGroup.regionId) {
      toast.error("Please select a region");
      return;
    }
    if (newGroup.managerIds.length === 0) {
      toast.error("Please select at least one manager");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });

      if (!response.ok) throw new Error("Failed to create group");

      await fetchAllData();
      setIsCreatingGroup(false);
      setNewGroup({ name: "", regionId: "", managerIds: [] });
      toast.success("Group created successfully");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRegion = async () => {
    try {
      const response = await fetch('/api/regions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRegion),
      });
      
      if (!response.ok) throw new Error('Failed to create region');
      
      await fetchAllData(); // Refresh all data
      
      setIsCreatingRegion(false);
      setNewRegion({
        name: "",
        dioceseId: "",
      });
      
      toast.success("Region created successfully");
    } catch (error) {
      console.error("Error creating region:", error);
      toast.error("Failed to create region");
    }
  };

  const handleCreateDiocese = async () => {
    try {
      const response = await fetch('/api/dioceses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDiocese),
      });
      
      if (!response.ok) throw new Error('Failed to create diocese');
      
      await fetchAllData(); // Refresh all data
      
      setIsCreatingDiocese(false);
      setNewDiocese({
        name: "",
      });
      
      toast.success("Diocese created successfully");
    } catch (error) {
      console.error("Error creating diocese:", error);
      toast.error("Failed to create diocese");
    }
  };

  const handleUpdateManagers = async (entityType: 'diocese' | 'region' | 'group', entityId: string, managerIds: string[]) => {
    try {
      // Get the role for the entity type
      const roleMap: Record<string, string> = {
        'diocese': 'SUPER_ADMIN',
        'region': 'REGIONAL_ADMIN',
        'group': 'LOCAL_ADMIN'
      };
      
      const role = roleMap[entityType];
      if (!role) {
        throw new Error('Invalid entity type');
      }

      // Optimistically update the UI
      const updateEntityState = (prevState: any[]) => {
        return prevState.map(entity => {
          if (entity.id === entityId) {
            // Find the managers in our current users list
            const newManagers = managerIds.map(id => {
              const user = users.find(u => u.id === id);
              if (!user) return null;
              return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
              };
            }).filter(Boolean);

            return {
              ...entity,
              managers: newManagers
            };
          }
          return entity;
        });
      };

      // Update the appropriate state based on entity type
      switch (entityType) {
        case 'diocese':
          setDioceses(prev => updateEntityState(prev));
          break;
        case 'region':
          setRegions(prev => updateEntityState(prev));
          break;
        case 'group':
          setGroups(prev => updateEntityState(prev));
          break;
      }

      // Update roles for all selected managers
      const roleUpdatePromises = managerIds.map(async (userId) => {
        try {
          const response = await fetch('/api/users/role', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              role,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to update role for user ${userId}`);
          }
          
          return response.json();
        } catch (error) {
          console.error(`Error updating role for user ${userId}:`, error);
          throw error;
        }
      });

      // Wait for all role updates to complete
      await Promise.all(roleUpdatePromises);

      // Then update the managers for the entity
      const response = await fetch('/api/managers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          managerIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update managers');
      }

      // Fetch fresh data to ensure everything is in sync
      await fetchAllData();
      toast.success('Managers updated successfully');
    } catch (error) {
      console.error('Error updating managers:', error);
      // Revert optimistic update by fetching fresh data
      await fetchAllData();
      toast.error(error instanceof Error ? error.message : 'Failed to update managers');
    }
  };

  const HierarchicalView = () => {
    return (
      <div className="space-y-6">
        {dioceses.map((diocese) => (
          <div key={diocese.id} className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/20 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-secondary text-sm">{diocese.regions.length}</span>
                </div>
                <h3 className="text-xl text-white">{diocese.name}</h3>
              </div>
              {diocese.managers.length > 0 && (
                <div className="text-white/60 text-sm">
                  Managers: {diocese.managers.map(manager => `${manager.firstName} ${manager.lastName}`).join(', ')}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              {diocese.regions.map((region) => (
                <div 
                  key={region.id} 
                  className="bg-black/75 backdrop-blur-md p-4 rounded-lg border border-white/10 cursor-pointer hover:bg-black/85 transition-colors"
                  onClick={() => router.push(`/admin/region/${region.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-secondary/20 w-8 h-8 rounded-full flex items-center justify-center">
                        <span className="text-secondary text-sm">{region.groups.length}</span>
                      </div>
                      <h4 className="text-lg text-white">{region.name}</h4>
                    </div>
                    {region.managers.length > 0 && (
                      <div className="text-white/60 text-sm">
                        Managers: {region.managers.map(manager => `${manager.firstName} ${manager.lastName}`).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 pl-3">
                    {region.groups.map((group) => (
                      <div 
                        key={group.id} 
                        className="bg-black/65 backdrop-blur-md p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-black/75 transition-colors"
                        onClick={() => router.push(`/admin/group/${group.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-secondary/20 w-6 h-6 rounded-full flex items-center justify-center">
                              <span className="text-secondary text-xs">{group.users.length}</span>
                            </div>
                            <h5 className="text-white">{group.name}</h5>
                          </div>
                        </div>
                        
                        <div className="pl-2">
                          {group.users.map((user) => (
                            <div key={user.id} className="bg-black/55 backdrop-blur-md p-2 rounded-lg border border-white/10 mb-2">
                              <div className="flex items-center justify-between">
                                <div className="text-white text-sm">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-white/60 text-xs">
                                  {user.role}
                                </div>
                              </div>
                              <div className="text-white/40 text-xs">{user.email}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
        <div className="absolute inset-0 bg-black/80" /> {/* Dark overlay */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 sm:px-28 md:px-48 w-full min-h-screen">
        {/* Header Section */}
        <div className="flex py-10 sm:pt-20 items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-morion text-white">Control Panel</h1>
            <p className="text-white/60 font-morion-light mt-1">Admin Dashboard</p>
          </div>
        </div>

        <div className="grid gap-6 font-morion-medium">
          

          {/* Search and Tabs */}
          <div className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-white/60 z-10" />
                  <Input
                    placeholder={getSearchPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-black backdrop-blur-md border-white/10 text-white placeholder:text-white/60 w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("table")}
                    className={`border-white/10 ${viewMode === "table" ? "bg-secondary/20 text-secondary" : "bg-black/85 text-white/60"}`}
                  >
                    <Table2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("hierarchy")}
                    className={`border-white/10 ${viewMode === "hierarchy" ? "bg-secondary/20 text-secondary" : "bg-black/85 text-white/60"}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {viewMode === "table" ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-black/85 backdrop-blur-md border border-white/10">
                  <TabsTrigger 
                    value="users" 
                    className="text-white data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger 
                    value="groups" 
                    className="text-white data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
                  >
                    Groups
                  </TabsTrigger>
                  <TabsTrigger 
                    value="regions" 
                    className="text-white data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
                  >
                    Regions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dioceses" 
                    className="text-white data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary"
                  >
                    Dioceses
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-4">
                  <div className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
                    <div className="flex flex-row items-center justify-between mb-4">
                      <h2 className="text-xl text-white">Users</h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="bg-secondary/20 hover:bg-secondary text-white"
                            onClick={() => setIsAddingUser(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/85 border-white/10 text-white">
                          <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            handleAddUser();
                          }} className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">First Name</label>
                              <Input
                                required
                                placeholder="Enter first name"
                                value={newUser.firstName}
                                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                className="bg-black/25 border-white/10 text-white placeholder:text-white/60"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">Last Name</label>
                              <Input
                                required
                                placeholder="Enter last name"
                                value={newUser.lastName}
                                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                className="bg-black/25 border-white/10 text-white placeholder:text-white/60"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">Email</label>
                              <Input
                                required
                                type="email"
                                placeholder="Enter email address"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="bg-black/25 border-white/10 text-white placeholder:text-white/60"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-white/60">Password</label>
                              <Input
                                required
                                type="password"
                                placeholder="Enter password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="bg-black/25 border-white/10 text-white placeholder:text-white/60"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddingUser(false)}
                                className="bg-black/25 border-white/10 text-white hover:bg-black/50"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-secondary hover:bg-secondary/80"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  'Add User'
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-white">Name</TableHead>
                            <TableHead className="text-white">Email</TableHead>
                            <TableHead className="text-white">Role</TableHead>
                            <TableHead className="text-white">Group</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.firstName} {user.lastName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Select
                                  value={user.role}
                                  onValueChange={(value) => handleRoleChange(user.id, value)}
                                >
                                  <SelectTrigger className="bg-black/85 backdrop-blur-md border-white/10 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black/85 backdrop-blur-md border-white/10">
                                    <SelectItem value="USER" className="text-white hover:bg-white/10">User</SelectItem>
                                    <SelectItem value="LOCAL_ADMIN" className="text-white hover:bg-white/10">Local Admin</SelectItem>
                                    <SelectItem value="REGIONAL_ADMIN" className="text-white hover:bg-white/10">Regional Admin</SelectItem>
                                    <SelectItem value="SUPER_ADMIN" className="text-white hover:bg-white/10">Super Admin</SelectItem>
                                    <SelectItem value="ROOT_ADMIN" className="text-white hover:bg-white/10">Root Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>{user.group?.name || "No Group"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="groups" className="mt-4">
                  <div className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
                    <div className="flex flex-row items-center justify-between mb-4">
                      <h2 className="text-xl text-white">Groups</h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-secondary/20 hover:bg-secondary text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Group
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 backdrop-blur-md text-white border-white/10">
                          <DialogHeader>
                            <DialogTitle>Create New Group</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Group Name"
                              value={newGroup.name}
                              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                              className="bg-black/85 backdrop-blur-md border-white/10 text-white"
                            />
                            <Select
                              value={newGroup.regionId}
                              onValueChange={(value) => setNewGroup({ ...newGroup, regionId: value })}
                            >
                              <SelectTrigger className="bg-black/85 backdrop-blur-md border-white/10 text-white">
                                <SelectValue placeholder="Select Region" />
                              </SelectTrigger>
                              <SelectContent className="bg-black/85 backdrop-blur-md border-white/10">
                                {regions.map((region) => (
                                  <SelectItem 
                                    key={region.id} 
                                    value={region.id}
                                    className="text-white hover:bg-white/10"
                                  >
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={newGroup.managerIds.join(',')}
                              onValueChange={(value) => setNewGroup({ 
                                ...newGroup, 
                                managerIds: value.split(',').filter(Boolean)
                              })}
                            >
                              <SelectTrigger className="bg-black/85 backdrop-blur-md border-white/10 text-white">
                                <SelectValue placeholder="Select Managers">
                                  {newGroup.managerIds.length > 0 
                                    ? `${newGroup.managerIds.length} managers selected`
                                    : "Select Managers"
                                  }
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="bg-black/85 backdrop-blur-md border-white/10">
                                {availableManagers.map((manager) => (
                                  <SelectItem 
                                    key={manager.id} 
                                    value={manager.id}
                                    className="text-white hover:bg-white/10"
                                  >
                                    {manager.firstName} {manager.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={handleCreateGroup}>Create Group</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-white">Name</TableHead>
                            <TableHead className="text-white">Managers</TableHead>
                            <TableHead className="text-white">Users</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGroups.map((group) => (
                            <TableRow 
                              key={group.id}
                              className="cursor-pointer hover:bg-white/5"
                              onClick={() => router.push(`/admin/group/${group.id}`)}
                            >
                              <TableCell className="text-white">{group.name}</TableCell>
                              <TableCell className="text-white/60">
                                {group.managers.map(manager => `${manager.firstName} ${manager.lastName}`).join(", ")}
                              </TableCell>
                              <TableCell className="text-white/60">{group.users.length} users</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditManagersDialog({
                                      isOpen: true,
                                      entityType: 'group',
                                      entityId: group.id,
                                      currentManagers: group.managers,
                                    });
                                  }}
                                  className="bg-black/25 border-white/10 text-white hover:bg-black/50"
                                >
                                  Edit Managers
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="regions" className="mt-4">
                  <div className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
                    <div className="flex flex-row items-center justify-between mb-4">
                      <h2 className="text-xl text-white">Regions</h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-secondary/20 hover:bg-secondary text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Region
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900/50 border-gray-800 text-white">
                          <DialogHeader>
                            <DialogTitle>Add New Region</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Region Name"
                              value={newRegion.name}
                              onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                              className="bg-black/85 backdrop-blur-md border-white/10 text-white placeholder:text-white/60"
                            />
                            <Select
                              value={newRegion.dioceseId}
                              onValueChange={(value) => setNewRegion({ ...newRegion, dioceseId: value })}
                            >
                              <SelectTrigger className="bg-black/85 backdrop-blur-md border-white/10 text-white">
                                <SelectValue placeholder="Select Diocese" />
                              </SelectTrigger>
                              <SelectContent className="bg-black/85 backdrop-blur-md border-white/10">
                                {dioceses.map((diocese) => (
                                  <SelectItem key={diocese.id} value={diocese.id} className="text-white hover:bg-white/10">
                                    {diocese.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={handleCreateRegion}>Create Region</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-white">Name</TableHead>
                            <TableHead className="text-white">Managers</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRegions.map((region) => (
                            <TableRow 
                              key={region.id}
                              className="cursor-pointer hover:bg-white/5"
                              onClick={() => router.push(`/admin/region/${region.id}`)}
                            >
                              <TableCell className="text-white">{region.name}</TableCell>
                              <TableCell className="text-white/60">
                                {region.managers.map(manager => `${manager.firstName} ${manager.lastName}`).join(", ")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditManagersDialog({
                                      isOpen: true,
                                      entityType: 'region',
                                      entityId: region.id,
                                      currentManagers: region.managers,
                                    });
                                  }}
                                  className="bg-black/25 border-white/10 text-white hover:bg-black/50"
                                >
                                  Edit Managers
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dioceses" className="mt-4">
                  <div className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
                    <div className="flex flex-row items-center justify-between mb-4">
                      <h2 className="text-xl text-white">Dioceses</h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-secondary/20 hover:bg-secondary text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Diocese
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900/50 border-gray-800 text-white">
                          <DialogHeader>
                            <DialogTitle>Add New Diocese</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Diocese Name"
                              value={newDiocese.name}
                              onChange={(e) => setNewDiocese({ ...newDiocese, name: e.target.value })}
                              className="bg-black/85 backdrop-blur-md border-white/10 text-white placeholder:text-white/60"
                            />
                            <Button onClick={handleCreateDiocese}>Create Diocese</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-white">Name</TableHead>
                            <TableHead className="text-white">Managers</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDioceses.map((diocese) => (
                            <TableRow 
                              key={diocese.id}
                              className="cursor-pointer hover:bg-white/5"
                              onClick={() => router.push(`/admin/diocese/${diocese.id}`)}
                            >
                              <TableCell className="text-white">{diocese.name}</TableCell>
                              <TableCell className="text-white/60">
                                {diocese.managers.map(manager => `${manager.firstName} ${manager.lastName}`).join(", ")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditManagersDialog({
                                      isOpen: true,
                                      entityType: 'diocese',
                                      entityId: diocese.id,
                                      currentManagers: diocese.managers,
                                    });
                                  }}
                                  className="bg-black/25 border-white/10 text-white hover:bg-black/50"
                                >
                                  Edit Managers
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <HierarchicalView />
            )}
          </div>
          {/* Stats Overview */}
          <div className="bg-black/85 backdrop-blur-md p-6 rounded-lg border border-white/10">
            <h2 className="text-xl text-white mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-black/85 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-secondary text-lg">{users.length}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">Total Users</p>
                    <p className="text-white/60 text-xs">Active Accounts</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/85 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-secondary text-lg">{groups.length}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">Groups</p>
                    <p className="text-white/60 text-xs">Active Groups</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-secondary text-lg">{regions.length}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">Regions</p>
                    <p className="text-white/60 text-xs">Active Regions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/30 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-secondary text-lg">{dioceses.length}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">Dioceses</p>
                    <p className="text-white/60 text-xs">Active Dioceses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {editManagersDialog && (
        <EditManagersDialog
          isOpen={editManagersDialog.isOpen}
          onClose={() => setEditManagersDialog(null)}
          entityType={editManagersDialog.entityType}
          entityId={editManagersDialog.entityId}
          currentManagers={editManagersDialog.currentManagers}
          onSave={handleUpdateManagers}
        />
      )}
    </div>
  );
} 