export interface Meme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

export interface MemesResponse {
  success: boolean;
  data: {
    memes: Meme[];
  };
}
