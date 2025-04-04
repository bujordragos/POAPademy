-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT,
    "quizData" JSONB,
    "fileData" BLOB,
    "fileName" TEXT,
    "fileType" TEXT
);
INSERT INTO "new_Course" ("description", "fileUrl", "id", "quizData", "title") SELECT "description", "fileUrl", "id", "quizData", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
