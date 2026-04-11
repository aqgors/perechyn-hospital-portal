-- Recreate Enum to avoid transaction issues
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'DOCTOR', 'PATIENT');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'PATIENT';
DROP TYPE "Role_old";

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "appointment_date_time" TIMESTAMP(3),
ADD COLUMN     "doctor_id" TEXT;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

