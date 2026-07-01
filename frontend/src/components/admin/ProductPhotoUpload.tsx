import { useRef, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deletePhoto,
  reorderPhotos,
  setPrimaryPhoto,
  uploadPhoto,
} from '../../services/productPhotoService';
import type { ProductPhoto } from '../../types/product';

interface Props {
  productId: string;
  photos: ProductPhoto[];
  queryKey: unknown[];
}

export function ProductPhotoUpload({ productId, photos, queryKey }: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadPhoto(productId, file),
    onSuccess: invalidate,
  });

  const primaryMutation = useMutation({
    mutationFn: (photoId: string) => setPrimaryPhoto(productId, photoId),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => deletePhoto(productId, photoId),
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: (order: string[]) => reorderPhotos(productId, order),
    onSuccess: invalidate,
  });

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => uploadMutation.mutate(file));
  }

  function handleDropZoneDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDraggingOver(false);
    // Only handle file drops (not photo reorder drags)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  // ── Drag-to-reorder ──────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string) => {
      setDraggingId(id);
      e.dataTransfer.effectAllowed = 'move';
      // Prevent file upload handler from firing
      e.dataTransfer.clearData();
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingId || draggingId === targetId) return;

      const currentOrder = [...photos].sort((a, b) => a.order - b.order).map((p) => p.id);
      const fromIdx = currentOrder.indexOf(draggingId);
      const toIdx = currentOrder.indexOf(targetId);
      if (fromIdx < 0 || toIdx < 0) return;

      const newOrder = [...currentOrder];
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggingId);

      reorderMutation.mutate(newOrder);
      setDraggingId(null);
      setDragOverId(null);
    },
    [draggingId, photos, reorderMutation],
  );

  const sorted = [...photos].sort((a, b) => a.order - b.order);
  const isUploading = uploadMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { if (e.dataTransfer.files.length > 0 || !draggingId) { e.preventDefault(); setIsDraggingOver(true); }}}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDropZoneDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 transition ${
          isDraggingOver
            ? 'border-secondary bg-secondary/5'
            : 'border-neutral-300 bg-neutral-50 hover:border-primary-light hover:bg-primary-light/5'
        }`}
      >
        {isUploading ? (
          <p className="text-sm text-neutral-600">Enviando...</p>
        ) : (
          <>
            <span className="text-3xl">📷</span>
            <p className="mt-2 text-sm font-medium text-neutral-700">
              Clique ou arraste fotos aqui
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              JPG, PNG, WEBP • Máximo 10 fotos
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadMutation.isError && (
        <p className="text-xs text-danger">
          Erro ao enviar foto. Verifique o tipo e tamanho do arquivo.
        </p>
      )}

      {/* Photo grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {sorted.map((photo) => (
            <div
              key={photo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, photo.id)}
              onDragOver={(e) => handleDragOver(e, photo.id)}
              onDrop={(e) => handleDrop(e, photo.id)}
              onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
              className={`relative cursor-grab rounded-lg overflow-hidden transition ${
                photo.isPrimary
                  ? 'ring-2 ring-secondary'
                  : 'ring-1 ring-neutral-200'
              } ${dragOverId === photo.id && draggingId !== photo.id ? 'scale-105 ring-2 ring-primary-light' : ''} ${draggingId === photo.id ? 'opacity-50' : ''}`}
            >
              <img
                src={photo.url}
                alt="Foto do produto"
                className="h-24 w-full object-cover"
                draggable={false}
              />

              {/* Cover badge */}
              {photo.isPrimary && (
                <span className="absolute left-1 top-1 rounded-full bg-secondary px-1.5 py-0.5 text-xs font-medium text-white">
                  Capa
                </span>
              )}

              {/* Action buttons */}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1.5 py-1">
                {!photo.isPrimary && (
                  <button
                    title="Definir como capa"
                    onClick={() => primaryMutation.mutate(photo.id)}
                    disabled={primaryMutation.isPending}
                    className="text-yellow-300 hover:text-yellow-100 text-base leading-none"
                  >
                    ☆
                  </button>
                )}
                {photo.isPrimary && (
                  <span className="text-yellow-300 text-base leading-none">★</span>
                )}
                <button
                  title="Remover foto"
                  onClick={() => deleteMutation.mutate(photo.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-400 hover:text-red-200 text-sm leading-none font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sorted.length > 1 && (
        <p className="text-xs text-neutral-500">
          Arraste as fotos para reordenar. A primeira é a capa.
        </p>
      )}
    </div>
  );
}
