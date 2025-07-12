resource "aws_s3_bucket" "resumes" {
  bucket = "${local.prefix}-resumes"

  tags = {
    Name        = "${local.prefix}-resumes"
    Environment = terraform.workspace
  }
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.resumes.id

  queue {
    queue_arn     = aws_sqs_queue.ingestion_queue.arn
    events        = ["s3:ObjectCreated:*"]
    filter_prefix = ""
  }

  depends_on = [aws_iam_role_policy.s3_to_sqs_policy]
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.prefix}-frontend"

  tags = {
    Name        = "${local.prefix}-frontend"
    Environment = terraform.workspace
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}