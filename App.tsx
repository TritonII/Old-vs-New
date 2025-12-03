import { useState } from 'react';
import { PaperBackground } from './components/PaperBackground';
import { SketchConnect } from './components/SketchConnect';
import { Connection, FutureForecast } from './types';
import { generateFutureForecasts } from './predictionGenerator';

export default function App() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecasts, setForecasts] = useState<FutureForecast[]>([]);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (connections.length === 0) return;
    
    setLoading(true);
    
    try {
      // Use the AI (or fallback) generator
      const generatedForecasts = await generateFutureForecasts(connections);
      setForecasts(generatedForecasts);
      setSubmitted(true);
      
      console.log("=== USER SUBMISSION ===");
      console.log(JSON.stringify(generatedForecasts, null, 2));
      console.log("=======================");
    } catch (e) {
      console.error("Error generating forecasts", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset all state manually to avoid page reload issues
    setSubmitted(false);
    setConnections([]);
    setForecasts([]);
    setCopied(false);
    setLoading(false);
    window.scrollTo(0, 0);
  };

  const handleShare = async () => {
    if (forecasts.length === 0) return;

    // Pick the first forecast as a teaser
    const teaser = forecasts[0];
    const shareText = `I matched ${teaser.oldName} with ${teaser.newName} and the Oracle predicted:\n\n"${teaser.prediction}"\n\nSee what future you can create here:`;
    const shareUrl = window.location.href;
    const fullShareString = `${shareText} ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Titan Matcher Prophecy',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullShareString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <PaperBackground>
      <div className="min-h-screen flex flex-col items-center pt-8 pb-16 px-4">
        
        {/* Header Section */}
        <header className="text-center mb-8 max-w-2xl px-2">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-wide text-gray-900 drop-shadow-sm">
            Titan Match
          </h1>
          <p className="text-lg md:text-2xl text-gray-600">
            Draw lines to connect the <span className="text-blue-700 font-bold">Original Barrons</span> with the <span className="text-blue-700 font-bold">New Guard</span>.
          </p>
        </header>

        {/* Game Area */}
        <div className="w-full max-w-5xl bg-white/40 backdrop-blur-sm rounded-3xl p-4 md:p-8 border-4 border-gray-800 shadow-xl sketch-border transition-all duration-500">
          {!submitted ? (
            <SketchConnect 
              connections={connections}
              onConnectionsChange={setConnections} 
            />
          ) : (
            <div className="w-full animate-fade-in">
              <div className="text-center mb-8">
                <div className="inline-block p-4 border-4 border-purple-800 rounded-full bg-purple-100 sketch-border mb-4 animate-bounce">
                  <svg className="w-12 h-12 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">The Prophecy Is Complete</h2>
                <p className="text-lg text-gray-600 mt-2">Based on your matches, the AI has predicted the timeline:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {forecasts.map((forecast, idx) => (
                  <div 
                    key={`${forecast.oldId}-${forecast.newId}`}
                    className="bg-yellow-50 p-6 border-2 border-gray-800 shadow-lg sketch-border transform hover:rotate-1 transition-transform"
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="flex justify-between items-center mb-3 border-b-2 border-gray-300 pb-2 border-dashed">
                      <span className="font-bold text-gray-500 text-sm uppercase tracking-wider">{forecast.oldName}</span>
                      <span className="text-gray-400">×</span>
                      <span className="font-bold text-blue-600 text-sm uppercase tracking-wider">{forecast.newName}</span>
                    </div>
                    <p className="text-xl font-handwriting leading-relaxed text-gray-800">
                      "{forecast.prediction}"
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-800 text-white text-xl rounded-lg hover:bg-gray-700 transition-all transform hover:-rotate-1 sketch-border shadow-lg"
                >
                  Consult the Oracle Again
                </button>

                <button 
                  onClick={handleShare}
                  className="px-8 py-3 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-500 transition-all transform hover:rotate-1 sketch-border shadow-lg flex items-center gap-2 relative group"
                >
                  {!copied ? (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share with Friends
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  )}
                  {/* Tooltip for desktop */}
                  <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Copy results to clipboard
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!submitted && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={connections.length === 0 || loading}
              className={`
                group relative px-12 py-5 text-3xl font-bold text-white rounded-xl shadow-xl sketch-border transition-all duration-200
                ${connections.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                  : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 hover:-rotate-1'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Consulting Oracle...
                </span>
              ) : (
                "Reveal The Future"
              )}
            </button>
            
            <p className="text-gray-500 text-sm italic">
              * Connect at least one pair to generate a prediction.
            </p>
          </div>
        )}
      </div>
    </PaperBackground>
  );
}