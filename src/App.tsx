import { useState, useEffect, FormEvent } from 'react';
import { Copy, RefreshCw, Trash2, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ProductType = 'FRESCO' | 'DECONGELATO';

interface Range {
  min: number;
  max: number;
}

const RANGES: Record<ProductType, Range> = {
  FRESCO: { min: 65, max: 75 },
  DECONGELATO: { min: 62, max: 70 },
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [productType, setProductType] = useState<ProductType>('FRESCO');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'pirla') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const generateNumbers = () => {
    const { min, max } = RANGES[productType];
    const newNumbers: number[] = [];
    let minCount = 0;
    let maxCount = 0;

    for (let i = 0; i < 25; i++) {
      let val: number;
      let attempts = 0;
      
      while (attempts < 100) {
        val = Math.floor(Math.random() * (max - min + 1)) + min;
        
        if (val === min) {
          if (minCount < 1) {
            minCount++;
            break;
          }
        } else if (val === max) {
          if (maxCount < 1) {
            maxCount++;
            break;
          }
        } else {
          break;
        }
        attempts++;
        
        // If we keep hitting boundaries, force an inner value
        if (attempts > 50) {
          val = Math.floor(Math.random() * (max - 1 - (min + 1) + 1)) + (min + 1);
          break;
        }
      }
      newNumbers.push(val!);
    }
    
    // Shuffle to ensure boundaries aren't always at the start
    for (let i = newNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newNumbers[i], newNumbers[j]] = [newNumbers[j], newNumbers[i]];
    }

    setNumbers(newNumbers);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (numbers.length === 0) return;
    
    const textToCopy = numbers.join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const reset = () => {
    setNumbers([]);
    setCopied(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-8"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center text-white mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Accesso Riservato</h1>
            <p className="text-neutral-500 text-sm">Inserisci la password per continuare</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  loginError 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-neutral-100 bg-neutral-50 focus:border-neutral-900'
                }`}
                autoFocus
              />
              {loginError && (
                <p className="text-red-500 text-xs mt-2 ml-1 font-medium italic">Password errata, riprova.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white py-3 rounded-xl font-semibold hover:bg-neutral-800 transition-colors shadow-md active:scale-95"
            >
              Entra
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">Pesa Fette 2000</h1>
          <p className="text-neutral-500">Seleziona il prodotto e genera i valori per Excel</p>
        </header>

        <div className="space-y-8">
          {/* Product Selection */}
          <section>
            <label className="block text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wider">
              Tipo Prodotto
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['FRESCO', 'DECONGELATO'] as ProductType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setProductType(type)}
                  className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 font-bold text-lg ${
                    productType === type
                      ? 'border-emerald-700 bg-emerald-700 text-white shadow-lg'
                      : 'border-neutral-400 bg-neutral-200 text-neutral-900 hover:border-neutral-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateNumbers}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 px-6 rounded-xl font-semibold hover:bg-neutral-800 transition-colors shadow-md active:scale-95"
            >
              <RefreshCw size={20} className={numbers.length > 0 ? "" : "animate-pulse"} />
              Genera 25 Valori
            </button>
            
            <button
              onClick={copyToClipboard}
              disabled={numbers.length === 0}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-md active:scale-95 ${
                numbers.length > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Copy size={20} />
              Copia per Excel
            </button>

            <button
              onClick={reset}
              disabled={numbers.length === 0}
              className={`p-3 rounded-xl border transition-all ${
                numbers.length > 0
                  ? 'border-neutral-200 text-neutral-500 hover:bg-neutral-100'
                  : 'border-transparent text-transparent pointer-events-none'
              }`}
              title="Reset"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Results Display */}
          <AnimatePresence mode="wait">
            {numbers.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <div className="grid grid-cols-5 gap-2 md:gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  {numbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="aspect-square flex items-center justify-center bg-white border border-neutral-200 rounded-lg text-lg font-mono font-medium shadow-sm"
                    >
                      {num}
                    </div>
                  ))}
                </div>
                
                {/* Copy Confirmation Overlay */}
                <AnimatePresence>
                  {copied && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl z-10"
                    >
                      <div className="flex flex-col items-center text-emerald-600">
                        <CheckCircle2 size={48} className="mb-2" />
                        <span className="font-bold text-xl">Valori copiati!</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center border-2 border-dashed border-neutral-200 rounded-2xl"
              >
                <p className="text-neutral-400 italic">Nessun valore generato</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-12 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
          <p>Range {productType}: {RANGES[productType].min} - {RANGES[productType].max}</p>
          <p className="mt-1">I valori vengono separati da una nuova riga per l'incollo diretto in Excel.</p>
        </footer>
      </div>
    </div>
  );
}
