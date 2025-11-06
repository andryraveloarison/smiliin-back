
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import * as mime from 'mime-types';

type Folder = 'logo' | 'idea' | 'post' | 'descente'| 'insight';;

@Injectable()
export class FileService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string, 
    folder: Folder,
  ): Promise<string> {
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // 🔍 Détecte automatiquement le bon contentType
    const contentType =
      mime.lookup(fileName) || 'application/octet-stream';
    console.log(`➡️ Uploading ${fileName} with contentType: ${contentType}`);

    const { error } = await this.supabase.storage
      .from('smiliin')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType, // ✅ fix pour PDF
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data } = this.supabase.storage
      .from('smiliin')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}
