
export type ArtMode = 'PENCIL' | 'ASCII';

export interface ImageData {
  url: string;
  base64: string;
  mimeType: string;
}

export interface TransformationResult {
  mode: ArtMode;
  content: string; // URL for image or raw text for ASCII
}
