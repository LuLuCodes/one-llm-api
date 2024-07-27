/*
 * @Author: leyi leyi@myun.info
 * @Date: 2024-07-27 13:14:50
 * @LastEditors: leyi leyi@myun.info
 * @LastEditTime: 2024-07-27 13:18:06
 * @FilePath: /one-llm-api/src/service/file-loader.service.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from 'langchain/document_loaders/fs/csv';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import { UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {}

  async processFile(file: Express.Multer.File) {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, file.filename);

    try {
      const loader = this.getLoader(filePath);
      const docs = await loader.load();

      // Process the documents as needed
      console.log(
        `Processed ${docs.length} documents from ${file.originalname}`,
      );

      // Clean up the uploaded file
      fs.unlinkSync(filePath);

      return docs;
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      throw error;
    }
  }

  private getLoader(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.docx':
        return new DocxLoader(filePath);
      case '.pdf':
        return new PDFLoader(filePath);
      case '.xlsx':
        return new CSVLoader(filePath); // Note: You might need a specific XLSX loader
      case '.html':
        return new UnstructuredLoader(filePath);
      case '.txt':
      case '.md':
        return new TextLoader(filePath);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}
