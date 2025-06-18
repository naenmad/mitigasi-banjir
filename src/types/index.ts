export interface SensorData {
    timestamp: string;
    waterLevel: number; // cm
    flowRate: number; // L/min
    rainfall: number; // mm/hour
    floodRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface WeatherData {
    rainfall: number;
    humidity: number;
    temperature: number;
}

export interface FloodPrediction {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probability: number;
    timeToFlood?: number; // minutes
    recommendation: string;
}
