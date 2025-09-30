import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface RequestItem {
    id: number;
    requestId: number | null;
    status: 'pending' | 'completed';
    result: string | null;
    timestamp: number;
}

export default function WebworkerRequests() {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:4000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('requestResult', (data: { requestId: number; result: string }) => {
            console.log('Received result:', data);
            setRequests(prev => prev.map(req =>
                req.requestId === data.requestId
                    ? { ...req, status: 'completed', result: data.result }
                    : req
            ));
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const sendRequest = async (index: number) => {
        const requestData = {
            message: `Request ${index + 1}`,
            timestamp: Date.now(),
            data: `Sample data for request ${index + 1}`
        };

        try {
            const response = await fetch('http://localhost:4000/api/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();

            setRequests(prev => prev.map(req =>
                req.id === index
                    ? { ...req, requestId: result.requestId, status: 'pending' }
                    : req
            ));
        } catch (error) {
            console.error('Error sending request:', error);
        }
    };

    const sendAllRequests = () => {
        // Initialize 20 request items
        const initialRequests: RequestItem[] = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            requestId: null,
            status: 'pending',
            result: null,
            timestamp: Date.now()
        }));

        setRequests(initialRequests);

        // Send all requests with small delays
        initialRequests.forEach((_, index) => {
            setTimeout(() => {
                sendRequest(index);
            }, index * 100); // 100ms delay between requests
        });
    };

    const resetRequests = () => {
        setRequests([]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Webworker Requests Demo</h3>
                <p className="text-sm text-gray-600 mb-4">
                    This demonstrates processing requests in a webworker with websocket communication.
                    Each request is queued and processed with a 2-second timeout.
                </p>

                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                            WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={sendAllRequests}
                            disabled={requests.length > 0}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${requests.length > 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            Send 20 Requests
                        </button>

                        <button
                            onClick={resetRequests}
                            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Request #{request.id + 1}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                                {request.status}
                            </span>
                        </div>

                        {request.requestId && (
                            <div className="text-xs text-gray-600 mb-2">
                                ID: {request.requestId.toString().slice(-8)}
                            </div>
                        )}

                        {request.result && (
                            <div className="text-xs text-gray-800 bg-white p-2 rounded border">
                                <div className="font-medium mb-1">Result:</div>
                                <div className="break-words">{request.result}</div>
                            </div>
                        )}

                        {request.status === 'pending' && !request.result && (
                            <div className="text-xs text-gray-500 italic">
                                Processing...
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No requests sent yet. Click "Send 20 Requests" to start the demo.</p>
                </div>
            )}
        </div>
    );
}
