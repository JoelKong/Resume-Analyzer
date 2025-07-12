resource "aws_sqs_queue" "ingestion_dlq" {
  name = "${local.prefix}-ingestion-dlq"
}

resource "aws_sqs_queue" "ingestion_queue" {
  name                      = "${local.prefix}-ingestion-queue"
  delay_seconds             = 0
  max_message_size          = 262144
  message_retention_seconds = 86400
  visibility_timeout_seconds = 300

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.ingestion_dlq.arn
    maxReceiveCount     = 3
  })
}