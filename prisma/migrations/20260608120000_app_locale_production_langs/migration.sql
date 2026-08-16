-- Phase 0 i18n: production locales ru/en/es/pt; legacy ka → ru
-- Dependency-safe for clean migrate: preferred_locale and release_documents.locale
-- are added in later migrations (20260623 / 20260624). Rewrite only columns that
-- already exist; convert app_locale for whatever app_locale columns are present.

DO $$
DECLARE
  has_preferred boolean;
  has_faq_locale boolean;
  has_doc_locale boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'preferred_locale'
  ) INTO has_preferred;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'release_faq_items' AND column_name = 'locale'
  ) INTO has_faq_locale;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'release_documents' AND column_name = 'locale'
  ) INTO has_doc_locale;

  IF has_preferred THEN
    EXECUTE 'UPDATE "user_profiles" SET "preferred_locale" = ''ru'' WHERE "preferred_locale"::text = ''ka''';
  END IF;
  IF has_faq_locale THEN
    EXECUTE 'UPDATE "release_faq_items" SET "locale" = ''ru'' WHERE "locale"::text = ''ka''';
  END IF;
  IF has_doc_locale THEN
    EXECUTE 'UPDATE "release_documents" SET "locale" = ''ru'' WHERE "locale"::text = ''ka''';
  END IF;

  -- Already on production locale set: nothing to convert.
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'app_locale' AND e.enumlabel = 'es'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'app_locale' AND e.enumlabel = 'ka'
  ) THEN
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_locale_new') THEN
    CREATE TYPE "app_locale_new" AS ENUM ('ru', 'en', 'es', 'pt');
  END IF;

  IF has_preferred THEN
    EXECUTE 'ALTER TABLE "user_profiles" ALTER COLUMN "preferred_locale" DROP DEFAULT';
    EXECUTE 'ALTER TABLE "user_profiles" ALTER COLUMN "preferred_locale" TYPE "app_locale_new" USING ("preferred_locale"::text::"app_locale_new")';
  END IF;
  IF has_faq_locale THEN
    EXECUTE 'ALTER TABLE "release_faq_items" ALTER COLUMN "locale" DROP DEFAULT';
    EXECUTE 'ALTER TABLE "release_faq_items" ALTER COLUMN "locale" TYPE "app_locale_new" USING ("locale"::text::"app_locale_new")';
  END IF;
  IF has_doc_locale THEN
    EXECUTE 'ALTER TABLE "release_documents" ALTER COLUMN "locale" DROP DEFAULT';
    EXECUTE 'ALTER TABLE "release_documents" ALTER COLUMN "locale" TYPE "app_locale_new" USING ("locale"::text::"app_locale_new")';
  END IF;

  DROP TYPE IF EXISTS "app_locale";
  ALTER TYPE "app_locale_new" RENAME TO "app_locale";

  IF has_preferred THEN
    EXECUTE 'ALTER TABLE "user_profiles" ALTER COLUMN "preferred_locale" SET DEFAULT ''ru''';
  END IF;
  IF has_faq_locale THEN
    EXECUTE 'ALTER TABLE "release_faq_items" ALTER COLUMN "locale" SET DEFAULT ''ru''';
  END IF;
  IF has_doc_locale THEN
    EXECUTE 'ALTER TABLE "release_documents" ALTER COLUMN "locale" SET DEFAULT ''ru''';
  END IF;
END $$;
