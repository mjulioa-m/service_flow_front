'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockDailiesApi, mockDesarrollosApi, mockSprintsApi, Daily, Desarrollo, Sprint } from '@/lib/mockData';

export default function DailyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dailyId = params.id as string;

  const [daily, setDaily] = useState<Daily | null>(null);
  const [desarrollos, setDesarrollos] = useState<Desarrollo[]>([]);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dailyId) {
      loadDaily();
    }
  }, [dailyId]);

  const loadDaily = async () => {
    try {
      setLoading(true);
      const dailyData = await mockDailiesApi.getById(dailyId);
      setDaily(dailyData);

      // Cargar información de desarrollos
      if (dailyData.desarrollos.length > 0) {
        const allDesarrollos = await mockDesarrollosApi.getAll();
        const desarrollosEnDaily = allDesarrollos.filter(d =>
          dailyData.desarrollos.some(dd => dd.desarrolloId === d.id)
        );
        setDesarrollos(desarrollosEnDaily);
      }

      // Cargar información del sprint si existe
      if (dailyData.sprintId) {
        try {
          const sprintData = await mockSprintsApi.getById(dailyData.sprintId);
          setSprint(sprintData);
        } catch (err) {
          console.error('Error al cargar sprint:', err);
        }
      }

      setError(null);
    } catch (err) {
      setError('Error al cargar la daily');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDaily = async () => {
    if (!daily) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar la daily del ${formatDate(daily.fecha)}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Necesitamos agregar el método delete a mockDailiesApi
      await mockDailiesApi.delete(dailyId);
      router.push('/dailies');
    } catch (err) {
      setError('Error al eliminar la daily');
      console.error(err);
    }
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

  const getDesarrolloInfo = (desarrolloId: string) => {
    return desarrollos.find(d => d.id === desarrolloId);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Cargando daily...</p>
        </div>
      </div>
    );
  }

  if (error || !daily) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/dailies" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <span className="mr-2">←</span>
          Volver a dailies
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error || 'Daily no encontrada'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/dailies" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <span className="mr-2">←</span>
          Volver a dailies
        </Link>
        <button
          onClick={handleDeleteDaily}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily - {formatDate(daily.fecha)}</h1>
            {sprint && (
              <Link
                href={`/sprints/${sprint.id}`}
                className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Sprint: {sprint.nombre}
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Desarrollos</p>
                <p className="text-lg font-bold text-gray-900">{daily.desarrollos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Bloqueadores</p>
                <p className="text-lg font-bold text-gray-900">{daily.bloqueadores.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Total</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatTime(daily.desarrollos.reduce((sum, d) => sum + d.tiempoGastado, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {daily.notas && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Notas Adicionales
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">{daily.notas}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Desarrollos ({daily.desarrollos.length})
        </h2>

        {daily.desarrollos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <p className="text-gray-600 font-medium">No hay desarrollos registrados en esta daily</p>
          </div>
        ) : (
          <div className="space-y-4">
            {daily.desarrollos.map((devDaily, index) => {
              const desarrollo = getDesarrolloInfo(devDaily.desarrolloId);
              return (
                <div
                  key={index}
                  className="border-l-4 border-primary-500 bg-gradient-to-r from-gray-50 to-white pl-5 pr-5 py-5 rounded-r-xl hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      {desarrollo ? (
                        <Link
                          href={`/desarrollos/${desarrollo.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {desarrollo.titulo}
                        </Link>
                      ) : (
                        <h3 className="text-lg font-bold text-gray-900">Desarrollo ID: {devDaily.desarrolloId}</h3>
                      )}
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(devDaily.tiempoGastado)}
                      </div>
                    </div>
                  </div>

                  {devDaily.trabajoAyer && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        Trabajo de Ayer
                      </h4>
                      <p className="text-gray-700 text-sm bg-blue-50 rounded p-3 border border-blue-200">{devDaily.trabajoAyer}</p>
                    </div>
                  )}

                  {devDaily.trabajoHoy && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Trabajo de Hoy
                      </h4>
                      <p className="text-gray-700 text-sm bg-green-50 rounded p-3 border border-green-200">{devDaily.trabajoHoy}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {daily.bloqueadores.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Bloqueadores ({daily.bloqueadores.length})
          </h2>
          <div className="space-y-2">
            {daily.bloqueadores.map((bloqueador, index) => (
              <div
                key={index}
                className="bg-red-50 border-l-4 border-red-500 pl-4 pr-4 py-3 rounded-r-lg"
              >
                <p className="text-gray-800 font-medium">{bloqueador}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

