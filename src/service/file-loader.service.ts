/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-27 13:14:50
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-31 20:07:36
 * @FilePath: /one-llm-api/src/service/file-loader.service.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { pathExists, unlinkSync } from 'fs-extra';
import * as path from 'path';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { OpenAIWhisperAudio } from '@langchain/community/document_loaders/fs/openai_whisper_audio';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {}

  async processFile(file: Express.Multer.File) {
    const rootDir = process.cwd();
    const uploadDir = this.configService.get<string>('app.upload_dir');
    const folderPath = path.resolve(rootDir, uploadDir);
    const filePath = `${folderPath}/${file.originalname}`;
    try {
      const exists = await pathExists(filePath);
      if (!exists) {
        throw new Error(`File not found: ${filePath}`);
      }
      const loader = this.getLoader(filePath);
      const docs = await loader.load();

      // Process the documents as needed
      console.log(
        `Processed ${docs.length} documents from ${file.originalname}`,
      );

      return {
        docs,
        metadata: {
          filename: file.originalname,
        },
      };
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      throw error;
    } finally {
      // Clean up the uploaded file
      unlinkSync(filePath);
    }
  }

  private getLoader(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();
    console.log(`extension: ${extension}`);
    switch (extension) {
      case '.json':
        return new JSONLoader(filePath);
      case '.doc':
      case '.docx':
        return new DocxLoader(filePath);
      case '.ppt':
      case '.pptx':
        return new PPTXLoader(filePath);
      case '.pdf':
        return new PDFLoader(filePath);
      case '.csv':
      case '.xlsx':
        return new CSVLoader(filePath); // Note: You might need a specific XLSX loader
      case '.html':
        return new UnstructuredLoader(filePath, {
          apiUrl: 'https://api.unstructuredapp.io/general/v0/general',
          apiKey: 'UpnDVj0J5ZpWaji8FBQEmCsT13bRoW',
        });
      case '.txt':
      case '.md':
        return new TextLoader(filePath);
      case '.mp3':
        return new OpenAIWhisperAudio(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}
