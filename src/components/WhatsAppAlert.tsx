import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';

interface WhatsAppAlertProps {
    riskLevel: string;
    isConnected: boolean;
}

interface AlertHistory {
    id: string;
    timestamp: string;
    level: string;
    message: string;
    status: 'sent' | 'failed' | 'pending';
}

export const WhatsAppAlert = ({ riskLevel, isConnected }: WhatsAppAlertProps) => {
    const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
    const [phoneNumber, setPhoneNumber] = useState('+6285174376900');
    const [isEnabled, setIsEnabled] = useState(true);

    const sendTestAlert = async () => {
        try {
            const response = await fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: phoneNumber,
                    message: '🧪 Test Alert: Flood Mitigation System is working properly!',
                    type: 'test'
                }),
            });

            if (response.ok) {
                const newAlert: AlertHistory = {
                    id: Date.now().toString(),
                    timestamp: new Date().toISOString(),
                    level: 'TEST',
                    message: 'Test alert sent successfully',
                    status: 'sent'
                };
                setAlertHistory(prev => [newAlert, ...prev.slice(0, 4)]);
            } else {
                throw new Error('Failed to send test alert');
            }
        } catch (error) {
            console.error('Error sending test alert:', error);
            const newAlert: AlertHistory = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                level: 'TEST',
                message: 'Failed to send test alert',
                status: 'failed'
            };
            setAlertHistory(prev => [newAlert, ...prev.slice(0, 4)]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'text-green-600';
            case 'failed': return 'text-red-600';
            case 'pending': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent': return '✅';
            case 'failed': return '❌';
            case 'pending': return '⏳';
            default: return '❓';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <MessageCircle className="mr-2 text-green-600" size={24} />
                    WhatsApp Alerts
                </h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Enabled:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => setIsEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (WhatsApp)
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            <Phone size={16} />
                        </span>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+628123456789"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Format: +62 untuk Indonesia, +1 untuk US, dll.
                    </p>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={sendTestAlert}
                        disabled={!isConnected || !isEnabled}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
                    >
                        Send Test Alert
                    </button>
                </div>
            </div>

            {/* Current Alert Status */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">System:</span>
                        <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                            {isConnected ? 'Connected' : 'Offline'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">Alerts:</span>
                        <p className={`font-medium ${isEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">Risk Level:</span>
                        <p className={`font-medium ${riskLevel === 'CRITICAL' ? 'text-red-600' :
                            riskLevel === 'HIGH' ? 'text-orange-600' :
                                riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {riskLevel || 'Unknown'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium text-gray-900">{phoneNumber}</p>
                    </div>
                </div>
            </div>

            {/* Alert History */}
            <div>
                <h3 className="font-medium text-gray-900 mb-3">Recent Alerts</h3>
                {alertHistory.length > 0 ? (
                    <div className="space-y-2">
                        {alertHistory.map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="text-lg">{getStatusIcon(alert.status)}</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {alert.level} Alert
                                        </p>
                                        <p className="text-xs text-gray-600">{alert.message}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-medium ${getStatusColor(alert.status)}`}>
                                        {alert.status.toUpperCase()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No alerts sent yet</p>
                        <p className="text-sm">Test the system to see alerts here</p>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ How it Works</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Alerts are sent automatically when risk level is HIGH or CRITICAL</li>
                    <li>• Cooldown period: 10 minutes between alerts</li>
                    <li>• Messages include current sensor data and recommendations</li>
                    <li>• Uses Twilio WhatsApp API for reliable delivery</li>
                </ul>
            </div>
        </div>
    );
};
