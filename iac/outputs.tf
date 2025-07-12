output "api_gateway_url" {
  description = "The URL of the API Gateway."
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "frontend_s3_bucket_name" {
  description = "The name of the S3 bucket for the frontend assets."
  value       = aws_s3_bucket.frontend.bucket
}