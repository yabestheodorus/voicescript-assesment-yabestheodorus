-- CreateEnum
CREATE TYPE "WorkingMode" AS ENUM ('physical', 'remote');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Reporters" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "workMode" "WorkingMode" NOT NULL DEFAULT 'remote',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "ratePerMinute" INTEGER NOT NULL,
    "currentJobId" TEXT,

    CONSTRAINT "Reporters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Editor" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "flatFee" INTEGER NOT NULL,
    "currentJobId" TEXT,

    CONSTRAINT "Editor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "caseNumber" VARCHAR(100) NOT NULL,
    "caseName" VARCHAR(255) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "location" "WorkingMode" NOT NULL,
    "city" VARCHAR(100),
    "status" "JobStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "transcribedAt" TIMESTAMP(3),
    "reviewAssignedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "transcribeJobStartedAt" TIMESTAMP(3),
    "reviewJobStartedAt" TIMESTAMP(3),
    "reporterId" TEXT,
    "editorId" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "transcribePaymentAmount" INTEGER NOT NULL,
    "reviewPaymentAmount" INTEGER NOT NULL,
    "totalPayout" INTEGER NOT NULL,
    "transcribeDuration" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reporters_currentJobId_key" ON "Reporters"("currentJobId");

-- CreateIndex
CREATE UNIQUE INDEX "Editor_currentJobId_key" ON "Editor"("currentJobId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_caseNumber_key" ON "Job"("caseNumber");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_reporterId_idx" ON "Job"("reporterId");

-- CreateIndex
CREATE INDEX "Job_editorId_idx" ON "Job"("editorId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_jobId_key" ON "Payment"("jobId");

-- AddForeignKey
ALTER TABLE "Reporters" ADD CONSTRAINT "Reporters_currentJobId_fkey" FOREIGN KEY ("currentJobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Editor" ADD CONSTRAINT "Editor_currentJobId_fkey" FOREIGN KEY ("currentJobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Reporters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Editor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Reporters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "Editor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
