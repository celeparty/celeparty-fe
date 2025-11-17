"use client";

import React from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Error caught by boundary:", error, errorInfo);
	}

	resetError = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback;
				return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
			}

			return (
				<div className="min-h-[400px] flex items-center justify-center" role="alert">
					<div className="text-center p-6">
						<h2 className="text-xl font-semibold text-red-600 mb-4">
							Terjadi Kesalahan
						</h2>
						<p className="text-gray-600 mb-4">
							Maaf, terjadi kesalahan tak terduga. Silakan coba lagi.
						</p>
						<button
							onClick={this.resetError}
							className="px-4 py-2 bg-c-blue text-white rounded-md hover:bg-c-blue-light focus:outline-none focus:ring-2 focus:ring-c-blue focus:ring-offset-2"
							aria-label="Coba lagi memuat halaman"
						>
							Coba Lagi
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
