
import React, { useState, useCallback, useRef } from 'react';
import { 
  Activity, 
  Upload, 
  History as HistoryIcon, 
  Smartphone, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { analyzeFitnessScreenshot } from './services/geminiService';
import { HistoryItem, AnalysisResult, ActivityType } from './types';

const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setAnalyzing(true);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);

      try {
        const result = await analyzeFitnessScreenshot(base64String);
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          imageUrl: base64String,
          result,
        };
        setHistory(prev => [newItem, ...prev]);
        setActiveTab('upload');
      } catch (err) {
        console.error(err);
        setError("Failed to analyze image. Please try another screenshot.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.STEPS: return 'bg-emerald-500';
      case ActivityType.RUNNING: return 'bg-blue-500';
      case ActivityType.CYCLING: return 'bg-orange-500';
      case ActivityType.SWIMMING: return 'bg-cyan-500';
      case ActivityType.STRENGTH: return 'bg-purple-500';
      case ActivityType.YOGA: return 'bg-pink-500';
      case ActivityType.WALKING: return 'bg-indigo-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col items-center py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 lg:w-full mb-0 md:mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="hidden lg:block font-bold text-xl text-slate-900">FitSnap AI</span>
        </div>

        <div className="flex-1 flex md:flex-col gap-4 ml-auto md:ml-0 md:w-full">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all lg:w-full ${activeTab === 'upload' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Upload className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Analyze</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all lg:w-full ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <HistoryIcon className="w-5 h-5" />
            <span className="hidden lg:block font-medium">History</span>
          </button>
        </div>

        <div className="hidden lg:block mt-auto p-4 bg-slate-50 rounded-2xl w-full border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Storage</p>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/3"></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{history.length} snapshots scanned</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto max-w-6xl mx-auto w-full">
        {activeTab === 'upload' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900">Upload Screenshot</h1>
              <p className="text-slate-500">Extract data from Apple Health, Strava, Garmin, or Google Fit screenshots.</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Uploader Section */}
              <div className="space-y-6">
                <div 
                  onClick={() => !analyzing && fileInputRef.current?.click()}
                  className={`relative group h-96 border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer
                    ${analyzing ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'}
                  `}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                  
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className={`h-full w-full object-contain rounded-xl ${analyzing ? 'opacity-40 grayscale' : 'opacity-100'}`} 
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">Drop your screenshot here</p>
                        <p className="text-sm text-slate-500 mt-1">PNG, JPG or JPEG up to 10MB</p>
                      </div>
                    </div>
                  )}

                  {analyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl">
                      <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-4">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <div className="text-center">
                          <p className="font-bold text-slate-900">Extracting data...</p>
                          <p className="text-xs text-slate-500">Gemini is analyzing pixels</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Analysis Error</p>
                      <p className="text-sm opacity-90">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Latest Result Card */}
              <div className="space-y-6">
                {history.length > 0 && history[0].result ? (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getActivityColor(history[0].result.activityType)}`}>
                          <Activity className="text-white w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-slate-900">Latest Extraction</h2>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Just now</span>
                    </div>

                    <div className="p-8 flex-1 space-y-8">
                      <div className="flex items-end gap-3">
                        <span className="text-6xl font-black text-slate-900 tracking-tight">
                          {history[0].result.primaryValue.toLocaleString()}
                        </span>
                        <span className="text-xl font-bold text-slate-400 mb-2 uppercase tracking-widest">
                          {history[0].result.unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Activity</p>
                          <p className="text-lg font-bold text-slate-900">{history[0].result.activityType}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">AI Confidence</p>
                          <p className="text-lg font-bold text-slate-900">{Math.round(history[0].result.confidence * 100)}%</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Additional Insights</p>
                        <div className="space-y-3">
                          {history[0].result.additionalStats.map((stat, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                              <span className="text-slate-600 font-medium">{stat.label}</span>
                              <span className="text-slate-900 font-bold">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-indigo-600 p-4 rounded-2xl text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">AI Summary</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">{history[0].result.summary}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-white rounded-3xl border border-slate-200 border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <Zap className="w-12 h-12 text-slate-300" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Ready to Scan</h3>
                      <p className="text-sm text-slate-500">Upload a screenshot to see detailed analytics and AI insights here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Scan History</h1>
                <p className="text-slate-500">Review your past fitness extractions</p>
              </div>
              <button 
                onClick={() => setActiveTab('upload')}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                <Plus className="w-5 h-5" />
                New Scan
              </button>
            </header>

            {history.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-20 flex flex-col items-center justify-center text-center space-y-4">
                <HistoryIcon className="w-16 h-16 text-slate-200" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">No scans yet</h3>
                  <p className="text-slate-500">Your analysis history will appear here once you start scanning screenshots.</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all group">
                    <div className="relative h-40 overflow-hidden">
                      <img src={item.imageUrl} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider ${getActivityColor(item.result.activityType)}`}>
                          {item.result.activityType}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-lg text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-black text-slate-900 leading-none">
                            {item.result.primaryValue.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {item.result.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-medium">{new Date(item.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed">
                        {item.result.summary}
                      </p>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified by Gemini</span>
                        </div>
                        <button 
                          onClick={() => {
                            // Simple way to "preview" is just to select it and go to upload tab
                            setSelectedImage(item.imageUrl);
                            setActiveTab('upload');
                          }}
                          className="text-indigo-600 text-xs font-bold flex items-center gap-1 group/btn"
                        >
                          Details <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
