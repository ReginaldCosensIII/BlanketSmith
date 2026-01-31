import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../services/logger';
import { Button, Icon } from '../ui/SharedComponents';

import { FeedbackModal } from '../modals/FeedbackModal';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    showFeedbackModal: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, showFeedbackModal: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, showFeedbackModal: false };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error('Uncaught exception in component tree', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleHome = () => {
        // Reset path and reload to clear application state
        window.location.href = '/';
    };

    handleReport = () => {
        this.setState({ showFeedbackModal: true });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100">
                        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            {/* using 'alert-error' for error symbol */}
                            <Icon name="alert-error" className="text-red-500 text-3xl" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-8">
                            We encountered an unexpected error. Usually reloading the page fixes this.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg mb-8 text-left overflow-auto max-h-40">
                            <code className="text-xs text-red-600 font-mono break-all">
                                {this.state.error?.message || 'Unknown Error'}
                            </code>
                        </div>

                        <div className="flex gap-3 justify-center flex-wrap">
                            <Button variant="secondary" onClick={this.handleHome}>
                                Return Home
                            </Button>
                            <Button variant="primary" onClick={this.handleReload}>
                                Reload Application
                            </Button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={this.handleReport}
                                className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                                Report this crash
                            </button>
                        </div>
                    </div>
                    {/* Render Feedback Modal if requested */}
                    <FeedbackModal
                        isOpen={this.state.showFeedbackModal}
                        onClose={() => this.setState({ showFeedbackModal: false })}
                        initialError={this.state.error}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
