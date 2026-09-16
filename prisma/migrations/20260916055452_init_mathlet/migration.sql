-- CreateTable
CREATE TABLE "CurriculumClass" (
    "id" TEXT NOT NULL,
    "classLevel" INTEGER NOT NULL,

    CONSTRAINT "CurriculumClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classLevel" INTEGER NOT NULL,

    CONSTRAINT "CurriculumSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleTamil" TEXT NOT NULL,
    "englishPages" TEXT,
    "tamilPages" TEXT,
    "topics" JSONB,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "exerciseNumber" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "topicId" TEXT,
    "lessonSlug" TEXT,
    "practiceSetId" TEXT,
    "pageEnglish" INTEGER,
    "pageTamil" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'UNMAPPED',

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumClass_classLevel_key" ON "CurriculumClass"("classLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_sectionId_number_key" ON "Chapter"("sectionId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_sectionId_chapterNumber_exerciseNumber_language_key" ON "Exercise"("sectionId", "chapterNumber", "exerciseNumber", "language");

-- AddForeignKey
ALTER TABLE "CurriculumSection" ADD CONSTRAINT "CurriculumSection_classLevel_fkey" FOREIGN KEY ("classLevel") REFERENCES "CurriculumClass"("classLevel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CurriculumSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CurriculumSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_sectionId_chapterNumber_fkey" FOREIGN KEY ("sectionId", "chapterNumber") REFERENCES "Chapter"("sectionId", "number") ON DELETE RESTRICT ON UPDATE CASCADE;
