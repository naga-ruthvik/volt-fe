import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class FeatureErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="rounded-md border border-red-500/40 bg-red-500/5 p-4" role="alert">
          <h2 className="text-sm font-semibold text-red-400">Something went wrong within this feature.</h2>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs font-medium text-red-400 underline"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
