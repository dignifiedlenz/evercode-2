"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { Loader2, Plus, Trash2, Users, UserCheck, BarChart, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  groupId: string;
  group?: {
    name: string;
  };
  progress?: {
    unitProgress: any[];
  };
}

interface Group {
  id: string;
  name: string;
  users: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }[];
  statistics: {
    totalUsers: number;
    usersWithProgress: number;
    averageProgress: number;
  };
}

interface UnitProgress {
  unitId: string;
  completed: boolean;
  completedAt?: string;
}

interface UserProgress {
  unitProgress: UnitProgress[];
}

export default function ControlPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isManagingProgress, setIsManagingProgress] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [courseData, setCourseData] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchUsers();
      fetchGroups();
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch course data when the component mounts
    const fetchCourseData = async () => {
      try {
        const response = await fetch("/api/course");
        if (!response.ok) throw new Error("Failed to fetch course data");
        const data = await response.json();
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };

    fetchCourseData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/admin/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      toast.error("Failed to load groups");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      toast.success("Role updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update user");
      toast.success("User updated successfully");
      setIsEditing(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handlePasswordReset = async (userId: string) => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!response.ok) throw new Error("Failed to reset password");
      toast.success("Password reset successfully");
      setIsResettingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const handleProgressReset = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's progress?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/progress`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to reset progress");
      toast.success("Progress reset successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to reset progress");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      const response = await fetch("/api/admin/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!response.ok) throw new Error("Failed to create group");
      toast.success("Group created successfully");
      setIsCreatingGroup(false);
      setNewGroupName("");
      fetchGroups();
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group? This will remove all users from the group.")) return;

    try {
      const response = await fetch(`/api/admin/groups?groupId=${groupId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete group");
      toast.success("Group deleted successfully");
      fetchGroups();
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const handleAddUserToGroup = async (groupId: string, userId: string) => {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to add user to group");
      toast.success("User added to group successfully");
      setIsAddingUser(false);
      fetchGroups();
      fetchUsers();
    } catch (error) {
      toast.error("Failed to add user to group");
    }
  };

  const handleRemoveUserFromGroup = async (groupId: string, userId: string) => {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove user from group");
      toast.success("User removed from group successfully");
      fetchGroups();
      fetchUsers();
    } catch (error) {
      toast.error("Failed to remove user from group");
    }
  };

  const handleManageProgress = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/progress/manual`);
      if (!response.ok) throw new Error("Failed to fetch user progress");
      const progress = await response.json();
      
      // Initialize progress data if it doesn't exist
      const initializedProgress = progress || {
        unitProgress: courseData?.semesters.flatMap((semester: any) =>
          semester.chapters.flatMap((chapter: any) =>
            chapter.units.map((unit: any) => ({
              unitId: unit.id,
              completed: false,
            }))
          )
        ) || [],
      };
      
      setUserProgress(initializedProgress);
      setSelectedUser(user);
      setIsManagingProgress(true);
    } catch (error) {
      toast.error("Failed to load user progress");
    }
  };

  const handleProgressUpdate = async (unitId: string, completed: boolean) => {
    if (!selectedUser || !userProgress) return;

    const existingUnitIndex = userProgress.unitProgress.findIndex(
      (unit) => unit.unitId === unitId
    );

    let updatedProgress;
    if (existingUnitIndex === -1) {
      // Add new unit to progress
      updatedProgress = {
        unitProgress: [
          ...userProgress.unitProgress,
          {
            unitId,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          },
        ],
      };
    } else {
      // Update existing unit
      updatedProgress = {
        unitProgress: userProgress.unitProgress.map((unit) =>
          unit.unitId === unitId
            ? {
                ...unit,
                completed,
                completedAt: completed ? new Date().toISOString() : undefined,
              }
            : unit
        ),
      };
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/progress/manual`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProgress),
      });

      if (!response.ok) throw new Error("Failed to update progress");
      setUserProgress(updatedProgress);
      toast.success("Progress updated successfully");
      fetchUsers(); // Refresh the users list to update progress indicators
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">System Administrator Control Panel</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            Users
          </Button>
          <Button
            variant={activeTab === "groups" ? "default" : "outline"}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800">
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Group</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="py-4">{user.firstName} {user.lastName}</td>
                      <td className="py-4">{user.email}</td>
                      <td className="py-4">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4">{user.group?.name || "No Group"}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Dialog open={isEditing && selectedUser?.id === user.id} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditing(true);
                                }}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="First Name"
                                  defaultValue={user.firstName}
                                  onChange={(e) => setSelectedUser({ ...user, firstName: e.target.value })}
                                />
                                <Input
                                  placeholder="Last Name"
                                  defaultValue={user.lastName}
                                  onChange={(e) => setSelectedUser({ ...user, lastName: e.target.value })}
                                />
                                <Input
                                  placeholder="Email"
                                  type="email"
                                  defaultValue={user.email}
                                  onChange={(e) => setSelectedUser({ ...user, email: e.target.value })}
                                />
                                <Button
                                  onClick={() => selectedUser && handleUserUpdate(selectedUser.id, selectedUser)}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={isResettingPassword && selectedUser?.id === user.id} onOpenChange={setIsResettingPassword}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsResettingPassword(true);
                                }}
                              >
                                Reset Password
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  type="password"
                                  placeholder="New Password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Input
                                  type="password"
                                  placeholder="Confirm Password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <Button
                                  onClick={() => selectedUser && handlePasswordReset(selectedUser.id)}
                                >
                                  Reset Password
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="destructive"
                            onClick={() => handleProgressReset(user.id)}
                          >
                            Reset Progress
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => handleManageProgress(user)}
                          >
                            Manage Progress
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Group Management</h2>
              <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Group Name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <Button onClick={handleCreateGroup}>Create Group</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {groups.map((group) => (
                <div key={group.id} className="border border-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{group.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {group.statistics.totalUsers} Users
                        </div>
                        <div className="flex items-center">
                          <UserCheck className="w-4 h-4 mr-1" />
                          {group.statistics.usersWithProgress} Active
                        </div>
                        <div className="flex items-center">
                          <BarChart className="w-4 h-4 mr-1" />
                          {group.statistics.averageProgress}% Progress
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isAddingUser && selectedGroup?.id === group.id} onOpenChange={setIsAddingUser}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedGroup(group);
                              setIsAddingUser(true);
                              setAvailableUsers(users.filter(user => !user.groupId));
                            }}
                          >
                            Add User
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add User to {group.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select onValueChange={(value) => handleAddUserToGroup(group.id, value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-800">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Email</th>
                          <th className="pb-2">Role</th>
                          <th className="pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-800">
                            <td className="py-2">{user.firstName} {user.lastName}</td>
                            <td className="py-2">{user.email}</td>
                            <td className="py-2">{user.role}</td>
                            <td className="py-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveUserFromGroup(group.id, user.id)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isManagingProgress} onOpenChange={setIsManagingProgress}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Manage Progress for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-6">
              {courseData?.semesters.map((semester: any) => (
                <div key={semester.id} className="border border-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4">{semester.title}</h3>
                  {semester.chapters.map((chapter: any) => (
                    <div key={chapter.id} className="ml-4 mb-4">
                      <h4 className="text-lg font-medium mb-2">{chapter.title}</h4>
                      <div className="ml-4 space-y-2">
                        {chapter.units.map((unit: any) => {
                          const progress = userProgress?.unitProgress.find(
                            (p) => p.unitId === unit.id
                          );
                          return (
                            <div
                              key={unit.id}
                              className="flex items-center space-x-2 p-2 hover:bg-gray-800/50 rounded"
                            >
                              <Checkbox
                                checked={progress?.completed || false}
                                onCheckedChange={(checked) =>
                                  handleProgressUpdate(unit.id, checked as boolean)
                                }
                              />
                              <div className="flex flex-col">
                                <span>{unit.title}</span>
                                {unit.video && (
                                  <span className="text-sm text-gray-400">
                                    Video: {unit.video.title}
                                  </span>
                                )}
                              </div>
                              {progress?.completedAt && (
                                <span className="text-sm text-gray-400 ml-auto">
                                  Completed: {new Date(progress.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
    </Suspense>
  );
} 