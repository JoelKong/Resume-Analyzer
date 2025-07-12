resource "aws_security_group" "lambda" {
  name        = "${local.prefix}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

# IAM Role for API Lambda
resource "aws_iam_role" "api_lambda_role" {
  name               = "${local.prefix}-api-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# IAM Role for Ingestion Lambda
resource "aws_iam_role" "ingestion_lambda_role" {
  name               = "${local.prefix}-ingestion-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# Common policies for both lambdas
data "aws_iam_policy_document" "lambda_base_policy" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
    ]
    resources = ["*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.db_credentials.arn]
  }
}

# Policy for API Lambda
resource "aws_iam_policy" "api_lambda_policy" {
  name   = "${local.prefix}-api-lambda-policy"
  policy = data.aws_iam_policy_document.lambda_base_policy.json
}

resource "aws_iam_role_policy_attachment" "api_lambda_policy_attach" {
  role       = aws_iam_role.api_lambda_role.name
  policy_arn = aws_iam_policy.api_lambda_policy.arn
}

# Policy for Ingestion Lambda
data "aws_iam_policy_document" "ingestion_lambda_policy_doc" {
  source_policy_documents = [data.aws_iam_policy_document.lambda_base_policy.json]
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
    ]
    resources = ["${aws_s3_bucket.resumes.arn}/*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]
    resources = [aws_sqs_queue.ingestion_queue.arn]
  }
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.openai_api_key.arn]
  }
}

resource "aws_iam_policy" "ingestion_lambda_policy" {
  name   = "${local.prefix}-ingestion-lambda-policy"
  policy = data.aws_iam_policy_document.ingestion_lambda_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "ingestion_lambda_policy_attach" {
  role       = aws_iam_role.ingestion_lambda_role.name
  policy_arn = aws_iam_policy.ingestion_lambda_policy.arn
}

# Policy for S3 to send messages to SQS
data "aws_iam_policy_document" "s3_to_sqs_policy_doc" {
  statement {
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.ingestion_queue.arn]
    principals {
      type        = "Service"
      identifiers = ["s3.amazonaws.com"]
    }
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_s3_bucket.resumes.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "s3_to_sqs_policy" {
  queue_url = aws_sqs_queue.ingestion_queue.id
  policy    = data.aws_iam_policy_document.s3_to_sqs_policy_doc.json
}