import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

const demoData = [
  '[1 hour] Weekly team sync meeting',
  '[30 mins] Code review',
  '[45 mins] Customer support call',
  '[2 hours] UI design workshop',
  '[1.5 hrs] Marketing campaign planning',
  '[30 mins] Infrastructure maintenance',
  '[1 hour] Learning React hooks',
  '[45 mins] Email follow-ups'
].join('\n');

const TimeAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [timeData, setTimeData] = useState([]);
  const [error, setError] = useState('');

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
    '#82ca9d', '#ffc658', '#ff7c43', '#665191', '#a05195', 
    '#2f4b7c', '#f95d6a'
  ];

  const parseTimeEntry = (line) => {
    const timeRegex = /\[(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)\]/i;
    const match = line.match(timeRegex);
    
    if (!match) return null;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    if (isNaN(value)) return null;
    
    let minutes;
    if (unit.startsWith('h')) {
      minutes = value * 60;
    } else {
      minutes = value;
    }
    
    return {
      time: minutes,
      text: line.replace(match[0], '').trim(),
      originalValue: value,
      originalUnit: unit
    };
  };

  const categorizeEntry = (text) => {
    text = text.toLowerCase();
    
    const categories = {
      'Meetings & Calls': [
        'call', 'sync', 'meeting', 'standup', 'catch-up', 'catchup', 'interview',
        'workshop', 'session', '1:1', 'one-on-one', 'conference', 'webinar'
      ],
      'Research & Documentation': [
        'research', 'documentation', 'write', 'draft', 'review', 'read',
        'analyze', 'analysis', 'report', 'document', 'study', 'explore',
        'investigation', 'learn', 'notes', 'writing', 'wiki'
      ],
      'Development & Engineering': [
        'test', 'develop', 'code', 'debug', 'programming', 'deployment',
        'feature', 'fix', 'build', 'implementation', 'coding', 'testing',
        'qa', 'architecture', 'design system', 'technical', 'engineering'
      ],
      'Planning & Strategy': [
        'plan', 'strategy', 'prep', 'roadmap', 'goal', 'okr', 'vision',
        'initiative', 'objective', 'priority', 'planning', 'strategic',
        'forecast', 'budget', 'scope', 'requirements'
      ],
      'Communication & Coordination': [
        'message', 'response', 'coordination', 'email', 'slack', 'chat',
        'discord', 'telegram', 'announcement', 'communication', 'respond',
        'follow-up', 'followup', 'update', 'status'
      ],
      'Design & Creative': [
        'design', 'mockup', 'prototype', 'wireframe', 'ui', 'ux',
        'visual', 'graphics', 'creative', 'artwork', 'illustration',
        'sketch', 'figma', 'styling'
      ],
      'Marketing & Content': [
        'marketing', 'content', 'social media', 'blog', 'post', 'tweet',
        'campaign', 'promotion', 'seo', 'analytics', 'metrics', 'copy',
        'editorial', 'publish', 'social'
      ],
      'Project Management': [
        'project', 'management', 'tracking', 'jira', 'trello', 'asana',
        'milestone', 'deadline', 'timeline', 'schedule', 'coordination',
        'organizing', 'backlog', 'sprint'
      ],
      'Customer & Support': [
        'customer', 'support', 'client', 'user', 'feedback', 'help',
        'ticket', 'issue', 'service', 'complaint', 'resolution',
        'assistance', 'troubleshoot'
      ],
      'Administration & Ops': [
        'admin', 'operation', 'process', 'procedure', 'policy',
        'system', 'setup', 'configure', 'maintenance', 'infrastructure',
        'organize', 'filing', 'documentation'
      ],
      'Learning & Growth': [
        'training', 'learning', 'course', 'workshop', 'education',
        'skill', 'development', 'growth', 'mentor', 'coaching',
        'onboarding', 'tutorial'
      ]
    };
  
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
  
    const workTerms = {
      'team': 'Project Management',
      'review': 'Research & Documentation',
      'presentation': 'Communication & Coordination',
      'report': 'Research & Documentation',
      'discussion': 'Meetings & Calls',
      'brainstorm': 'Planning & Strategy',
      'collaboration': 'Project Management'
    };
  
    for (const [term, category] of Object.entries(workTerms)) {
      if (text.includes(term)) {
        return category;
      }
    }
  
    return 'Miscellaneous';
  };

  const processTimeData = () => {
    try {
      const lines = inputText.split('\n').filter(line => line.trim());
      
      const entries = lines
        .map(parseTimeEntry)
        .filter(entry => entry !== null);

      if (entries.length === 0) {
        setError('No valid time entries found. Make sure each task includes time in [X mins] or [X hours] format.');
        setTimeData([]);
        return;
      }

      const categorizedEntries = entries.map(entry => ({
        ...entry,
        category: categorizeEntry(entry.text)
      }));

      const groupedData = _.groupBy(categorizedEntries, 'category');
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
            placeholder="Enter your time entries (one per line)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
          <p className="font-medium mb-2">💡 Try this sample data:</p>
          <button
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={() => setInputText(demoData)}
          >
            Load Example Data
          </button>
          <p className="mt-2 font-medium">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Hours: [X hour], [X hours], [X hr], [X hrs], [X h]</li>
            <li>Minutes: [X minute], [X minutes], [X min], [X mins], [X m]</li>
            <li>Decimal hours work too: [1.5 hours], [0.5 h]</li>
          </ul>
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
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Time Distribution</h3>
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
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
                    }}
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
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeData.map((item, index) => (
                <div key={index} className="p-4 border rounded">
                  <h4 className="font-medium">{item.name}</h4>
                  <p>{item.hours} hours ({item.value}%)</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeAnalyzer;
