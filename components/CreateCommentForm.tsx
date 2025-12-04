'use client';

import { useState } from 'react';
import { mockComentariosApi } from '@/lib/mockData';

interface CreateCommentFormProps {
  desarrolloId: string;
  onSuccess: () => void;
}

export default function CreateCommentForm({ desarrolloId, onSuccess }: CreateCommentFormProps) {
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await mockComentariosApi.create(desarrolloId, { contenido });
      setContenido('');
      onSuccess();
    } catch (err) {
      setError('Error al crear el comentario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-2">
            Agregar Comentario
          </label>
          <textarea
            id="contenido"
            required
            rows={4}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white resize-none"
          />
        </div>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading || !contenido.trim()}
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <span className="mr-2">💬</span>
                Agregar Comentario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

