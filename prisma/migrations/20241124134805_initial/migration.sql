-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `hashedToken` TEXT NOT NULL,
    `userId` INTEGER NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RefreshToken_id_key`(`id`),
    INDEX `RefreshToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `revoked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('RESET_PASSWORD', 'EMAIL_VERIFICATION') NOT NULL DEFAULT 'EMAIL_VERIFICATION',

    UNIQUE INDEX `VerificationToken_id_key`(`id`),
    INDEX `VerificationToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'PARTICIPANT', 'ADMIN', 'BRANCH_REP', 'ORGANIZER', 'JUDGE', 'JURY') NOT NULL DEFAULT 'USER',
    `profileImage` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `password` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `collegeId` INTEGER NULL DEFAULT 1,
    `phoneNumber` VARCHAR(191) NULL,
    `totalXp` INTEGER NOT NULL DEFAULT 0,
    `notificationObj` JSON NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_collegeId_idx`(`collegeId`),
    INDEX `User_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `College` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `type` ENUM('ENGINEERING', 'NON_ENGINEERING', 'OTHER') NOT NULL DEFAULT 'ENGINEERING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fees` INTEGER NOT NULL DEFAULT 0,
    `eventType` ENUM('INDIVIDUAL', 'TEAM', 'INDIVIDUAL_MULTIPLE_ENTRY', 'TEAM_MULTIPLE_ENTRY') NOT NULL DEFAULT 'INDIVIDUAL',
    `venue` VARCHAR(191) NULL,
    `branchId` INTEGER NOT NULL,
    `minTeamSize` INTEGER NOT NULL DEFAULT 1,
    `maxTeamSize` INTEGER NOT NULL DEFAULT 1,
    `maxTeams` INTEGER NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `category` ENUM('TECHNICAL', 'NON_TECHNICAL', 'CORE', 'SPECIAL') NOT NULL DEFAULT 'TECHNICAL',

    INDEX `Event_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `eventId` INTEGER NOT NULL,
    `roundNo` INTEGER NOT NULL DEFAULT 1,
    `confirmed` BOOLEAN NOT NULL DEFAULT false,
    `attended` BOOLEAN NOT NULL DEFAULT false,
    `leaderId` INTEGER NULL,

    INDEX `Team_eventId_roundNo_idx`(`eventId`, `roundNo`),
    UNIQUE INDEX `Team_name_eventId_key`(`name`, `eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Round` (
    `eventId` INTEGER NOT NULL,
    `roundNo` INTEGER NOT NULL DEFAULT 1,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `date` DATETIME(3) NULL,
    `quizId` VARCHAR(191) NULL,
    `selectStatus` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Round_quizId_idx`(`quizId`),
    UNIQUE INDEX `Round_eventId_roundNo_key`(`eventId`, `roundNo`),
    PRIMARY KEY (`eventId`, `roundNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `amount` INTEGER NOT NULL DEFAULT 250,
    `paymentData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `type` ENUM('FEST_REGISTRATION', 'EVENT_REGISTRATION') NOT NULL DEFAULT 'FEST_REGISTRATION',
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `PaymentOrder_orderId_key`(`orderId`),
    INDEX `PaymentOrder_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventPaymentOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `amount` INTEGER NOT NULL DEFAULT 250,
    `paymentData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `teamId` INTEGER NOT NULL,

    UNIQUE INDEX `EventPaymentOrder_orderId_key`(`orderId`),
    INDEX `EventPaymentOrder_teamId_idx`(`teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchRep` (
    `userId` INTEGER NOT NULL,
    `branchId` INTEGER NOT NULL,

    UNIQUE INDEX `BranchRep_userId_key`(`userId`),
    INDEX `BranchRep_branchId_userId_idx`(`branchId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organizer` (
    `userId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,

    INDEX `Organizer_eventId_userId_idx`(`eventId`, `userId`),
    UNIQUE INDEX `Organizer_userId_eventId_key`(`userId`, `eventId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `userId` INTEGER NOT NULL,
    `teamId` INTEGER NOT NULL,

    INDEX `TeamMember_teamId_userId_idx`(`teamId`, `userId`),
    UNIQUE INDEX `TeamMember_userId_teamId_key`(`userId`, `teamId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Judge` (
    `userId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,
    `roundNo` INTEGER NOT NULL,

    UNIQUE INDEX `Judge_userId_key`(`userId`),
    INDEX `Judge_eventId_roundNo_userId_idx`(`eventId`, `roundNo`, `userId`),
    UNIQUE INDEX `Judge_userId_eventId_roundNo_key`(`userId`, `eventId`, `roundNo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailMonitor` (
    `count` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Criteria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `eventId` INTEGER NOT NULL,
    `roundNo` INTEGER NOT NULL,
    `type` ENUM('TEXT', 'NUMBER', 'TIME') NOT NULL DEFAULT 'NUMBER',

    INDEX `Criteria_eventId_roundNo_idx`(`eventId`, `roundNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Scores` (
    `teamId` INTEGER NOT NULL,
    `criteriaId` INTEGER NOT NULL,
    `score` VARCHAR(191) NOT NULL,
    `judgeId` INTEGER NOT NULL,

    INDEX `Scores_teamId_criteriaId_idx`(`teamId`, `criteriaId`),
    INDEX `Scores_criteriaId_idx`(`criteriaId`),
    INDEX `Scores_judgeId_idx`(`judgeId`),
    UNIQUE INDEX `Scores_teamId_criteriaId_judgeId_key`(`teamId`, `criteriaId`, `judgeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comments` (
    `teamId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,
    `roundNo` INTEGER NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `judgeId` INTEGER NOT NULL,

    INDEX `Comments_teamId_idx`(`teamId`),
    INDEX `Comments_eventId_roundNo_idx`(`eventId`, `roundNo`),
    INDEX `Comments_judgeId_idx`(`judgeId`),
    UNIQUE INDEX `Comments_teamId_eventId_roundNo_judgeId_key`(`teamId`, `eventId`, `roundNo`, `judgeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Winners` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,
    `type` ENUM('WINNER', 'RUNNER_UP', 'SECOND_RUNNER_UP') NOT NULL,

    UNIQUE INDEX `Winners_teamId_key`(`teamId`),
    INDEX `Winners_teamId_idx`(`teamId`),
    INDEX `Winners_eventId_idx`(`eventId`),
    UNIQUE INDEX `Winners_eventId_type_key`(`eventId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Card` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clue` VARCHAR(191) NOT NULL,
    `day` ENUM('Day1', 'Day2', 'Day3', 'Day4') NOT NULL,

    INDEX `Card_id_idx`(`id`),
    UNIQUE INDEX `Card_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `userId` INTEGER NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `cardId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Submission_cardId_idx`(`cardId`),
    INDEX `Submission_userId_idx`(`userId`),
    UNIQUE INDEX `Submission_userId_cardId_key`(`userId`, `cardId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProniteRegistration` (
    `userId` INTEGER NOT NULL,
    `proniteDay` ENUM('Day1', 'Day2') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProniteRegistration_userId_idx`(`userId`),
    UNIQUE INDEX `ProniteRegistration_userId_proniteDay_key`(`userId`, `proniteDay`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CertificateIssue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `EventId` INTEGER NOT NULL,
    `issued` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CertificateIssue_userId_idx`(`userId`),
    INDEX `CertificateIssue_EventId_idx`(`EventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Options` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `isAnswer` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Options_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MCQSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` INTEGER NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MCQSubmission_teamId_idx`(`teamId`),
    INDEX `MCQSubmission_optionId_idx`(`optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quiz` (
    `id` VARCHAR(191) NOT NULL,
    `roundId` INTEGER NOT NULL,
    `eventId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `allowAttempts` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(191) NULL,

    UNIQUE INDEX `Quiz_roundId_key`(`roundId`),
    INDEX `Quiz_roundId_idx`(`roundId`),
    UNIQUE INDEX `Quiz_eventId_roundId_key`(`eventId`, `roundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `negativePoints` INTEGER NOT NULL DEFAULT 0,
    `questionType` ENUM('MCQ', 'FITB', 'LA') NOT NULL,
    `image` VARCHAR(191) NULL,

    INDEX `Question_quizId_idx`(`quizId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FITBSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` INTEGER NOT NULL,
    `optionId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `isRight` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FITBSubmission_teamId_idx`(`teamId`),
    INDEX `FITBSubmission_optionId_idx`(`optionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LASubmission` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` INTEGER NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `isRight` ENUM('PENDING', 'TRUE', 'FALSE') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LASubmission_teamId_idx`(`teamId`),
    INDEX `LASubmission_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `point` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `EventId` INTEGER NULL,
    `winnerId` INTEGER NULL,

    INDEX `Level_EventId_idx`(`EventId`),
    INDEX `Level_winnerId_idx`(`winnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `XP` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `levelId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `XP_userId_idx`(`userId`),
    INDEX `XP_levelId_idx`(`levelId`),
    UNIQUE INDEX `XP_userId_levelId_key`(`userId`, `levelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Hotel_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInHotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `IdCard` VARCHAR(191) NULL,
    `hotelId` INTEGER NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `room` VARCHAR(191) NULL,
    `AC` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `checkIn` DATETIME(3) NULL,
    `checkOut` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserInHotel_userId_key`(`userId`),
    INDEX `UserInHotel_userId_idx`(`userId`),
    INDEX `UserInHotel_hotelId_idx`(`hotelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
