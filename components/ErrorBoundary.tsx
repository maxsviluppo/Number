import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-black font-['Orbitron'] text-[#FF8800] mb-4">OPS! QUALCOSA È ANDATO STORTO</h2>
          <p className="text-slate-400 mb-8 max-w-md">Si è verificato un errore di caricamento. Prova a ricaricare la pagina o torna alla home.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-[#FF8800] text-black px-8 py-3 rounded-full font-black text-sm"
          >
            TORNA ALLA HOME
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
