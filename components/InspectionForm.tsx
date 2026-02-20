
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { analyzeInspectionPhoto } from '../services/geminiService';
import { compressImage } from '../services/visionUtils';
import { InspectionRecord, RiskLevel, FaultCategory } from '../types';

interface InspectionFormProps {
  onSave: (record: InspectionRecord) => void;
  initialAuditor: string;
  existingLocations: string[];
  properties: string[];
  editingRecord?: InspectionRecord | null;
  onCancelEdit?: () => void;
}

const InspectionForm: React.FC<InspectionFormProps> = ({
  onSave,
  initialAuditor,
  existingLocations,
  properties,
  editingRecord,
  onCancelEdit
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(editingRecord?.photoUrl || null);

  // Advanced Camera States
  const [zoom, setZoom] = useState(1);
  const [torch, setTorch] = useState(false);
  const [focusMode, setFocusMode] = useState('continuous');
  const [iso, setIso] = useState<number | null>(null);
  const [capabilities, setCapabilities] = useState<any>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number, y: number } | null>(null);
  const [cameraError, setCameraError] = useState<{ type: string; message: string; action: string } | null>(null);

  const auditorOptions = ["Dr. Mourad Saudi", "Dr. Mohamed Hassan", "Dr. Mohamed Hussien"];

  const [selectedLocation, setSelectedLocation] = useState(editingRecord?.location || existingLocations[0] || '');
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomLocation, setShowCustomLocation] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState(editingRecord?.propertyName || properties[0] || '');
  const [customProperty, setCustomProperty] = useState('');
  const [showCustomProperty, setShowCustomProperty] = useState(false);

  const [formData, setFormData] = useState({
    auditorName: editingRecord?.auditorName || initialAuditor || auditorOptions[0],
    faultDescription: editingRecord?.faultDescription || '',
  });

  // Resource Cleanup: Ensure camera is dismissed when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'OTHER_CUSTOM') {
      setShowCustomLocation(true);
      setSelectedLocation('OTHER_CUSTOM');
    } else {
      setShowCustomLocation(false);
      setSelectedLocation(value);
    }
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'OTHER_CUSTOM') {
      setShowCustomProperty(true);
      setSelectedProperty('OTHER_CUSTOM');
    } else {
      setShowCustomProperty(false);
      setSelectedProperty(value);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setIsCapturing(true);

      const track = newStream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const caps = (track as any).getCapabilities();
        setCapabilities(caps);
        if (caps.iso) setIso(caps.iso.min);
      }
    } catch (err: any) {
      console.error("Camera Hardware Error:", err);

      let errorDetails = {
        type: "Access Error",
        message: "Unable to reach video hardware.",
        action: "Check if your camera is connected or if another app is using it."
      };

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorDetails = {
          type: "Permission Denied",
          message: "Camera access was blocked by the browser.",
          action: "Please enable camera permissions in your browser settings and try again."
        };
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorDetails = {
          type: "Hardware Not Found",
          message: "No camera device detected on this system.",
          action: "Ensure your camera is plugged in or use the file upload option."
        };
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorDetails = {
          type: "Device Occupied",
          message: "Camera is already in use by another application.",
          action: "Close other apps that might be using the camera (Zoom, Teams, etc.)."
        };
      }

      setCameraError(errorDetails);
    }
  };

  const setVideoNode = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && stream) {
      node.srcObject = stream;
      node.play().catch(e => {
        console.error("Video play error:", e);
      });
    }
  }, [stream]);

  useEffect(() => {
    if (stream && isCapturing) {
      const track = stream.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        const adv: any = {};
        if (capabilities?.zoom) adv.zoom = zoom;
        if (capabilities?.torch) adv.torch = torch;
        if (capabilities?.iso && iso !== null) adv.iso = iso;
        if (Object.keys(adv).length > 0) {
          (track as any).applyConstraints({ advanced: [adv] }).catch(() => { });
        }
      }
    }
  }, [zoom, torch, iso, capabilities, stream, isCapturing]);

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsCapturing(false);
  };

  const handleVideoTap = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current || !stream) return;
    const rect = videoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });

    const track = stream.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      const caps = (track as any).getCapabilities();
      if (caps.focusMode?.includes('manual')) {
        (track as any).applyConstraints({
          advanced: [{
            focusMode: 'manual',
            pointsOfInterest: [{ x: x / rect.width, y: y / rect.height }]
          }]
        }).then(() => {
          setFocusMode('manual');
          setTimeout(() => {
            if (stream?.active) {
              setFocusMode('continuous');
              (track as any).applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => { });
            }
          }, 3000);
        }).catch(() => { });
      }
    }
    setTimeout(() => setFocusPoint(null), 1500);
  };

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        stopCamera();
        processAnalysis(dataUrl);
      }
    }
  }, [formData, selectedLocation, customLocation, selectedProperty, customProperty, onSave, stream]);

  const processAnalysis = async (image: string) => {
    setAnalyzing(true);
    try {
      const compressedImage = await compressImage(image);
      const base64 = compressedImage.split(',')[1];
      const analysis = await analyzeInspectionPhoto(base64);
      const finalLoc = selectedLocation === 'OTHER_CUSTOM' ? customLocation : selectedLocation;
      const finalProp = selectedProperty === 'OTHER_CUSTOM' ? customProperty : selectedProperty;

      const record: InspectionRecord = {
        id: editingRecord?.id || `insp-${Date.now()}`,
        timestamp: editingRecord?.timestamp || new Date().toISOString(),
        inspectionDate: editingRecord?.inspectionDate || new Date().toLocaleDateString('en-GB'),
        auditorName: formData.auditorName,
        location: finalLoc || 'General Area',
        propertyName: finalProp || 'Unnamed Property',
        photoUrl: compressedImage,
        riskLevel: (analysis.riskLevel as RiskLevel) || editingRecord?.riskLevel || RiskLevel.MEDIUM,
        category: (analysis.category as FaultCategory) || editingRecord?.category || FaultCategory.HYGIENE,
        faultDescription: analysis.faultDescription || editingRecord?.faultDescription || 'Observation logged.',
        remediationSteps: analysis.remediationSteps || editingRecord?.remediationSteps || ['Perform routine inspection'],
        status: editingRecord?.status || 'Open',
      };
      onSave(record);
    } catch (error) {
      alert("AI Analysis error. Falling back to basic log.");
    } finally {
      setAnalyzing(false);
      setCapturedImage(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        processAnalysis(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 no-print pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            {editingRecord ? 'Registry Revision' : 'Intelligence Intake'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            {editingRecord ? `Updating Evidence ID: ${editingRecord.id}` : 'Initialize site-specific visual evidence and auditor accountability.'}
          </p>
        </div>
        {editingRecord && (
          <button
            onClick={onCancelEdit}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Discard Edits
          </button>
        )}
      </header>

      {cameraError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/50 p-8 rounded-[2.5rem] flex items-start gap-6 text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-800 rounded-2xl flex items-center justify-center text-3xl shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="font-black uppercase text-xs tracking-widest mb-1">{cameraError.type}</p>
            <p className="font-bold text-lg mb-2">{cameraError.message}</p>
            <p className="text-sm opacity-80 leading-relaxed mb-6 font-medium">{cameraError.action}</p>
            <div className="flex gap-4">
              <button onClick={startCamera} className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-red-900/20">Retry Camera</button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">Use File Upload</button>
            </div>
          </div>
        </div>
      )}

      {!isCapturing && !analyzing && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Lead Auditor</label>
                <select
                  className="w-full pl-5 pr-10 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-slate-50/50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-slate-200 transition-all appearance-none"
                  value={formData.auditorName}
                  onChange={(e) => setFormData({ ...formData, auditorName: e.target.value })}
                >
                  {auditorOptions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Hotel Property</label>
                <select
                  className="w-full pl-5 pr-10 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-slate-50/50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-slate-200 transition-all appearance-none"
                  value={selectedProperty}
                  onChange={handlePropertyChange}
                >
                  {properties.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="OTHER_CUSTOM" className="text-blue-600 font-bold">+ New Property Asset</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Audit Section</label>
                <select
                  className="w-full pl-5 pr-10 py-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-slate-50/50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-slate-200 transition-all appearance-none"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                >
                  {existingLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  <option value="OTHER_CUSTOM" className="text-blue-600 font-bold">+ Define New Section</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showCustomProperty && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">New Property Detail</label>
                  <input type="text" placeholder="Hotel Name..." className="w-full px-8 py-5 rounded-2xl border-2 border-blue-100 dark:border-blue-900 focus:border-blue-500 focus:outline-none bg-blue-50/30 dark:bg-blue-900/20 font-black text-slate-800 dark:text-white" value={customProperty} onChange={(e) => setCustomProperty(e.target.value)} />
                </div>
              )}
              {showCustomLocation && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">New Section Identifier</label>
                  <input type="text" placeholder="e.g. Loading Dock B" className="w-full px-8 py-5 rounded-2xl border-2 border-blue-100 dark:border-blue-900 focus:border-blue-500 focus:outline-none bg-blue-50/30 dark:bg-blue-900/20 font-black text-slate-800 dark:text-white" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} />
                </div>
              )}
            </div>

            <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button onClick={startCamera} className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black py-8 px-8 rounded-[2rem] transition-all shadow-2xl flex flex-col items-center justify-center gap-4 active:scale-95 border-b-[6px] border-slate-700 dark:border-slate-300 active:border-b-0">
                <div className="w-14 h-14 bg-white/10 dark:bg-slate-900/10 rounded-2xl flex items-center justify-center"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg></div>
                <div className="text-center"><p className="text-xl tracking-tight leading-none">{editingRecord ? 'Retake Audit Evidence' : 'Launch Optical Engine'}</p></div>
              </button>

              <button onClick={() => fileInputRef.current?.click()} className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 font-black py-8 px-8 rounded-[2rem] transition-all shadow-sm flex flex-col items-center justify-center gap-4 active:scale-95 border-b-[6px] border-slate-100 dark:border-slate-600 active:border-b-0">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></div>
                <div className="text-center"><p className="text-xl tracking-tight leading-none">Import Image Asset</p></div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>

            {editingRecord && (
              <div className="pt-10 border-t border-slate-100 dark:border-slate-700 bg-blue-50/20 dark:bg-blue-900/10 p-6 rounded-3xl">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Updating System Entry</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">You are currently modifying an existing registry record. Saving will update the global database with the new visual evidence and analysis.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isCapturing && (
        <div className="relative bg-black md:rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/3] border-slate-900 md:border-4 animate-in fade-in zoom-in duration-700">
          <video ref={setVideoNode} autoPlay muted playsInline className="w-full h-full object-cover cursor-crosshair" onClick={handleVideoTap} />

          {/* Pro Camera Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/3 left-0 w-full h-px bg-white"></div>
            <div className="absolute top-2/3 left-0 w-full h-px bg-white"></div>
            <div className="absolute left-1/3 top-0 h-full w-px bg-white"></div>
            <div className="absolute left-2/3 top-0 h-full w-px bg-white"></div>
          </div>

          {/* Enhanced AF Bracketing Box */}
          {focusPoint && (
            <div
              className="absolute w-24 h-24 border-2 border-white/80 rounded-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              style={{ left: focusPoint.x, top: focusPoint.y }}
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t-4 border-l-4 border-yellow-400 rounded-tl-sm animate-pulse"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-4 border-r-4 border-yellow-400 rounded-tr-sm animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-4 border-l-4 border-yellow-400 rounded-bl-sm animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-4 border-r-4 border-yellow-400 rounded-br-sm animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping mx-auto mt-[44px]"></div>
            </div>
          )}

          <div className="absolute bottom-10 left-0 right-0 px-10 flex flex-col items-center gap-6">
            <div className="w-full grid grid-cols-1 md:grid-cols-3 items-end gap-4">

              {/* Camera Telemetry */}
              <div className="bg-black/50 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 space-y-4 shadow-2xl">
                {capabilities?.zoom ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[8px] text-white/40 font-black uppercase">Focal: {zoom.toFixed(1)}x</span></div>
                    <input type="range" min={capabilities.zoom.min} max={capabilities.zoom.max} step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-blue-500 h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer" />
                  </div>
                ) : (
                  <div className="py-2 border-b border-white/5 opacity-40"><span className="text-[8px] text-white/40 font-black uppercase">Digital Zoom N/A</span></div>
                )}

                {capabilities?.iso ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[8px] text-white/40 font-black uppercase">ISO Gain: {iso}</span></div>
                    <input type="range" min={capabilities.iso.min} max={capabilities.iso.max} step="1" value={iso || 0} onChange={(e) => setIso(parseInt(e.target.value))} className="w-full accent-amber-500 h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer" />
                  </div>
                ) : (
                  <div className="py-2 border-b border-white/5 opacity-40"><span className="text-[8px] text-white/40 font-black uppercase">Auto ISO Lock</span></div>
                )}

                <div className="flex gap-2">
                  {capabilities?.torch ? (
                    <button onClick={() => setTorch(!torch)} className={`flex-1 py-3 rounded-xl border text-[8px] font-black uppercase transition-all ${torch ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10 text-white/40'}`}>
                      {torch ? 'Flash ON' : 'Flash OFF'}
                    </button>
                  ) : (
                    <div className="flex-1 py-3 rounded-xl border border-white/5 bg-white/5 opacity-30 flex items-center justify-center"><span className="text-[8px] text-white/40 font-black uppercase">Torch N/A</span></div>
                  )}
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2 py-3 flex items-center justify-center">
                    <span className="text-[8px] text-white/40 font-black uppercase">{focusMode === 'continuous' ? 'AF-C Active' : 'AF-M Lock'}</span>
                  </div>
                </div>
              </div>

              {/* Shutter Button */}
              <div className="flex justify-center order-first md:order-none">
                <button
                  onClick={handleCapture}
                  className="w-32 h-32 bg-white rounded-full border-[12px] border-slate-900 flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_80px_rgba(255,255,255,0.2)] group"
                >
                  <div className="w-20 h-20 bg-blue-600 rounded-full group-hover:bg-blue-500 transition-colors shadow-inner" />
                </button>
              </div>

              {/* Quick Abort */}
              <div className="hidden md:flex bg-black/30 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 flex-col justify-center">
                <button onClick={stopCamera} className="bg-red-600/20 text-red-500 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase border border-red-500/30 transition-colors hover:bg-red-600/40">Abort Session</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="bg-slate-900 rounded-[3rem] p-32 text-center border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Animated Matrix Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_70%)] animate-pulse"></div>
            <div className="grid grid-cols-12 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-blue-500/10 h-full w-full"></div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 mb-16 relative">
              <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_#2563eb]">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
            </div>
            <h3 className="text-5xl font-black text-white uppercase tracking-tighter mb-6">Gemini Vision</h3>
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/10">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Analyzing Telemetry Data...</p>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default InspectionForm;
