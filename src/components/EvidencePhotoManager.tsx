import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Eye,
  X,
  Maximize2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Download,
  ShieldCheck,
} from 'lucide-react';

interface EvidencePhotoManagerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  title?: string;
  subtitle?: string;
  readOnly?: boolean;
  maxPhotos?: number;
}

// Utility to compress image in client to optimized Base64 JPEG
const compressImage = (file: File, maxWidth = 1280, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const EvidencePhotoManager: React.FC<EvidencePhotoManagerProps> = ({
  photos = [],
  onChange,
  title = 'Evidencias Fotográficas',
  subtitle = 'Captura o sube fotografías del equipo, fallas, refacciones o recibo en sitio',
  readOnly = false,
  maxPhotos = 20,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('prompt');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stop camera stream on unmount or modal close
  useEffect(() => {
    if (!isCameraModalOpen && cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  }, [isCameraModalOpen, cameraStream]);

  // Request camera permission and start video stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setIsCameraModalOpen(true);

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no es soportada directamente en este navegador. Utiliza la opción de captura nativa.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      setFacingMode(mode);
      setPermissionState('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setPermissionState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permiso denegado por el usuario o navegador. Por favor habilita el permiso de cámara en los ajustes de tu navegador o usa el botón de captura nativa.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No se encontró ninguna cámara disponible en tu dispositivo.');
      } else {
        setCameraError(err.message || 'Error al iniciar la cámara. Puedes usar la captura estándar.');
      }
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraModalOpen(false);
    setCameraError(null);
  };

  // Toggle front/back camera
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  // Capture frame from video stream
  const capturePhotoFromStream = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror horizontally for natural feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    onChange([...(photos || []), photoDataUrl]);
    closeCamera();
  };

  // Handle file uploads (multi-file or native camera capture)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1280, 0.82);
          newPhotos.push(compressed);
        }
      }

      if (newPhotos.length > 0) {
        onChange([...(photos || []), ...newPhotos]);
      }
    } catch (err) {
      console.error('Error reading/compressing photos:', err);
    } finally {
      setIsProcessing(false);
      // Reset input value so same photo can be picked again if needed
      e.target.value = '';
    }
  };

  // Remove individual photo
  const removePhoto = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedPhotoIndex === index) {
      setSelectedPhotoIndex(null);
    } else if (selectedPhotoIndex !== null && selectedPhotoIndex > index) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">{title}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Hidden native Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              accept="image/*"
              multiple
              className="hidden"
              id="input-upload-evidence-files"
            />
            {/* Mobile native camera capture input with environment rear camera hint */}
            <input
              type="file"
              ref={captureInputRef}
              onChange={handleFilesSelected}
              accept="image/*"
              capture="environment"
              className="hidden"
              id="input-capture-native-camera"
            />

            {/* Direct Camera Shutter Button */}
            <button
              type="button"
              onClick={() => startCamera('environment')}
              disabled={isProcessing || photos.length >= maxPhotos}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Abrir cámara del dispositivo para capturar evidencia"
            >
              <Camera className="w-4 h-4" />
              <span>Tomar Foto</span>
            </button>

            {/* Quick Native Camera Option for Smartphones */}
            <button
              type="button"
              onClick={() => captureInputRef.current?.click()}
              disabled={isProcessing || photos.length >= maxPhotos}
              className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
              title="Tomar foto con app nativa de cámara"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Cámara Nativa</span>
            </button>

            {/* Gallery / File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || photos.length >= maxPhotos}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
              title="Subir imágenes desde la galería o archivos de tu equipo"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Subir Archivos</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading state indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Optimizando y procesando fotografías...</span>
        </div>
      )}

      {/* GRID DE FOTOGRAFÍAS:
          - Desktop: 4 columnas horizontales (grid-cols-4)
          - Tablet: 4 columnas horizontales (sm:grid-cols-4 / md:grid-cols-4)
          - Móvil: 2 columnas (grid-cols-2)
      */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="group relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-all hover:border-blue-400 hover:shadow-xs aspect-4/3 flex flex-col cursor-pointer"
              onClick={() => setSelectedPhotoIndex(index)}
            >
              {/* Photo Thumbnail */}
              <img
                src={photo}
                alt={`Evidencia #${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Top Badge Overlay */}
              <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                <span>#{index + 1}</span>
              </div>

              {/* Hover Actions / Controls Bar */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(index);
                  }}
                  className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-90"
                  title="Ver en pantalla completa"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={(e) => removePhoto(index, e)}
                    className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-bold shadow-xs transition-transform active:scale-90"
                    title="Eliminar esta fotografía"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Dropzone */
        <div
          onClick={() => !readOnly && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center transition-colors ${
            !readOnly ? 'cursor-pointer hover:bg-slate-50/60' : ''
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2.5">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-700">Sin evidencias fotográficas adjuntas</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {readOnly
              ? 'No se registraron fotos para este folio'
              : 'Presiona "Tomar Foto" con tu teléfono o haz clic aquí para subir imágenes'}
          </p>
        </div>
      )}

      {/* LIVE CAMERA CAPTURE MODAL WITH CAMERA STREAM & PERMISSIONS */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Camera Top Bar */}
            <div className="px-4 py-3 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Cámara de Evidencia</span>
                {permissionState === 'granted' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Permiso Activo</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Front/Back Camera */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs flex items-center gap-1"
                  title="Cambiar entre cámara frontal y trasera"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden xs:inline text-[11px]">Girar</span>
                </button>

                <button
                  type="button"
                  onClick={closeCamera}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Viewport / Permissions prompt */}
            <div className="relative bg-black min-h-[320px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-slate-300 max-w-md space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-900/50 border border-rose-600 text-rose-300 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No se pudo acceder a la cámara</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        captureInputRef.current?.click();
                        closeCamera();
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Usar Cámara Nativa del Teléfono
                    </button>
                    <button
                      type="button"
                      onClick={() => startCamera('environment')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                    >
                      Reintentar Permiso
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch(console.error);
                      }
                    }}
                    className={`w-full h-full max-h-[65vh] object-contain ${
                      facingMode === 'user' ? 'scale-x-[-1]' : ''
                    }`}
                  />

                  {/* Shutter Grid Lines Overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-white/10 grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-r border-b border-white/10" />
                    <div className="border-b border-white/10" />
                    <div className="border-r border-white/10" />
                    <div className="border-r border-white/10" />
                    <div />
                  </div>
                </>
              )}
            </div>

            {/* Camera Bottom Shutter Bar */}
            {!cameraError && (
              <div className="p-4 bg-slate-950 flex items-center justify-between border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Alinea el equipo o pieza y presiona el obturador
                </span>

                <button
                  type="button"
                  onClick={capturePhotoFromStream}
                  className="w-14 h-14 rounded-full bg-white hover:bg-slate-100 active:scale-90 transition-transform flex items-center justify-center p-1 shadow-lg ring-4 ring-blue-500/40 cursor-pointer"
                  title="Tomar fotografía"
                >
                  <div className="w-11 h-11 rounded-full border-2 border-slate-900 bg-white" />
                </button>

                <button
                  type="button"
                  onClick={closeCamera}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PHOTO MODAL */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Lightbox Top Header */}
          <div
            className="w-full max-w-4xl flex items-center justify-between text-white pb-3 border-b border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                Evidencia #{selectedPhotoIndex + 1} de {photos.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Download photo */}
              <a
                href={photos[selectedPhotoIndex]}
                download={`evidencia_${selectedPhotoIndex + 1}.jpg`}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Descargar imagen"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-4 h-4" />
              </a>

              {!readOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(selectedPhotoIndex);
                  }}
                  className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                  title="Eliminar esta foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Large Image View */}
          <div
            className="flex-1 flex items-center justify-center p-2 max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedPhotoIndex]}
              alt={`Evidencia ampliada #${selectedPhotoIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
            />
          </div>

          {/* Navigation Controls */}
          <div
            className="w-full max-w-4xl flex items-center justify-between text-white pt-3 border-t border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={selectedPhotoIndex === 0}
              onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold transition-colors"
            >
              Anterior
            </button>

            <span className="text-xs text-slate-400">
              {selectedPhotoIndex + 1} / {photos.length}
            </span>

            <button
              type="button"
              disabled={selectedPhotoIndex === photos.length - 1}
              onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
