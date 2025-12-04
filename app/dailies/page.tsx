'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockDailiesApi, mockSprintsApi, Daily, Sprint } from '@/lib/mockData';
import CreateDailyForm from '@/components/CreateDailyForm';

export default function DailiesPage() {
  const router = useRouter();
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadDailies();
    loadSprints();
  }, []);

  const loadDailies = async () => {
    try {
      setLoading(true);
      const data = await mockDailiesApi.getAll();
      setDailies(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los dailies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSprints = async () => {
    try {
      const data = await mockSprintsApi.getAll();
      setSprints(data);
    } catch (err) {
      console.error('Error al cargar sprints:', err);
    }
  };

  const handleDeleteDaily = async (id: string, fecha: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la daily del ${formatDate(fecha)}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await mockDailiesApi.delete(id);
      loadDailies();
    } catch (err) {
      setError('Error al eliminar la daily');
      console.error(err);
    }
  };

  const getSprintNombre = (sprintId?: string) => {
    if (!sprintId) return null;
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint ? sprint.nombre : null;
  };

  const handleDailyCreated = () => {
    setShowForm(false);
    loadDailies();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dailies</h1>
            <p className="mt-2 text-sm text-gray-600">
              Reuniones diarias para sincronizar el equipo y compartir progreso
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            {showForm ? (
              <>
                <span className="mr-2">✕</span>
                Cancelar
              </>
            ) : (
              <>
                <span className="mr-2">+</span>
                Nueva Daily
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateDailyForm onSuccess={handleDailyCreated} />
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
            <p className="text-gray-600">Cargando dailies...</p>
          </div>
        </div>
      ) : dailies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay dailies</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primera daily</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <span className="mr-2">+</span>
              Crear Primera Daily
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
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sprint
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Desarrollos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Bloqueadores
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailies
                  .sort((a, b) => {
                    // Ordenar por fecha (más reciente primero)
                    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
                  })
                  .map((daily, index) => (
                    <tr
                      key={daily.id}
                      className="hover:bg-gray-50 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">{formatDate(daily.fecha)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {daily.sprintId ? (
                          getSprintNombre(daily.sprintId) ? (
                            <Link
                              href={`/sprints/${daily.sprintId}`}
                              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              {getSprintNombre(daily.sprintId)}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500 font-medium">{daily.sprintId}</span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">Sin sprint</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {daily.desarrollos.length > 0 ? (
                            <div className="space-y-1">
                              <span className="font-semibold text-gray-900">{daily.desarrollos.length}</span>
                              <span className="text-gray-500"> desarrollo{daily.desarrollos.length !== 1 ? 's' : ''}</span>
                              <div className="text-xs text-gray-500 mt-1">
                                Total: {formatTime(daily.desarrollos.reduce((sum, d) => sum + d.tiempoGastado, 0))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin desarrollos</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {daily.bloqueadores.length > 0 ? (
                          <div className="flex items-center">
                            <span className="text-red-600 mr-1">🚫</span>
                            <span className="text-sm font-semibold text-red-600">{daily.bloqueadores.length}</span>
                            <span className="text-sm text-gray-500 ml-1">bloqueador{daily.bloqueadores.length !== 1 ? 'es' : ''}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin bloqueadores</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {daily.notas ? (
                          <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{daily.notas}</p>
                        ) : (
                          <span className="text-sm text-gray-400">Sin notas</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/dailies/${daily.id}`}
                            className="text-primary-600 hover:text-primary-900 font-semibold"
                          >
                            Ver detalles →
                          </Link>
                          <button
                            onClick={() => handleDeleteDaily(daily.id, daily.fecha)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Eliminar daily"
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

