import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async getTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } catch (error) {
      this.logger.error('Failed to parse PDF file', error.stack);
      throw new Error('Failed to parse PDF file.');
    }
  }

  async getJobDescriptionFromUrl(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      $('script, style, head, nav, footer, header').remove();
      return $('body').text().replace(/\s\s+/g, ' ').trim();
    } catch (error) {
      this.logger.error(
        `Failed to fetch job description from URL: ${url}`,
        error.stack,
      );
      throw new Error('Failed to fetch job description from URL.');
    }
  }

  async generateInsights(
    resumeText: string,
    jobDescriptionText: string,
  ): Promise<any> {
    this.logger.log('Generating insights from OpenAI...');
    const prompt = `
      Analyze the following resume against the provided job description.
      Provide a concise summary of how well the resume matches the job requirements.
      Also, list the top 5-10 relevant keywords from the job description that are present or missing in the resume.

      Return the response as a JSON object with two keys: "summary" (string) and "keywords" (array of strings).

      Job Description:
      ---
      ${jobDescriptionText}
      ---

      Resume:
      ---
      ${resumeText}
      ---
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content ?? '');
      this.logger.log('Successfully generated insights.');
      return result;
    } catch (error) {
      this.logger.error('Failed to get insights from OpenAI', error.stack);
      throw new Error('Failed to get insights from OpenAI.');
    }
  }
}
