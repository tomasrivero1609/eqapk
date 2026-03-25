-- Rename the enum value first
ALTER TYPE "UserRole" RENAME VALUE 'ADMIN' TO 'STAFF';

-- Update the default
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF'::"UserRole";
