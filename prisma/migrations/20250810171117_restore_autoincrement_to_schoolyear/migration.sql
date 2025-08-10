-- AlterTable
CREATE SEQUENCE schoolyear_schoolyearid_seq;
ALTER TABLE "SchoolYear" ALTER COLUMN "schoolYearId" SET DEFAULT nextval('schoolyear_schoolyearid_seq');
ALTER SEQUENCE schoolyear_schoolyearid_seq OWNED BY "SchoolYear"."schoolYearId";
