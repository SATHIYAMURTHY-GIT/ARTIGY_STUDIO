
import React, { useState, useRef, useCallback } from 'react';
import { ArtMode, ImageData } from './types';
import { geminiService } from './services/geminiService';
import { convertToAscii } from './utils/asciiConverter';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultPencil, setResultPencil] = useState<string | null>(null);
  const [resultAscii, setResultAscii] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ArtMode>('PENCIL');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setSourceImage({
          url: event.target?.result as string,
          base64: base64,
          mimeType: file.type
        });
        // Reset results when new image uploaded
        setResultPencil(null);
        setResultAscii(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processPencil = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await geminiService.transformToPencilSketch(sourceImage.base64, sourceImage.mimeType);
      setResultPencil(result);
      setActiveTab('PENCIL');
    } catch (err) {
      setError('Gemini failed to generate the sketch. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAscii = () => {
    if (!sourceImage) return;
    setIsProcessing(true);
    const img = new Image();
    img.src = sourceImage.url;
    img.onload = () => {
      const ascii = convertToAscii(img, 120);
      setResultAscii(ascii);
      setActiveTab('ASCII');
      setIsProcessing(false);
    };
  };

  const downloadResult = () => {
    if (activeTab === 'PENCIL' && resultPencil) {
      const link = document.createElement('a');
      link.href = resultPencil;
      link.download = 'artify-pencil-sketch.png';
      link.click();
    } else if (activeTab === 'ASCII' && resultAscii) {
      const blob = new Blob([resultAscii], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'artify-ascii.txt';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-6xl mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
          Artify Studio
        </h1>
        <p className="text-neutral-400 text-lg">
          Transform your moments into timeless pencil art or retro ASCII visuals.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload & Original */}
        <section className="flex flex-col gap-6">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
            {!sourceImage ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Upload Image
                </button>
                <p className="mt-4 text-sm text-neutral-500">JPG, PNG up to 10MB</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="font-semibold text-neutral-300">Source Image</h3>
                   <button 
                    onClick={() => setSourceImage(null)}
                    className="text-neutral-500 hover:text-white transition-colors"
                   >
                     Change
                   </button>
                </div>
                <div className="relative rounded-2xl overflow-hidden bg-black/40 flex-grow flex items-center justify-center">
                  <img src={sourceImage.url} alt="Original" className="max-h-[400px] object-contain w-full" />
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              disabled={!sourceImage || isProcessing}
              onClick={processPencil}
              className={`flex-1 min-w-[150px] py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                !sourceImage || isProcessing 
                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' 
                : 'bg-neutral-100 text-black hover:bg-white active:scale-95'
              }`}
            >
              {isProcessing && activeTab === 'PENCIL' ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              )}
              Convert to Pencil
            </button>
            <button
              disabled={!sourceImage || isProcessing}
              onClick={processAscii}
              className={`flex-1 min-w-[150px] py-4 rounded-2xl font-bold border border-neutral-700 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 ${
                !sourceImage || isProcessing ? 'text-neutral-600 border-neutral-800 cursor-not-allowed' : 'text-neutral-200'
              }`}
            >
               {isProcessing && activeTab === 'ASCII' ? (
                <div className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-100 rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              )}
              Convert to ASCII
            </button>
          </div>
        </section>

        {/* Right Column: Result View */}
        <section className="flex flex-col gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col min-h-[520px] relative">
            <div className="flex gap-4 mb-6 border-b border-neutral-800 pb-2">
              <button 
                onClick={() => setActiveTab('PENCIL')}
                className={`pb-2 px-1 text-sm font-semibold transition-all relative ${activeTab === 'PENCIL' ? 'text-white' : 'text-neutral-500'}`}
              >
                Pencil Sketch
                {activeTab === 'PENCIL' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('ASCII')}
                className={`pb-2 px-1 text-sm font-semibold transition-all relative ${activeTab === 'ASCII' ? 'text-white' : 'text-neutral-500'}`}
              >
                ASCII Art
                {activeTab === 'ASCII' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white rounded-full" />}
              </button>
            </div>

            <div className="flex-grow flex items-center justify-center relative bg-black/20 rounded-2xl overflow-hidden p-4">
              {activeTab === 'PENCIL' ? (
                resultPencil ? (
                  <img src={resultPencil} alt="Result Pencil" className="max-h-[400px] object-contain drop-shadow-2xl" />
                ) : (
                  <div className="text-neutral-600 flex flex-col items-center">
                    <p>No pencil sketch generated yet</p>
                  </div>
                )
              ) : (
                resultAscii ? (
                  <div className="w-full h-full overflow-auto bg-neutral-950 p-4 rounded-xl border border-neutral-800 scrollbar-hide">
                    <pre className="ascii-font text-[6px] leading-[4px] md:text-[8px] md:leading-[6px] text-neutral-300 whitespace-pre">
                      {resultAscii}
                    </pre>
                  </div>
                ) : (
                  <div className="text-neutral-600 flex flex-col items-center">
                    <p>No ASCII art generated yet</p>
                  </div>
                )
              )}

              {/* Loading Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-neutral-950/80 flex flex-col items-center justify-center z-10">
                  <div className="w-12 h-12 border-4 border-neutral-800 border-t-white rounded-full animate-spin mb-4" />
                  <p className="text-neutral-300 animate-pulse">
                    {activeTab === 'PENCIL' ? 'Gemini is drawing...' : 'Converting pixels to characters...'}
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Download Button */}
            <div className="mt-6">
              <button
                disabled={!(activeTab === 'PENCIL' ? resultPencil : resultAscii)}
                onClick={downloadResult}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !(activeTab === 'PENCIL' ? resultPencil : resultAscii)
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-neutral-200 text-neutral-950 hover:bg-white active:scale-[0.98]'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Result
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 text-neutral-600 text-sm">
        <p>© 2026 SM_15(SATHIYAMURTHY) CREATED BY GEMINI AI </p>
      </footer>
    </div>
  );
};

export default App;
