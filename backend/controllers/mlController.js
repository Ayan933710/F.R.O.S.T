const axios = require('axios');
const InventoryMovement = require('../models/InventoryMovement');
const Requisition = require('../models/Requisition');

const ML_URL = process.env.ML_URL || 'http://localhost:8000';

async function getPredictiveInsights(req, res) {
  try {
    const station = req.query.station || 'Himadri';
    
    // 1. Fetch latest DB state
    const movements = await InventoryMovement.find({ 
      station: new RegExp('^' + station + '$', 'i')
    }).sort({ recorded_at: 1 });
    
    const latestStocks = new Map();
    for (const m of movements) {
      latestStocks.set(m.item_id, m.stock_after);
    }
    
    const requisitions = await Requisition.find({ 
      station: new RegExp('^' + station + '$', 'i'), 
      status: 'PENDING_APPROVAL' 
    });
    
    // 2. Generate 14-day Projected Burn Rate (Mocked baseline based on inventory)
    const burnRateData = [];
    let totalStock = 0;
    for (const stock of latestStocks.values()) {
      totalStock += Number(stock) || 0;
    }
    const dailyBurn = totalStock * 0.05; // Simulate a 5% daily depletion rate for all assets
    
    for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        burnRateData.push({
            day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            stock: Math.max(0, Math.floor(totalStock - (dailyBurn * i)))
        });
    }

    // 3. Forward to Python ML Service for Viability / Whiteout probability
    // Mock weather inputs to simulate the environment
    let mlPrediction = null;
    try {
        const mlRes = await axios.get(`${ML_URL}/predict-window`, {
            params: {
                U10: 12.5,
                pressure_drop: -1.5,
                temperature: -35.0,
                humidity: 60.0,
                timestamp: new Date().toISOString(),
                station
            },
            timeout: 2000
        });
        mlPrediction = mlRes.data;
    } catch (e) {
        console.log("Python ML service unreachable or timed out", e.message);
        // Fallback response if python service is offline during test
        mlPrediction = {
            safe: false,
            probability: 0.85,
            reason: "fallback_offline",
            error: e.message
        };
    }

    // 4. Return bundled analytics
    res.json({
        station,
        inventory_count: latestStocks.size,
        pending_requisitions: requisitions.length,
        projected_burn_rate: burnRateData,
        transport_viability: mlPrediction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getPredictiveInsights };
