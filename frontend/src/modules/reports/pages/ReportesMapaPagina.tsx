import { Navigate } from 'react-router-dom';

import { rutasAplicacion } from '../../../config/constantesSistema';

export function ReportesMapaPagina() {
  return <Navigate replace to={rutasAplicacion.reportes} />;
}