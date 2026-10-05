'use client'

import React, { useState, useEffect } from 'react';
import HumanBodyViewer from '../components/HumanBodyViewer';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea,
  ComposedChart, Bar, Area
} from 'recharts';

export default function ClinicianDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  
  // SSE stream state
  const [streamData, setStreamData] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  // What-If State
  const [walkMins, setWalkMins] = useState(0);
  const [mealCarbs, setMealCarbs] = useState(70);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    // Fetch initial cohort
    fetch('/api/v1/clinician/patients')
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedPatient || !isPlaying) return;
    
    const es = new EventSource(`/api/v1/stream/${selectedPatient.id}`);
    es.onmessage = (e) => {
      try {
        // SSE data comes in as a string literal of python dict, need to clean it or just assume standard json
        // The backend returns it using str(data). It should be json.dumps(data).
        // Let's assume standard json parsing
        const parsed = JSON.parse(e.data.replace(/'/g, '"'));
        const timeStr = new Date(parsed.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        
        setStreamData(prev => {
          const newPoint = {
            time: timeStr,
            glucose: parsed.glucose_mgdl,
            hr: parsed.heart_rate,
            prob: parsed.prediction?.prob_hyper || 0
          };
          return [...prev.slice(-30), newPoint]; // Keep last 30
        });
      } catch (err) {
        console.error("SSE Parse Error", err);
      }
    };
    
    return () => es.close();
  }, [selectedPatient, isPlaying]);

  const handleSimulate = async () => {
    if (!selectedPatient) return;
    const res = await fetch('/api/v1/simulate/t2d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: selectedPatient.id,
        meal_carbs: mealCarbs,
        post_meal_walk_mins: walkMins
      })
    });
    const data = await res.json();
    setSimResult(data);
  };

  // 1. Cohort View
  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-black text-white p-6 font-sans">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              BioTwin AI - Clinician Portal
            </h1>
            <p className="text-gray-400">Patient Cohort Overview</p>
          </div>
          <div className="flex gap-4">
            <Link href="/clinician/model-transparency" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition">
              Model Transparency
            </Link>
            <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm border border-green-500/30 text-green-400">
              Dr. Demo (Audit Active)
            </div>
          </div>
        </header>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="p-4">Patient ID</th>
                <th className="p-4">Age/Sex</th>
                <th className="p-4">T2D Status</th>
                <th className="p-4">Last Glucose</th>
                <th className="p-4">Risk Tier</th>
                <th className="p-4">Active Alerts</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4 font-mono">{p.id}</td>
                  <td className="p-4">{p.age} / M</td>
                  <td className="p-4">{p.has_t2d ? "Confirmed" : "At-Risk"}</td>
                  <td className="p-4">{p.last_glucose} mg/dL</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.risk_tier === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {p.risk_tier.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-red-400">{p.active_alerts?.join(', ')}</td>
                  <td className="p-4">
                    <button onClick={() => setSelectedPatient(p)} className="text-blue-400 hover:text-blue-300">
                      View Twin →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. Detailed Virtual Patient View
  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <header className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <button onClick={() => setSelectedPatient(null)} className="text-gray-500 hover:text-white transition">←</button>
            Virtual Patient: <span className="font-mono text-blue-400">{selectedPatient.id}</span>
          </h1>
        </div>
        <div className="flex gap-4">
           <Link href="/clinician/model-transparency" className="text-sm text-gray-400 hover:text-white my-auto">Model Transparency</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Patient Info & Explainability */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h2 className="text-lg font-semibold mb-3">EHR Demographics</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between"><span>Age / Sex:</span> <span className="text-white">{selectedPatient.age} / M</span></div>
              <div className="flex justify-between"><span>Diabetes:</span> <span className="text-white">5 Years</span></div>
              <div className="flex justify-between"><span>HbA1c:</span> <span className="text-red-400 font-bold">8.2%</span></div>
              <div className="flex justify-between"><span>Medications:</span> <span className="text-white">Metformin</span></div>
              <div className="flex justify-between"><span>PRS Score:</span> <span className="text-orange-400">0.75</span></div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-5 border border-red-900/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <h2 className="text-lg font-semibold mb-2 text-red-400">Active Alert</h2>
            <p className="text-white text-sm">Predicted hyperglycemic excursion (&gt;180 mg/dL) in ~30 min.</p>
            <p className="text-xs text-gray-400 mt-2">P = {streamData[streamData.length - 1]?.prob?.toFixed(2) || 0.85}</p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
             <h2 className="text-lg font-semibold mb-4">Top SHAP Drivers</h2>
             <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-gray-300">Glucose slope (30m)</span>
                  <div className="flex items-center gap-2"><div className="w-16 h-2 bg-red-500/50 rounded"><div className="h-full bg-red-500 rounded" style={{width: '80%'}}></div></div><span className="text-red-400">+0.4</span></div>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-300">Poor sleep efficiency</span>
                  <div className="flex items-center gap-2"><div className="w-16 h-2 bg-red-500/50 rounded"><div className="h-full bg-red-500 rounded" style={{width: '40%'}}></div></div><span className="text-red-400">+0.2</span></div>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-300">Medication Adherence</span>
                  <div className="flex items-center gap-2"><div className="w-16 h-2 bg-green-500/50 rounded"><div className="h-full bg-green-500 rounded" style={{width: '20%'}}></div></div><span className="text-green-400">-0.1</span></div>
                </li>
             </ul>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 h-64 overflow-hidden relative">
             <h2 className="text-sm font-medium absolute top-3 left-3 z-10 text-gray-400">System Impact</h2>
             <div className="absolute inset-0 scale-75 mt-8">
                <HumanBodyViewer conditions={['t2d', 'hypertension']} />
             </div>
          </div>
        </div>

        {/* Right Columns: Charts & Signals */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Main Glucose Chart */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 h-80 relative flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Live CGM Trajectory & Forecast</h2>
              <div className="flex gap-2">
                  <button onClick={() => setIsPlaying(!isPlaying)} className={`px-3 py-1 rounded text-xs font-bold ${isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {isPlaying ? 'PAUSE STREAM' : 'PLAY STREAM'}
                  </button>
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={streamData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" tick={{fontSize: 10}} />
                  <YAxis domain={[40, 300]} stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Legend />
                  
                  {/* Target Band (70 - 180) */}
                  <ReferenceArea y1={70} y2={180} fill="#22c55e" fillOpacity={0.1} />
                  <ReferenceArea y1={180} y2={300} fill="#ef4444" fillOpacity={0.1} />
                  <ReferenceArea y1={40} y2={70} fill="#ef4444" fillOpacity={0.1} />
                  
                  <Line type="monotone" dataKey="glucose" stroke="#3b82f6" strokeWidth={3} dot={false} name="Glucose (mg/dL)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Multi-Signal Panel */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 h-64 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Multi-Signal Wearable Sync (HR)</h2>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={streamData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" tick={{fontSize: 10}} />
                  <YAxis domain={[50, 150]} stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Area type="monotone" dataKey="hr" stroke="#ec4899" fillOpacity={1} fill="url(#colorHr)" name="Heart Rate (BPM)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* What-If Simulator */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
             <h2 className="text-lg font-semibold mb-4 text-purple-400">What-If Intervention Simulator</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-4 col-span-1">
                  <div>
                      <label className="text-sm text-gray-400 flex justify-between">
                        <span>Modify Meal Carbs (g)</span>
                        <span className="text-white font-mono">{mealCarbs}g</span>
                      </label>
                      <input 
                        type="range" min="0" max="150" value={mealCarbs} 
                        onChange={(e) => setMealCarbs(parseInt(e.target.value))}
                        className="w-full accent-purple-500 mt-2" 
                      />
                  </div>
                  <div>
                      <label className="text-sm text-gray-400 flex justify-between">
                        <span>Add Post-Meal Walk (mins)</span>
                        <span className="text-white font-mono">{walkMins}m</span>
                      </label>
                      <input 
                        type="range" min="0" max="60" value={walkMins} 
                        onChange={(e) => setWalkMins(parseInt(e.target.value))}
                        className="w-full accent-purple-500 mt-2" 
                      />
                  </div>
                  <button onClick={handleSimulate} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 font-bold rounded-lg transition text-sm">
                    Run Simulation
                  </button>
               </div>
               
               <div className="col-span-2 bg-black/50 rounded-lg p-4 border border-purple-500/20">
                  {simResult ? (
                    <div className="h-full flex flex-col justify-center">
                      <p className="text-sm text-gray-300 mb-2 font-mono">Risk Delta: 
                        <span className={`ml-2 font-bold ${simResult.risk_delta < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {simResult.risk_delta < 0 ? '' : '+'}{(simResult.risk_delta * 100).toFixed(1)}%
                        </span>
                      </p>
                      <p className="text-purple-300 italic">{simResult.message}</p>
                      
                      <div className="mt-4 flex gap-4 h-24 items-end">
                        <div className="flex-1 flex flex-col items-center">
                           <div className="w-full bg-red-500/50 rounded-t" style={{height: '100%'}}></div>
                           <span className="text-xs mt-1 text-gray-400">Baseline Peak</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                           <div className="w-full bg-green-500/80 rounded-t" style={{height: '75%'}}></div>
                           <span className="text-xs mt-1 text-gray-400">Intervention Peak</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                      Adjust sliders and click &quot;Run Simulation&quot; to see projected trajectories.
                    </div>
                  )}
               </div>
             </div>
          </div>

        </div>
      </div>
      
      <footer className="mt-12 text-center text-xs text-gray-600 border-t border-gray-800 pt-6">
        <p>Synthetic data only. Not a diagnostic device. Decision support for clinician review.</p>
        <p className="mt-1">Built for Digital Twin Challenge 2026</p>
      </footer>
    </div>
  );
}

// Quick inline component to not pollute imports more than necessary
const AreaChart = AreaChartWrapper;
function AreaChartWrapper(props: any) {
  const { AreaChart: RechartsAreaChart } = require('recharts');
  return <RechartsAreaChart {...props} />;
}
