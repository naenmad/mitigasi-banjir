import { useState } from 'react';
import { Send, MessageCircle, Check, X, AlertTriangle } from 'lucide-react';

interface TelegramAlertProps {
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

export const TelegramAlert = ({ riskLevel, isConnected }: TelegramAlertProps) => {
    const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
    const [chatId, setChatId] = useState('');
    const [isEnabled, setIsEnabled] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const sendTestAlert = async () => {
        if (!chatId.trim()) {
            alert('❌ Please enter your Telegram Chat ID first');
            return;
        }

        // Validate Chat ID format (should be numeric for personal chats)
        const cleanChatId = chatId.trim();
        if (!/^-?\d+$/.test(cleanChatId)) {
            alert('❌ Invalid Chat ID format. Chat ID should be numbers only (e.g., 123456789)');
            return;
        } setIsSending(true);

        try {
            console.log('🚀 Sending test alert to chat ID:', cleanChatId);

            const response = await fetch('/api/send-telegram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId: cleanChatId,
                    message: '🧪 *Test Alert*\n\n✅ Flood Mitigation System is working properly!\n\n🕒 Time: ' + new Date().toLocaleString(),
                    type: 'test'
                }),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            let result;
            try {
                const text = await response.text();
                console.log('📄 Raw response:', text);
                result = JSON.parse(text);
                console.log('📄 Parsed response:', result);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError);
                console.error('Response was not valid JSON');
                throw new Error('Server returned invalid response format');
            }

            if (response.ok && result.success) {
                console.log('✅ Message sent successfully!');
                const newAlert: AlertHistory = {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleString(),
                    level: 'TEST',
                    message: 'Test alert sent successfully',
                    status: 'sent'
                };
                setAlertHistory(prev => [newAlert, ...prev.slice(0, 4)]);
                alert('✅ Test alert sent successfully!');
            } else {
                // Handle specific Telegram errors
                let errorMessage = result?.error || result?.details || 'Unknown error';

                console.log('❌ API Error:', errorMessage);

                if (errorMessage.includes('chat not found')) {
                    errorMessage = 'Chat not found! Please:\n' +
                        '1. Start a chat with your bot first\n' +
                        '2. Send any message to your bot\n' +
                        '3. Then try the test again\n\n' +
                        'Bot Link: https://t.me/YOUR_BOT_USERNAME';
                } else if (errorMessage.includes('bot was blocked')) {
                    errorMessage = 'Bot was blocked by user. Please:\n' +
                        '1. Unblock the bot in Telegram\n' +
                        '2. Send /start to the bot\n' +
                        '3. Try the test again';
                } else if (errorMessage.includes('Unauthorized')) {
                    errorMessage = 'Bot token is invalid or missing. Please check your .env.local file.';
                }

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error sending test alert:', error);
            const newAlert: AlertHistory = {
                id: Date.now().toString(),
                timestamp: new Date().toLocaleString(),
                level: 'TEST',
                message: 'Failed to send test alert',
                status: 'failed'
            };
            setAlertHistory(prev => [newAlert, ...prev.slice(0, 4)]);

            // Show detailed error message
            const errorMsg = (error as Error).message;
            if (errorMsg.includes('\n')) {
                // Multi-line error, use alert
                alert('❌ ' + errorMsg);
            } else {
                alert('❌ Failed to send test alert: ' + errorMsg);
            }
        } finally {
            setIsSending(false);
        }
    };

    const getRiskLevelColor = (level: string) => {
        switch (level.toUpperCase()) {
            case 'CRITICAL': return 'text-red-600 bg-red-50';
            case 'HIGH': return 'text-orange-600 bg-orange-50';
            case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
            case 'TEST': return 'text-blue-600 bg-blue-50';
            default: return 'text-green-600 bg-green-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent': return <Check className="w-4 h-4 text-green-500" />;
            case 'failed': return <X className="w-4 h-4 text-red-500" />;
            case 'pending': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
            default: return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800">Telegram Alerts</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telegram Chat ID
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={chatId}
                            onChange={(e) => setChatId(e.target.value)}
                            placeholder="Enter your Chat ID (e.g., 123456789)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={sendTestAlert}
                            disabled={isSending || !chatId.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {isSending ? 'Sending...' : 'Test'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Get your Chat ID by messaging @userinfobot on Telegram
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="telegram-enabled"
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="telegram-enabled" className="text-sm text-gray-700">
                        Enable Telegram notifications
                    </label>
                </div>
            </div>

            {/* Current Risk Level */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Risk Level</h4>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium ${getRiskLevelColor(riskLevel)}`}>
                    {riskLevel === 'CRITICAL' && <AlertTriangle className="w-4 h-4" />}
                    {riskLevel}
                </div>
            </div>

            {/* Alert History */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Alerts</h4>
                {alertHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No alerts sent yet</p>
                        <p className="text-xs">Test the system to see alerts here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {alertHistory.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(alert.level)}`}>
                                            {alert.level}
                                        </span>
                                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{alert.message}</p>
                                </div>
                                <div className="ml-2">
                                    {getStatusIcon(alert.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Setup Instructions */}
            <div className="mt-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">📱 How to Setup Telegram Bot:</h5>
                    <ol className="text-xs text-blue-700 space-y-1">
                        <li>1. Message @BotFather on Telegram</li>
                        <li>2. Send /newbot and follow instructions</li>
                        <li>3. Copy your Bot Token to .env.local</li>
                        <li>4. <strong>IMPORTANT:</strong> Start a chat with your bot first!</li>
                        <li>5. Send any message to your bot (e.g., "hello")</li>
                        <li>6. Message @userinfobot to get your Chat ID</li>
                        <li>7. Enter Chat ID above and test</li>
                    </ol>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                    <h5 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Troubleshooting "Chat Not Found":</h5>
                    <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• <strong>Most common cause:</strong> You haven't messaged your bot yet</li>
                        <li>• Go to Telegram and search for your bot username</li>
                        <li>• Click "START" or send any message to your bot</li>
                        <li>• Bot must receive at least one message from you first</li>
                        <li>• Then try the test again</li>
                    </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="text-sm font-medium text-green-800 mb-2">✅ How to Get Chat ID:</h5>
                    <ol className="text-xs text-green-700 space-y-1">
                        <li>1. Open Telegram and search @userinfobot</li>
                        <li>2. Start the bot and send any message</li>
                        <li>3. The bot will reply with your Chat ID (numbers only)</li>
                        <li>4. Copy the ID and paste it above</li>
                        <li>5. Chat ID looks like: 123456789 or -123456789</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};
