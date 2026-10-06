import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, Sparkles, Sliders, Download, RotateCw, 
  Trash2, Loader2, Eye, Crop, Layers, AlertCircle, RefreshCw
} from 'lucide-react';
import { GeneratedImageItem } from '../../types';
import { generateAIImage, analyzeVision } from '../../services/api';
import { saveImages } from '../../services/storage';

interface ImageStudioViewProps {
  images: GeneratedImageItem[];
  setImages: React.Dispatch<React.SetStateAction<GeneratedImageItem[]>>;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const ImageStudioView: React.FC<ImageStudioViewProps> = ({
  images,
  setImages,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'analyze'>('generate');

  // Generation state
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Canvas Editor State
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Vision Analysis State
  const [analyzeFile, setAnalyzeFile] = useState<{ base64: string; type: string } | null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt);
      handleGenerate(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Redraw canvas with filters
  useEffect(() => {
    if (!currentImageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageSrc;
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 800;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Apply CSS Filters to canvas context
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) grayscale(${grayscale}%)`;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };
  }, [currentImageSrc, brightness, contrast, saturation, blur, grayscale, rotation]);

  const handleGenerate = async (customPrompt?: string) => {
    const p = (customPrompt || prompt).trim();
    if (!p || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await generateAIImage(p, aspectRatio, style);
      const newImgItem: GeneratedImageItem = {
        id: `img_${Date.now()}`,
        url: res.imageUrl,
        prompt: p,
        aspectRatio,
        createdAt: new Date().toISOString(),
      };

      setImages((prev) => {
        const next = [newImgItem, ...prev];
        saveImages(next);
        return next;
      });

      setCurrentImageSrc(res.imageUrl);
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      setGenerationError(err.message || 'Image generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCanvas = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `sonvex_edited_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setGrayscale(0);
    setRotation(0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCurrentImageSrc(result);
      if (activeTab === 'analyze') {
        const base64 = result.split(',')[1];
        setAnalyzeFile({ base64, type: file.type || 'image/jpeg' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const runVisionAnalysis = async () => {
    if (!analyzeFile || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisText('');

    try {
      const res = await analyzeVision(
        analyzeFile.base64,
        analyzeFile.type,
        'Provide a comprehensive visual critique, object identification, color palette evaluation, and compositional analysis of this image.'
      );
      setAnalysisText(res.analysis);
    } catch (err: any) {
      alert('Vision analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full pb-20 pt-4 px-3 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Hidden file input */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Image Studio</h1>
            <p className="text-xs text-slate-400">Neural image synthesis, canvas editing, and deep vision analysis</p>
          </div>
        </div>

        <div className="flex p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'generate' ? 'bg-purple-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Generate
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'edit' ? 'bg-purple-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Canvas Editor
          </button>
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'analyze' ? 'bg-purple-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vision Inspector
          </button>
        </div>
      </div>

      {/* TAB 1: GENERATE IMAGE */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-slate-900/60 p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Visual Prompt
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your scene in rich detail (e.g. Cyberpunk orbital colony, glowing neon rings, ultra realistic 8k)..."
                  className="w-full rounded-xl bg-slate-950 border border-white/10 p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait</option>
                    <option value="4:3">4:3 Standard</option>
                    <option value="3:4">3:4 Vertical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Aesthetic Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="photorealistic">Photorealistic</option>
                    <option value="cyberpunk sci-fi">Cyberpunk Sci-Fi</option>
                    <option value="minimalist 3d render">Minimalist 3D</option>
                    <option value="concept art digital painting">Concept Art</option>
                    <option value="cinematic movie still">Cinematic 35mm</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? 'Synthesizing Visual Pixels...' : 'Generate Image'}</span>
              </button>

              {generationError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Generation Notice:</div>
                    <div className="text-[11px] text-rose-200 mt-0.5">{generationError}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Box */}
            <div className="lg:col-span-6 bg-slate-900/30 p-5 rounded-2xl border border-white/10 flex flex-col items-center justify-center min-h-[350px]">
              {currentImageSrc ? (
                <div className="space-y-3 w-full max-w-md">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl sonvex-glow-purple">
                    <img
                      src={currentImageSrc}
                      alt="Generated by SONVEX"
                      className="w-full h-auto object-contain max-h-[380px] mx-auto"
                    />
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={currentImageSrc}
                      download={`sonvex_image_${Date.now()}.png`}
                      className="flex-1 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download HD</span>
                    </a>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit in Canvas</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 text-xs space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                  <span>Enter a prompt on the left to synthesize high-resolution imagery.</span>
                </div>
              )}
            </div>
          </div>

          {/* Gallery history */}
          {images.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Studio Generation Gallery ({images.length})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setCurrentImageSrc(img.url)}
                    className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 cursor-pointer aspect-square bg-black"
                  >
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImages((prev) => {
                          const n = prev.filter((i) => i.id !== img.id);
                          saveImages(n);
                          return n;
                        });
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CANVAS EDITOR */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 bg-slate-900/60 p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="font-semibold text-slate-300 uppercase tracking-wider">Image Adjustments</span>
              <button onClick={handleResetFilters} className="text-cyan-400 hover:underline">Reset</button>
            </div>

            <button
              onClick={() => uploadInputRef.current?.click()}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Upload Custom Image
            </button>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Saturation</span>
                  <span className="font-mono">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Blur</span>
                  <span className="font-mono">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Grayscale</span>
                  <span className="font-mono">{grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grayscale}
                  onChange={(e) => setGrayscale(Number(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="flex-1 py-2 rounded-xl bg-slate-950 border border-white/5 hover:border-purple-500/30 flex items-center justify-center gap-1.5 text-slate-300"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleDownloadCanvas}
              disabled={!currentImageSrc}
              className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Edited Image</span>
            </button>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="lg:col-span-8 bg-slate-950 p-4 rounded-2xl border border-white/10 flex items-center justify-center min-h-[420px] overflow-hidden">
            {currentImageSrc ? (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[480px] object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <div className="text-center text-slate-500 text-xs">
                Upload or generate an image to edit on canvas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VISION INSPECTOR */}
      {activeTab === 'analyze' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/60 p-5 rounded-2xl border border-white/10 space-y-4">
            <button
              onClick={() => uploadInputRef.current?.click()}
              className="w-full py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{analyzeFile ? 'Replace Image' : 'Select Image for Vision Inspection'}</span>
            </button>

            {currentImageSrc && (
              <div className="rounded-xl overflow-hidden border border-white/10 max-h-56">
                <img src={currentImageSrc} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <button
              onClick={runVisionAnalysis}
              disabled={!analyzeFile || isAnalyzing}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              <span>{isAnalyzing ? 'Inspecting Visual Layers...' : 'Run Vision Analysis'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900/30 p-5 rounded-2xl border border-white/10 flex flex-col min-h-[350px]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 border-b border-white/5 mb-3">
              Vision Decomposition
            </span>
            <div className="flex-1 overflow-y-auto text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {analysisText || 'Select an image and click Run Vision Analysis.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
