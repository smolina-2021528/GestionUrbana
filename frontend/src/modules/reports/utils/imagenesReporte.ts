import type { ImagenReporte, Reporte } from '../types/reportesTipos';

export type ImagenReporteVisible = ImagenReporte & {
  url: string;
};

function limpiarTexto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function esUrlImagenValida(valor: string) {
  return /^https?:\/\//i.test(valor) || valor.startsWith('/');
}

export function obtenerUrlImagenReporte(imagen?: ImagenReporte | null) {
  if (!imagen) {
    return null;
  }

  const candidatos = [imagen.url, imagen.imageUrl, imagen.ImageUrl];

  for (const candidato of candidatos) {
    const url = limpiarTexto(candidato);

    if (url && esUrlImagenValida(url)) {
      return url;
    }
  }

  return null;
}

export function obtenerImagenesVisiblesReporte(reporte: Pick<Reporte, 'images'>) {
  return (reporte.images ?? []).reduce<ImagenReporteVisible[]>((imagenesVisibles, imagen) => {
    const url = obtenerUrlImagenReporte(imagen);

    if (!url) {
      return imagenesVisibles;
    }

    imagenesVisibles.push({
      ...imagen,
      url
    });

    return imagenesVisibles;
  }, []);
}

export function obtenerImagenPrincipalReporte(reporte: Pick<Reporte, 'images'>) {
  return obtenerImagenesVisiblesReporte(reporte)[0] ?? null;
}