-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "googleId" TEXT,
    "passportCountry" TEXT NOT NULL DEFAULT 'OTHER',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CountryVisit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "entryDate" DATETIME NOT NULL,
    "exitDate" DATETIME,
    "visaType" TEXT NOT NULL,
    "maxDays" INTEGER NOT NULL,
    "passportCountry" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "purpose" TEXT,
    "accommodation" TEXT,
    "cost" REAL,
    "rating" INTEGER,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CountryVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VisaRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromCountry" TEXT NOT NULL,
    "toCountry" TEXT NOT NULL,
    "visaRequired" BOOLEAN NOT NULL,
    "visaFreeStay" INTEGER,
    "visaTypes" TEXT NOT NULL,
    "processingTime" TEXT,
    "cost" TEXT,
    "requirements" TEXT,
    "validityPeriod" INTEGER,
    "multipleEntry" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TravelAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "country" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TravelPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "preferredRegions" TEXT,
    "budgetRange" TEXT,
    "travelStyle" TEXT,
    "maxTripDuration" INTEGER,
    "languageSpoken" TEXT,
    "dietaryNeeds" TEXT,
    "mobilityNeeds" TEXT,
    "emergencyContact" TEXT,
    "travelInsurance" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TravelPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "visaExpiryDays" TEXT NOT NULL DEFAULT '7,14,30',
    "schengenWarningDays" INTEGER NOT NULL DEFAULT 10,
    "travelAlerts" BOOLEAN NOT NULL DEFAULT true,
    "budgetAlerts" BOOLEAN NOT NULL DEFAULT false,
    "documentReminders" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "NotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "CountryVisit_userId_idx" ON "CountryVisit"("userId");

-- CreateIndex
CREATE INDEX "CountryVisit_country_idx" ON "CountryVisit"("country");

-- CreateIndex
CREATE INDEX "CountryVisit_entryDate_idx" ON "CountryVisit"("entryDate");

-- CreateIndex
CREATE INDEX "CountryVisit_userId_entryDate_idx" ON "CountryVisit"("userId", "entryDate");

-- CreateIndex
CREATE INDEX "CountryVisit_userId_country_idx" ON "CountryVisit"("userId", "country");

-- CreateIndex
CREATE INDEX "CountryVisit_entryDate_exitDate_idx" ON "CountryVisit"("entryDate", "exitDate");

-- CreateIndex
CREATE INDEX "CountryVisit_visaType_idx" ON "CountryVisit"("visaType");

-- CreateIndex
CREATE INDEX "CountryVisit_passportCountry_idx" ON "CountryVisit"("passportCountry");

-- CreateIndex
CREATE INDEX "CountryVisit_userId_entryDate_exitDate_idx" ON "CountryVisit"("userId", "entryDate", "exitDate");

-- CreateIndex
CREATE INDEX "CountryVisit_createdAt_idx" ON "CountryVisit"("createdAt");

-- CreateIndex
CREATE INDEX "CountryVisit_status_idx" ON "CountryVisit"("status");

-- CreateIndex
CREATE INDEX "CountryVisit_userId_status_idx" ON "CountryVisit"("userId", "status");

-- CreateIndex
CREATE INDEX "VisaRequirement_fromCountry_idx" ON "VisaRequirement"("fromCountry");

-- CreateIndex
CREATE INDEX "VisaRequirement_toCountry_idx" ON "VisaRequirement"("toCountry");

-- CreateIndex
CREATE INDEX "VisaRequirement_visaRequired_idx" ON "VisaRequirement"("visaRequired");

-- CreateIndex
CREATE UNIQUE INDEX "VisaRequirement_fromCountry_toCountry_key" ON "VisaRequirement"("fromCountry", "toCountry");

-- CreateIndex
CREATE INDEX "TravelAlert_country_idx" ON "TravelAlert"("country");

-- CreateIndex
CREATE INDEX "TravelAlert_alertType_idx" ON "TravelAlert"("alertType");

-- CreateIndex
CREATE INDEX "TravelAlert_severity_idx" ON "TravelAlert"("severity");

-- CreateIndex
CREATE INDEX "TravelAlert_isActive_idx" ON "TravelAlert"("isActive");

-- CreateIndex
CREATE INDEX "TravelAlert_startDate_endDate_idx" ON "TravelAlert"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "TravelPreferences_userId_key" ON "TravelPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_userId_key" ON "NotificationSettings"("userId");
