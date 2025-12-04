'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { mockDesarrollosApi, mockComentariosApi, Desarrollo, Comentario } from '@/lib/mockData';
import CreateCommentForm from '@/components/CreateCommentForm';
import Timer from '@/components/Timer';
import { useRouter } from 'next/navigation';

export default function DesarrolloDetailPage() {
  const params = useParams();
  const router = useRouter();
  const desarrolloId = params.id as string;

  const [desarrollo, setDesarrollo] = useState<Desarrollo | null>(null);
  const [comments, setComments] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (desarrolloId) {
      loadDesarrollo();
      loadComments();
    }
  }, [desarrolloId]);

  const loadDesarrollo = async () => {
    try {
      setLoading(true);
      const data = await mockDesarrollosApi.getById(desarrolloId);
      setDesarrollo(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el desarrollo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await mockComentariosApi.getByDesarrollo(desarrolloId);
      setComments(data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
    }
  };

  const handleCommentCreated = () => {
    loadComments();
  };

  const handleTimeUpdate = (newTime: number) => {
    if (desarrollo) {
      setDesarrollo({ ...desarrollo, tiempoGastado: newTime });
    }
  };

  const handleDeleteDesarrollo = async () => {
    if (!desarrollo) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar el desarrollo "${desarrollo.titulo}"?\n\nEsta acción eliminará también todos los comentarios asociados y no se puede deshacer.`)) {
      return;
    }

    try {
      await mockDesarrollosApi.delete(desarrolloId);
      router.push('/desarrollos');
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
    if (horasGastadas === 0) return 'bg-gray-100 text-gray-800';
    if (horasGastadas > horasEstimadas) return 'bg-red-100 text-red-800';
    if (horasGastadas > horasEstimadas * 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Cargando desarrollo...</p>
        </div>
      </div>
    );
  }

  if (error || !desarrollo) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/desarrollos" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <span className="mr-2">←</span>
          Volver a desarrollos
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error || 'Desarrollo no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/desarrollos" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <span className="mr-2">←</span>
          Volver a desarrollos
        </Link>
        <button
          onClick={handleDeleteDesarrollo}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{desarrollo.titulo}</h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span
                    className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${getEstadoColor(
                      desarrollo.estado,
                    )}`}
                  >
                    {desarrollo.estado}
                  </span>
                  <span className="px-4 py-2 text-sm font-semibold rounded-full shadow-sm bg-blue-100 text-blue-800">
                    {desarrollo.horasEstimadas}h estimadas
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descripción
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">{desarrollo.descripcion}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Creado</p>
                    <p className="text-gray-600 text-xs">{new Date(desarrollo.fechaCreacion).toLocaleString('es-ES')}</p>
                  </div>
                </div>
              </div>
              {desarrollo.fechaActualizacion && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center text-sm">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Actualizado</p>
                      <p className="text-gray-600 text-xs">{new Date(desarrollo.fechaActualizacion).toLocaleString('es-ES')}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center text-sm">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Tiempo Total</p>
                    <p className={`text-xs font-semibold ${getHorasColor(desarrollo.horasEstimadas, desarrollo.tiempoGastado).split(' ')[1]}`}>
                      {formatTime(desarrollo.tiempoGastado)} / {desarrollo.horasEstimadas}h
                    </p>
                  </div>
                </div>
              </div>
              {desarrollo.horasEstimadas > 0 && (
                <div className="col-span-3 mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
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
                  <p className="text-xs text-gray-500 mt-1">
                    {((desarrollo.tiempoGastado / 3600) / desarrollo.horasEstimadas * 100).toFixed(0)}% completado
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <Timer 
            desarrolloId={desarrollo.id} 
            tiempoGastado={desarrollo.tiempoGastado}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comentarios
            <span className="ml-2 text-lg font-normal text-gray-500">({comments.length})</span>
          </h2>
        </div>
        
        <CreateCommentForm desarrolloId={desarrolloId} onSuccess={handleCommentCreated} />

        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No hay comentarios aún</p>
              <p className="text-sm text-gray-400 mt-1">Sé el primero en comentar</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <div 
                key={comment.id} 
                className="border-l-4 border-primary-500 bg-gradient-to-r from-gray-50 to-white pl-5 pr-5 py-5 rounded-r-xl hover:shadow-md transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-3">
                  {comment.contenido}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(comment.fechaCreacion).toLocaleString('es-ES')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

