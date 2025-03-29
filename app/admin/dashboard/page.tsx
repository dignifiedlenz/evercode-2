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
  // ... rest of the component using usersWithProgress instead of users ...
); 