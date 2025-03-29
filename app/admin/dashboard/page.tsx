import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  // Use a valid MongoDB ObjectID format
  const groupId = "507f1f77bcf86cd799439011"; // This is a valid 24-character hex string

  const users = await prisma.user.findMany({
    where: {
      groupId
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      progress: {
        include: {
          unitProgress: true
        }
      }
    },
    orderBy: {
      lastName: 'asc'
    }
  });

  // Transform the data to include completed units
  const usersWithProgress = users.map(user => {
    const completedUnits = user.progress?.unitProgress.reduce((acc, progress) => {
      if (progress.questionsCompleted && progress.videoCompleted) {
        if (!acc[progress.chapterId]) {
          acc[progress.chapterId] = [];
        }
        acc[progress.chapterId].push(progress.unitId);
      }
      return acc;
    }, {} as Record<string, string[]>) || {};

    return {
      ...user,
      completedUnits
    };
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Users</h3>
            <p className="text-3xl font-bold">{usersWithProgress.length}</p>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Active Users</h3>
            <p className="text-3xl font-bold">
              {usersWithProgress.filter(user => Object.keys(user.completedUnits).length > 0).length}
            </p>
          </div>
          <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Average Progress</h3>
            <p className="text-3xl font-bold">
              {Math.round(
                usersWithProgress.reduce((acc, user) => {
                  const totalUnits = Object.values(user.completedUnits).flat().length;
                  return acc + totalUnits;
                }, 0) / usersWithProgress.length
              )}%
            </p>
          </div>
        </div>
        <div className="bg-black/40 border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">User Progress</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-800">
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Completed Units</th>
                </tr>
              </thead>
              <tbody>
                {usersWithProgress.map(user => (
                  <tr key={user.id} className="border-b border-gray-800">
                    <td className="py-4">{user.firstName} {user.lastName}</td>
                    <td className="py-4">{user.email}</td>
                    <td className="py-4">
                      {Object.values(user.completedUnits).flat().length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 