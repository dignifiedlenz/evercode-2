/*
  Warnings:

  - You are about to drop the column `managerId` on the `Diocese` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `Region` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Diocese" DROP CONSTRAINT "Diocese_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Region" DROP CONSTRAINT "Region_managerId_fkey";

-- AlterTable
ALTER TABLE "Diocese" DROP COLUMN "managerId";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "managerId";

-- AlterTable
ALTER TABLE "Region" DROP COLUMN "managerId";

-- CreateTable
CREATE TABLE "_GroupManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RegionManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RegionManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DioceseManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DioceseManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupManagers_B_index" ON "_GroupManagers"("B");

-- CreateIndex
CREATE INDEX "_RegionManagers_B_index" ON "_RegionManagers"("B");

-- CreateIndex
CREATE INDEX "_DioceseManagers_B_index" ON "_DioceseManagers"("B");

-- AddForeignKey
ALTER TABLE "_GroupManagers" ADD CONSTRAINT "_GroupManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupManagers" ADD CONSTRAINT "_GroupManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionManagers" ADD CONSTRAINT "_RegionManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionManagers" ADD CONSTRAINT "_RegionManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DioceseManagers" ADD CONSTRAINT "_DioceseManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Diocese"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DioceseManagers" ADD CONSTRAINT "_DioceseManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
