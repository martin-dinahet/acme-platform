-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineStep" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "RoutineStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineRun" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "todoIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoutineStep_routineId_position_key" ON "RoutineStep"("routineId", "position");

-- CreateIndex
CREATE INDEX "RoutineRun_routineId_idx" ON "RoutineRun"("routineId");

-- AddForeignKey
ALTER TABLE "RoutineStep" ADD CONSTRAINT "RoutineStep_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineRun" ADD CONSTRAINT "RoutineRun_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
