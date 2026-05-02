/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  History,
  Activity,
  AlertCircle,
  CheckCircle2,
  Lock,
  Ghost,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';

interface SimulationResult {
  id: string;
  timestamp: number;
  multipliers: number[];
  recommendation: {
    status: 'success' | 'warning' | 'error' | 'info';
    text: string;
    value: string;
  };
}

export default function App() {
  const [multiplierInput, setMultiplierInput] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const isInputValid = parseFloat(multiplierInput) > 3.99 && parseFloat(multiplierInput) < 10;

  const generateCrashPoint = useCallback(() => {
    const r = Math.random();
    if (r < 0.50) {
      return +(1 + Math.random()).toFixed(2);
    } else if (r < 0.80) {
      return +(2 + Math.random() * 3).toFixed(2);
    } else if (r < 0.95) {
      return +(5 + Math.random() * 5).toFixed(2);
    } else {
      return +(10 + Math.random() * 40).toFixed(2);
    }
  }, []);

  const runSimulation = () => {
    const ref = parseFloat(multiplierInput);
    if (isNaN(ref) || ref <= 3.99 || ref >= 10) {
      alert('Le multiplicateur de référence doit être strictement supérieur à 3.99 et inférieur à 10.');
      return;
    }

    setIsSimulating(true);
    
    // Artificial delay to simulate "analysis"
    setTimeout(() => {
      const multipliers: number[] = [];
      for (let i = 0; i < 5; i++) {
        multipliers.push(generateCrashPoint());
      }

      const greenMultipliers = [...multipliers].filter(m => m > 2).sort((a, b) => b - a);
      let rec: SimulationResult['recommendation'];

      if (greenMultipliers.length === 0) {
        rec = { status: 'info', text: 'Attente recommandée', value: 'Aucun signal' };
      } else if (greenMultipliers.length >= 4) {
        // Cas 4 (4 values or more)
        rec = { status: 'error', text: 'Paris risqué', value: 'DANGER' };
      } else {
        let target: number;
        if (greenMultipliers.length === 1) {
          const val = greenMultipliers[0];
          if (val < 5) {
            target = Math.floor(val) - 1;
          } else if (val < 10) {
            target = 3.00;
          } else {
            target = 5.00;
          }
        } else if (greenMultipliers.length === 2) {
          const maxVal = greenMultipliers[0];
          const minVal = greenMultipliers[1];
          target = maxVal < 10 ? Math.floor(minVal) : 5;
        } else {
          // greenMultipliers.length === 3
          const secondLargest = greenMultipliers[1];
          target = Math.floor(secondLargest) - 1;
        }

        // Application des règles de filtrage finales
        if (target > 5) {
          target = 5;
        }

        if (target === 4) {
          rec = { status: 'success', text: 'Signal Cible', value: '3.00x' };
        } else if (target <= 2) {
          rec = { status: 'warning', text: 'Analyse terminée', value: 'SIGNAL NON TROUVÉ' };
        } else {
          rec = { status: 'success', text: 'Signal Cible', value: `${target.toFixed(2)}x` };
        }
      }

      const newResult: SimulationResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        multipliers,
        recommendation: rec,
      };

      setCurrentResult(newResult);
      setMultiplierInput('');
      setShowValues(false);
      setIsSimulating(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isInputValid && !isSimulating) {
      runSimulation();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-6xl mx-auto selection:bg-aviator-red selection:text-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-aviator-red rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(226,29,44,0.4)]">
            <Zap className="text-white fill-current w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight leading-none">AVIATOR</h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">ANALYSEUR D'IMPULSIONS v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 bg-aviator-green/10 hover:bg-aviator-green/20 text-aviator-green px-4 py-2 rounded-xl border border-aviator-green/20 transition-all group"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold font-mono tracking-tight">INSTALLER l'APP</span>
            </button>
          )}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">Statut Système</span>
            <span className="text-xs font-medium text-aviator-green flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-aviator-green animate-pulse" />
              OPÉRATIONNEL
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-8">
        {/* TOP: Résultats d'Analyses */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {currentResult ? (
              <motion.div 
                key={currentResult.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-aviator-panel p-4 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Activity className="w-24 h-24 text-aviator-red opacity-[0.03] absolute -top-8 -right-8" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6 sm:mb-8">
                    <div>
                      <span className="text-[10px] font-mono text-aviator-red uppercase tracking-widest">Résultats d'Analyses</span>
                      <h3 className="text-xl sm:text-2xl font-display font-bold mt-1">DONNÉES DE SIMULATION</h3>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <button 
                        onClick={() => setShowValues(!showValues)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        title={showValues ? "Cacher les valeurs" : "Afficher les valeurs"}
                      >
                        {showValues ? <EyeOff className="w-4 h-4 text-gray-400 group-hover:text-white" /> : <Eye className="w-4 h-4 text-aviator-green" />}
                      </button>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-gray-500 uppercase">Horodatage</span>
                        <p className="text-[10px] sm:text-xs font-mono mt-1">{new Date(currentResult.timestamp).toLocaleTimeString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showValues && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: '2rem' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                          {currentResult.multipliers.map((m, i) => (
                            <motion.div 
                              key={i}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={`aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border transition-all duration-500 bg-aviator-dark/50 border-white/5 ${
                                m > 2 ? 'bg-aviator-green/10 border-aviator-green/20' : 'bg-aviator-dark border-white/5'
                              }`}
                            >
                              <span className="text-[9px] sm:text-[10px] font-mono text-gray-500 mb-0.5 sm:mb-1">#{i + 1}</span>
                              <span className={`text-xs sm:text-sm font-bold font-mono ${m > 2 ? 'text-aviator-green' : 'text-gray-300'}`}>
                                {m.toFixed(2)}x
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Recommendation Card */}
                  <motion.div 
                    layout
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className={`rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-500 ${
                      !showValues ? 'p-10 sm:p-16 min-h-[250px]' : 'p-6'
                    } ${
                      currentResult.recommendation.status === 'success' ? 'bg-aviator-green/10 border border-aviator-green/20 shadow-[0_0_40px_rgba(34,197,94,0.05)]' :
                      currentResult.recommendation.status === 'error' ? 'bg-aviator-red/10 border border-aviator-red/20 shadow-[0_0_40px_rgba(226,29,44,0.05)]' :
                      'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-6">
                      <motion.div 
                        animate={!showValues ? { 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        } : {}}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className={`p-4 rounded-full ${
                          currentResult.recommendation.status === 'success' ? 'bg-aviator-green/20 text-aviator-green' :
                          currentResult.recommendation.status === 'error' ? 'bg-aviator-red/20 text-aviator-red' :
                          'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {currentResult.recommendation.status === 'success' ? <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" /> :
                         currentResult.recommendation.status === 'error' ? <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" /> :
                         <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />}
                      </motion.div>
                      
                      <div className="space-y-2">
                        <p className={`font-mono text-gray-400 uppercase tracking-widest ${!showValues ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'}`}>
                          {currentResult.recommendation.text}
                        </p>
                        <motion.p 
                          animate={{ 
                            scale: [1, 1.05, 1],
                            textShadow: [
                              "0 0 0px rgba(255,255,255,0)",
                              currentResult.recommendation.status === 'success' ? "0 0 20px rgba(34,197,94,0.5)" : "0 0 20px rgba(226,29,44,0.5)",
                              "0 0 0px rgba(255,255,255,0)"
                            ]
                          }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className={`font-display font-black leading-none ${
                            !showValues ? 'text-5xl sm:text-7xl' : 'text-2xl sm:text-3xl'
                          } ${
                            currentResult.recommendation.status === 'success' ? 'text-aviator-green' :
                            currentResult.recommendation.status === 'error' ? 'text-aviator-red' :
                            'text-white'
                          }`}
                        >
                          {currentResult.recommendation.value}
                        </motion.p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="min-h-[300px] sm:min-h-[350px] bg-aviator-panel/20 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600">
                <div className="relative mb-6">
                  <Ghost className="w-12 h-12 sm:w-16 sm:h-16 opacity-10" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-aviator-red rounded-full blur-2xl opacity-20"
                  />
                </div>
                <p className="text-xs sm:text-sm font-display tracking-widest uppercase italic">En attente de signal</p>
                <p className="text-[9px] sm:text-[10px] font-mono mt-2">Initialisez l'analyse pour visualiser les données</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM: Paramètres d'Entrée */}
        <div className="w-full">
          <section className="bg-aviator-panel p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 scanline opacity-20" />
            
            <div className="relative z-10">
              <div className="mb-8">
                <span className="text-[10px] font-mono text-aviator-red uppercase tracking-widest">Configuration Système</span>
                <h2 className="text-xl sm:text-2xl font-display font-bold mt-1 uppercase">Paramètres d'Entrée</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-3 ml-1">
                    <label className="block text-xs text-gray-500 uppercase tracking-wider font-mono">Multiplicateur de Référence</label>
                    <span className="text-[10px] font-mono text-aviator-red/60 italic">3.99 &lt; x &lt; 10</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="0.01" 
                      min="4"
                      max="9.99"
                      value={multiplierInput}
                      onChange={(e) => setMultiplierInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className={`w-full bg-aviator-dark border rounded-2xl px-6 py-4 font-mono text-xl focus:outline-none transition-all ${
                        isInputValid ? 'border-white/10 focus:border-aviator-red shadow-[0_0_20px_rgba(255,255,255,0.02)]' : 'border-aviator-red focus:border-red-500 text-red-400'
                      }`}
                      placeholder="4.00"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-mono text-base font-bold">x</div>
                  </div>
                  {!isInputValid && multiplierInput !== '' && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[11px] text-red-500 font-mono mt-3 ml-1"
                    >
                      * La valeur doit être comprise entre 4.00 et 9.99
                    </motion.p>
                  )}
                </div>

                <button 
                  onClick={runSimulation}
                  disabled={isSimulating || !isInputValid}
                  className="w-full bg-aviator-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden relative group"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="uppercase tracking-widest font-display italic text-lg">Analyse...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" />
                      <span className="uppercase tracking-widest font-display italic text-lg">Générer Signal</span>
                    </>
                  )}
                  {isSimulating && (
                    <motion.div 
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
          <Lock className="w-3 h-3 text-gray-500" />
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Analyse Sécurisée Chiffrée</span>
        </div>
        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em]">
          Conçu par <span className="text-gray-400">Evariste GNONSKAN</span> &bull; 2026
        </p>
      </footer>
    </div>
  );
}
