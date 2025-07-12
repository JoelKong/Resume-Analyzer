resource "aws_lambda_function" "api" {
  function_name = "${local.prefix}-api-lambda"
  role          = aws_iam_role.api_lambda_role.arn
  handler       = "dist/src/functions/resume.lambda.handler.handler"
  runtime       = "nodejs20.x"
  timeout       = 30

  filename         = "../backend/dist/api-deployment-package.zip"
  source_code_hash = filebase64sha256("../backend/dist/api-deployment-package.zip") # Placeholder

  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
      NODE_ENV    = terraform.workspace
    }
  }
}

resource "aws_lambda_function" "ingestion" {
  function_name = "${local.prefix}-ingestion-lambda"
  role          = aws_iam_role.ingestion_lambda_role.arn
  handler       = "dist/src/functions/ingestion.lambda.handler.handler"
  runtime       = "nodejs20.x"
  timeout       = 300

  filename         = "../backend/dist/ingestion-deployment-package.zip"
  source_code_hash = filebase64sha256("../backend/dist/ingestion-deployment-package.zip")

  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      SECRET_NAME      = aws_secretsmanager_secret.db_credentials.name
      OPENAI_API_KEY_SECRET_NAME = aws_secretsmanager_secret.openai_api_key.name
      S3_BUCKET_NAME   = aws_s3_bucket.resumes.bucket
      NODE_ENV         = terraform.workspace
    }
  }
}

resource "aws_lambda_event_source_mapping" "ingestion_trigger" {
  event_source_arn = aws_sqs_queue.ingestion_queue.arn
  function_name    = aws_lambda_function.ingestion.arn
  batch_size       = 1
}