import { useState } from 'react';

export default function StreamingResponse() {
    const [streamedText, setStreamedText] = useState('');
    const [fullText, setFullText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const startStreaming = async () => {
        setIsStreaming(true);
        setIsComplete(false);
        setStreamedText('');
        setFullText('');

        try {
            const response = await fetch('http://localhost:4000/api/stream');
            const reader = response.body?.getReader();

            if (!reader) {
                throw new Error('No reader available');
            }

            const decoder = new TextDecoder();
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    setIsStreaming(false);
                    setIsComplete(true);
                    setFullText(fullResponse);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;

                // Display one character at a time
                for (let i = 0; i < chunk.length; i++) {
                    setStreamedText(prev => prev + chunk[i]);
                    await new Promise(resolve => setTimeout(resolve, 10)); // Small delay for visual effect
                }
            }
        } catch (error) {
            console.error('Error streaming response:', error);
            setIsStreaming(false);
        }
    };

    const resetStream = () => {
        setStreamedText('');
        setFullText('');
        setIsStreaming(false);
        setIsComplete(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Streaming Response Demo</h3>
                <p className="text-sm text-gray-600 mb-4">
                    This demonstrates reading an HTTP response as a stream and displaying it character by character.
                </p>

                <div className="flex space-x-2 mb-4">
                    <button
                        onClick={startStreaming}
                        disabled={isStreaming}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${isStreaming
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isStreaming ? 'Streaming...' : 'Start Stream'}
                    </button>

                    <button
                        onClick={resetStream}
                        disabled={isStreaming}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${isStreaming
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                            }`}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Status:
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${isStreaming
                            ? 'bg-yellow-100 text-yellow-800'
                            : isComplete
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {isStreaming ? 'Streaming' : isComplete ? 'Complete' : 'Ready'}
                        </span>
                    </span>
                </div>

                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Streamed Text:</h4>
                    <div className="bg-white border border-gray-300 rounded p-3 h-32 overflow-y-auto font-mono text-sm">
                        {streamedText || <span className="text-gray-400">No text streamed yet...</span>}
                        {isStreaming && <span className="animate-pulse">|</span>}
                    </div>
                </div>

                {isComplete && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Complete Response:</h4>
                        <div className="bg-white border border-gray-300 rounded p-3 h-32 overflow-y-auto font-mono text-sm">
                            {fullText}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
