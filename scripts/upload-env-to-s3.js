/**
 * =============================================================================
 * ENV FILE UPLOADER TO S3
 * =============================================================================
 *
 * This CLI tool uploads environment files to S3 with versioning.
 *
 * WHY THIS EXISTS:
 *
 * Problem: .env files contain secrets (API keys, DB passwords). We can't:
 *   - Commit them to git (security risk)
 *   - Pass them as build args (visible in CI logs)
 *   - Store them on EC2 permanently (hard to update)
 *
 * Solution: Store versioned .env files in a private S3 bucket.
 *   - Secure: S3 bucket is private, IAM-controlled access
 *   - Versioned: Can roll back to previous config
 *   - Auditable: S3 shows upload history
 *   - Decoupled: Update config without redeploying code
 *
 * USAGE:
 *   cd scripts/
 *   node upload-env-to-s3.js
 *
 * The script will prompt for:
 *   - Version (e.g., v1.0.0) - must be semver format
 *   - Environment (staging, production, or migrations)
 *
 * =============================================================================
 */

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");

// Load AWS credentials from local .env file
// This .env is NOT the one being uploaded - it contains AWS_ACCESS_KEY_ID, etc.
dotenv.config();

// =============================================================================
// AWS S3 CLIENT SETUP
// =============================================================================

const s3Client = new S3Client({
  region: "eu-west-3", // Paris - adjust to your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3 bucket name where .env files are stored
const S3_BUCKET_NAME = "s3envs";

// =============================================================================
// CLI INTERFACE
// =============================================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompt the user for input and return their answer
 */
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

/**
 * Check if a file exists at the given path
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * List files in current directory (helps user see what's available)
 */
function listFilesInCurrentDirectory() {
  const currentDir = process.cwd();
  try {
    const files = fs.readdirSync(currentDir);
    console.log("\nFiles in current directory:");
    console.log("─".repeat(40));
    files.forEach((file) => {
      console.log(`  ${file}`);
    });
    console.log("─".repeat(40));
  } catch (error) {
    console.error("Error reading directory:", error.message);
  }
}

// =============================================================================
// S3 UPLOAD FUNCTION
// =============================================================================

/**
 * Upload a file to S3 with versioning metadata
 *
 * The file is stored with a key like: .env-staging-v1.0.0
 * This naming convention allows:
 *   - Easy identification of which env/version
 *   - Multiple versions to coexist
 *   - Rollback by deploying with older version number
 */
async function uploadEnvFile(filePath, bucketName, version, environment) {
  try {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: bucketName,
      Key: `.env-${environment}-${version}`, // e.g., .env-staging-v1.0.0
      Body: fileContent,
      // Metadata is stored in S3 and can be viewed in the AWS console
      Metadata: {
        version: version,
        environment: environment,
        uploadedAt: new Date().toISOString(),
      },
    };

    console.log(`\nUploading to s3://${bucketName}/${params.Key}...`);

    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);

    console.log(`\n✅ Upload successful!`);
    console.log(`   ETag: ${result.ETag}`);
    console.log(`   Key: ${params.Key}`);
    console.log(`\nRemember to update ENV_VERSION in your pipeline to: ${version}`);
  } catch (error) {
    console.error("\n❌ Upload failed:", error.message);
    throw error;
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

async function main() {
  console.log("═".repeat(50));
  console.log("  ENV FILE UPLOADER TO S3");
  console.log("═".repeat(50));

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Show available files for reference
    // -------------------------------------------------------------------------
    listFilesInCurrentDirectory();

    // -------------------------------------------------------------------------
    // STEP 2: Get version from user
    //
    // Enforce semver format to maintain consistency.
    // This version MUST match what's in the GitHub Actions workflow.
    // -------------------------------------------------------------------------
    const versionRegex = /^v\d+\.\d+\.\d+$/;
    let fileVersion = "";

    console.log("\n📌 Version must match what's in your CI/CD pipeline.");
    do {
      fileVersion = await askQuestion("Version (e.g., v1.0.0): ");
      if (!versionRegex.test(fileVersion)) {
        console.error("   ❌ Format must be vX.Y.Z (e.g., v1.0.0, v2.1.3)");
      }
    } while (!versionRegex.test(fileVersion));

    // -------------------------------------------------------------------------
    // STEP 3: Get environment from user
    //
    // Each environment has its own .env file with different values:
    // - staging: Points to staging database, test API keys
    // - production: Points to prod database, live API keys
    // - migrations: Contains DB connection for running migrations
    // -------------------------------------------------------------------------
    const validEnvironments = ["production", "staging", "migrations"];
    let fileEnvironment = "";

    console.log("\n📌 Choose the environment for this .env file.");
    do {
      fileEnvironment = await askQuestion(
        "Environment (production / staging / migrations): "
      );
      if (!validEnvironments.includes(fileEnvironment)) {
        console.error("   ❌ Must be: production, staging, or migrations");
      }
    } while (!validEnvironments.includes(fileEnvironment));

    // -------------------------------------------------------------------------
    // STEP 4: Determine source file path
    //
    // Convention: .env files are in ../api/ relative to this script
    // - .env.staging → staging
    // - .env.production → production
    // - .env.migrations → migrations
    // -------------------------------------------------------------------------
    const projectRoot = process.cwd();
    let localFilePath = "";

    switch (fileEnvironment) {
      case "production":
        localFilePath = path.join(projectRoot, "../api/.env.production");
        break;
      case "staging":
        localFilePath = path.join(projectRoot, "../api/.env.staging");
        break;
      case "migrations":
        localFilePath = path.join(projectRoot, "../api/.env.migrations");
        break;
    }

    // -------------------------------------------------------------------------
    // STEP 5: Verify file exists
    // -------------------------------------------------------------------------
    if (!fileExists(localFilePath)) {
      console.error(`\n❌ File not found: ${localFilePath}`);
      console.error("   Make sure you're running from the scripts/ directory.");
      process.exit(1);
    }

    console.log(`\n📁 Found file: ${localFilePath}`);

    // -------------------------------------------------------------------------
    // STEP 6: Upload to S3
    // -------------------------------------------------------------------------
    await uploadEnvFile(localFilePath, S3_BUCKET_NAME, fileVersion, fileEnvironment);

    console.log("\n" + "═".repeat(50));
    console.log("  DONE");
    console.log("═".repeat(50));
  } catch (error) {
    console.error("\nFatal error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
