'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mockDesarrollosApi, Desarrollo } from '@/lib/mockData';
import CreateDesarrolloForm from '@/components/CreateDesarrolloForm';

export default function DesarrollosPage() {
  const [desarrollos, setDesarrollos] = useState<Desarrollo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    loadDesarrollos();
  }, []);

  // Recargar cuando se actualiza o elimina un desarrollo
  useEffect(() => {
    const handleDesarrolloUpdate = () => {
      loadDesarrollos();
    };
    
    window.addEventListener('desarrolloUpdated', handleDesarrolloUpdate);
    window.addEventListener('desarrolloDeleted', handleDesarrolloUpdate);
    window.addEventListener('focus', handleDesarrolloUpdate);
    
    return () => {
      window.removeEventListener('desarrolloUpdated', handleDesarrolloUpdate);
      window.removeEventListener('desarrolloDeleted', handleDesarrolloUpdate);
      window.removeEventListener('focus', handleDesarrolloUpdate);
    };
  }, []);

  // Recargar cuando cambia la ruta (vuelve de otra página)
  useEffect(() => {
    if (pathname === '/desarrollos') {
      loadDesarrollos();
    }
  }, [pathname]);

  const loadDesarrollos = async () => {
    try {
      setLoading(true);
      const data = await mockDesarrollosApi.getAll();
      setDesarrollos(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los desarrollos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDesarrolloCreated = () => {
    setShowForm(false);
    loadDesarrollos();
  };

  const handleDeleteDesarrollo = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el desarrollo "${titulo}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await mockDesarrollosApi.delete(id);
      loadDesarrollos();
    } catch (err) {
      setError('Error al eliminar el desarrollo');
      console.error(err);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-gray-100 text-gray-800';
      case 'EN_DESARROLLO':
        return 'bg-blue-100 text-blue-800';
      case 'EN_REVISION':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHorasColor = (horasEstimadas: number, tiempoGastado: number) => {
    const horasGastadas = tiempoGastado / 3600;
    if (horasGastadas === 0) return 'text-gray-600';
    if (horasGastadas > horasEstimadas) return 'text-red-600';
    if (horasGastadas > horasEstimadas * 0.8) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const totalHorasTrabajadas = desarrollos.reduce((total, desarrollo) => total + desarrollo.tiempoGastado, 0);
  const totalHorasFormateadas = formatTime(totalHorasTrabajadas);
  const totalHorasDecimal = (totalHorasTrabajadas / 3600).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Contador Total de Horas */}
      <div className="mb-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-100 mb-1">Total de Horas Trabajadas</p>
              <p className="text-4xl font-bold">{totalHorasDecimal}h</p>
              <p className="text-sm text-primary-100 mt-1">{totalHorasFormateadas}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-100">En {desarrollos.length} desarrollo{desarrollos.length !== 1 ? 's' : ''}</p>
            <p className="text-2xl font-bold mt-1">{desarrollos.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Desarrollos</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona y rastrea el progreso de tus desarrollos
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-105"
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Desarrollo
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateDesarrolloForm onSuccess={handleDesarrolloCreated} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Cargando desarrollos...</p>
          </div>
        </div>
      ) : desarrollos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No hay desarrollos</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Comienza creando tu primer desarrollo para empezar a rastrear tu trabajo
          </p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Primer Desarrollo
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Desarrollo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Horas Estimadas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tiempo Gastado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {desarrollos
                  .sort((a, b) => {
                    // Ordenar por horas estimadas (mayor a menor) como prioridad
                    if (b.horasEstimadas !== a.horasEstimadas) {
                      return b.horasEstimadas - a.horasEstimadas;
                    }
                    // Si tienen las mismas horas estimadas, ordenar por tiempo gastado
                    return b.tiempoGastado - a.tiempoGastado;
                  })
                  .map((desarrollo, index) => (
                    <tr
                      key={desarrollo.id}
                      className="hover:bg-gray-50 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/desarrollos/${desarrollo.id}`}
                            className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {desarrollo.titulo}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1 max-w-md">
                            {desarrollo.descripcion}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                            desarrollo.estado,
                          )}`}
                        >
                          {desarrollo.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">{desarrollo.horasEstimadas}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={`text-sm font-semibold ${getHorasColor(desarrollo.horasEstimadas, desarrollo.tiempoGastado)}`}>
                            {formatTime(desarrollo.tiempoGastado)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {desarrollo.horasEstimadas > 0 ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 min-w-[100px]">
                              <div
                                className={`h-2.5 rounded-full ${
                                  desarrollo.tiempoGastado / 3600 > desarrollo.horasEstimadas
                                    ? 'bg-red-500'
                                    : desarrollo.tiempoGastado / 3600 > desarrollo.horasEstimadas * 0.8
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min(100, ((desarrollo.tiempoGastado / 3600) / desarrollo.horasEstimadas) * 100)}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {((desarrollo.tiempoGastado / 3600) / desarrollo.horasEstimadas * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin estimación</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/desarrollos/${desarrollo.id}`}
                            className="text-primary-600 hover:text-primary-900 font-semibold"
                          >
                            Ver
                          </Link>
                          <button
                            onClick={() => handleDeleteDesarrollo(desarrollo.id, desarrollo.titulo)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar desarrollo"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

