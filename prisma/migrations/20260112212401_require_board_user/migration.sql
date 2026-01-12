-- CreateTable: users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AlterTable: boards - add user_id column
ALTER TABLE "boards" ADD COLUMN "user_id" TEXT;

-- Ensure legacy user exists for pre-auth boards
INSERT INTO "users" ("id", "created_at", "updated_at")
VALUES ('legacy', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Backfill legacy boards
UPDATE "boards" SET "user_id" = 'legacy' WHERE "user_id" IS NULL;

-- Enforce required user_id
ALTER TABLE "boards" ALTER COLUMN "user_id" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "boards" ADD CONSTRAINT "boards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add index for user_id
CREATE INDEX "boards_user_id_idx" ON "boards"("user_id");
