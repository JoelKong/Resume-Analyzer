variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "ap-southeast-1"
}

variable "openai_api_key_secret_name" {
  description = "The name of the secret in AWS Secrets Manager for the OpenAI API key."
  type        = string
  default     = "OpenAiApiKey"
}