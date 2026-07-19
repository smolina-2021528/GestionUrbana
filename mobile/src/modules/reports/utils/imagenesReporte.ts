import type { ImagenReporte, ReporteResumen } from '../types/reportes.types';

export type ImagenReporteVisible = ImagenReporte & {
  url: string;
};

function limpiarTexto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function esUrlImagenValida(valor: string) {
  return /^https?:///i.test(valor) || valor.startsWith('file://');
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

export function normalizarImagenesReporte(imagenes?: ImagenReporte[] | null) {
  if (!Array.isArray(imagenes)) {
    return [];
  }

  return imagenes
    .map((imagen, indice) => {
      const url = obtenerUrlImagenReporte(imagen);

      return {
        id: imagen.id ?? imagen.Id ?? `imagen-${indice}`,
        url,
        publicId: imagen.publicId ?? imagen.PublicId ?? null,
        order: imagen.order ?? imagen.Order ?? indice,
        createdAt: imagen.createdAt ?? imagen.CreatedAt ?? null
      };
    })
    .filter((imagen) => Boolean(imagen.url));
}

export function obtenerImagenesVisiblesReporte(reporte: Pick<ReporteResumen, 'images'>) {
  return normalizarImagenesReporte(reporte.images) as ImagenReporteVisible[];
}

export function obtenerImagenPrincipalReporte(reporte: Pick<ReporteResumen, 'images'>) {
  return obtenerImagenesVisiblesReporte(reporte)[0] ?? null;
}
