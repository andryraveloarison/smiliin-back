import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

type Folder = 'logo' | 'idee' | 'post';

@Injectable()
export class FileService {
  private supabase: SupabaseClient;

  

  constructor() {

    this.supabase = createClient(
      process.env.SUPABASE_URL || 'https://rlmdnigvpmtycwfbzlvp.supabase.co/',
      process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbWRuaWd2cG10eWN3ZmJ6bHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTA0NDQsImV4cCI6MjA2MjIyNjQ0NH0.Psf5lpshwEdi5SveURDFQ9WsgCdCjIZGhYM8ajzoQ2Q',
    );
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, folder: Folder): Promise<string> {
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    
    const { error } = await this.supabase.storage
      .from('smiliin')
      .upload(`${folder}/${uniqueFileName}`, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase.storage
      .from('smiliin')
      .getPublicUrl(`${folder}/${uniqueFileName}`);

    return data.publicUrl;
  }
}



