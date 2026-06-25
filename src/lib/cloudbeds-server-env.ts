import { generatedCloudbedsServerEnv } from "@/lib/cloudbeds-server-env.generated";

function firstNonEmpty(...values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim())
    ?.trim();
}

export function getCloudbedsServerApiKey() {
  return firstNonEmpty(
    process.env.CLOUDBEDS_API_KEY,
    process.env.CLOUDBEDS_API_KEY2,
    generatedCloudbedsServerEnv.apiKey,
    generatedCloudbedsServerEnv.apiKey2,
  );
}

export function getCloudbedsServerPropertyID() {
  return firstNonEmpty(
    process.env.CLOUDBEDS_PROPERTY_ID,
    generatedCloudbedsServerEnv.propertyID,
  );
}

export function getCloudbedsWebhookSecret() {
  return firstNonEmpty(
    process.env.CLOUDBEDS_WEBHOOK_SECRET,
    generatedCloudbedsServerEnv.webhookSecret,
  );
}

export function getCloudbedsAssignmentRetryAttempts() {
  return firstNonEmpty(
    process.env.CLOUDBEDS_ASSIGNMENT_RETRY_ATTEMPTS,
    generatedCloudbedsServerEnv.assignmentRetryAttempts,
  );
}

export function getCloudbedsAssignmentRetryDelayMs() {
  return firstNonEmpty(
    process.env.CLOUDBEDS_ASSIGNMENT_RETRY_DELAY_MS,
    generatedCloudbedsServerEnv.assignmentRetryDelayMs,
  );
}
