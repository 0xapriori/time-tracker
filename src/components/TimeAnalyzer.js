import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

const TimeAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [timeData, setTimeData] = useState([]);
  const [error, setError] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c'];

  const parseTimeEntry = (line) => {
    const timeMatch = line.match(/\[(\d+)\s*mins?\]/i);
    if (!timeMatch) return null;
    
    const minutes = parseInt(timeMatch[1], 10);
    if (isNaN(minutes)) return null;
    
    return {
      time: minutes,
      text: line.replace(timeMatch[0], '').trim()
    };
  };

  const categorizeEntry = (text) => {
    text = text.toLowerCase();
    if (text.includes('call') || text.includes('sync') || text.includes('meeting') || text.includes('standup')) {
      return 'Meetings & Calls';
    } else if (text.includes('research') || text.includes('documentation') || text.includes('write') || text.includes('draft')) {
      return 'Research & Documentation';
    } else if (text.includes('plan') || text.includes('strategy') || text.includes('prep')) {
      return 'Planning & Strategy';
    } else if (text.includes('test') || text.includes('develop') || text.includes('code')) {
      return 'Development & Testing';
    } else if (text.includes('message') || text.includes('response') || text.includes('coordination')) {
      return 'Communication & Tasks';
    }
    return 'Other';
  };

  const processTimeData = () => {
    try {
      // Split input into lines and filter out empty lines
      const lines = inputText.split('\n').filter(line => line.trim());
      
      // Parse each line for time entries
      const entries = lines
        .map(parseTimeEntry)
        .filter(entry => entry !== null);

      if (entries.length === 0) {
        setError('No valid time entries found. Make sure each task includes time in [X mins] format.');
        setTimeData([]);
        return;
      }

      // Categorize and group entries
      const categorizedEntries = entries.map(entry => ({
        ...entry,
        category: categorizeEntry(entry.text)
      }));

      const groupedData = _.groupBy(categorizedEntries, 'category');
      
      // Calculate totals and percentages
      const totalMinutes = _.sumBy(entries, 'time');
      
      const chartData = Object.entries(groupedData).map(([category, items]) => {
        const totalTime = _.sumBy(items, 'time');
        return {
          name: category,
          value: parseFloat(((totalTime / totalMinutes) * 100).toFixed(1)),
          hours: parseFloat((totalTime / 60).toFixed(1))
        };
      });

      setTimeData(chartData);
      setError('');
    } catch (err) {
      setError('Error processing time data. Please check the format.');
      setTimeData([]);
    }
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{payload[0].value}% ({payload[0].payload.hours} hours)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Time Tracker Analysis</h2>
        <div className="mb-4">
          <textarea
            className="w-full h-64 p-4 border rounded"
            placeholder="Paste your time entries here. Format: [X mins] Task description"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          onClick={processTimeData}
        >
          Generate Chart
        </button>
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      
      {timeData.length > 0 && (
        <div className="mt-8">
          <div className="h-96">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={timeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  {timeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className=
