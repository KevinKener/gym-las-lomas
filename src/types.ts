export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  /** Ruta relativa a videoBaseUrl. */
  src: string;
  poster: string | null;
  size: number;
}

export interface Catalog {
  generatedAt: string;
  videoBaseUrl: string;
  categories: string[];
  exercises: Exercise[];
}
