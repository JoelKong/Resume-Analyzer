resource "aws_secretsmanager_secret" "openai_api_key" {
  name = var.openai_api_key_secret_name
}

resource "aws_secretsmanager_secret_version" "openai_api_key" {
  secret_id     = aws_secretsmanager_secret.openai_api_key.id
  secret_string = "your_openai_api_key_here"
}