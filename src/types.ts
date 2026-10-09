export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  /** Ruta relativa a videoBaseUrl. */
  src: string;
  poster: string | null;
  size: number;
  /** Versión del contenido (video + miniatura). Se agrega como ?v= para no mostrar uno viejo guardado. */
  rev: string | null;
}

export interface Catalog {
  generatedAt: string;
  videoBaseUrl: string;
  categories: string[];
  exercises: Exercise[];
}
