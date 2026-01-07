import React from 'react';
import { BentoCard } from './BentoCard';


// Simple Tooltip Implementation if one doesn't exist, but I'll assume BentoCard implies some UI lib.
// If not, I'll use native title for 1st pass. Or build a small tooltip.
// Actually, I'll use a simple native title for speed, or a custom hover state.

interface Activity {
    date: string;
    tweet_count: number;
    reply_count: number;
    dm_count: number;
    met_goals?: boolean;
}

interface CalendarHeatmapProps {
    data: Activity[];
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
    // 1. Generate last 365 days dates
    const today = new Date();
    const dates = [];
    for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d);
    }

    // 2. Map data to dates
    const dataMap: {[key: string]: Activity} = {};
    data.forEach(d => {
        dataMap[d.date] = d;
    });

    // 3. Helper to get intensity
    const getIntensity = (activity?: Activity) => {
        if (!activity) return 0;
        const total = (activity.tweet_count || 0) + (activity.reply_count || 0) + (activity.dm_count || 0);
        if (total === 0) return 0;
        if (total < 5) return 1;
        if (total < 15) return 2;
        if (total < 30) return 3;
        return 4;
    };

    // 4. Group by Weeks
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Align first date to Sunday (or Monday?) - GitHub starts on Sunday usually.
    // Let's just dump all dates and let grid handle wrapping? 
    // No, standard heatmap is Week Columns x Day Rows.
    
    // Find the day of week of the first date
    const firstDate = dates[0];
    const dayOfWeek = firstDate.getDay(); // 0 = Sunday
    
    // Fill initial empty slots if strictly aligning to grid columns
    // actually, we can just map the dates. We need 7 rows, ~52 cols.
    // Grid-auto-flow: column? using CSS grid.

    return (
        <BentoCard noPadding className="p-6 overflow-x-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Activity History</h3>
            <div className="min-w-[700px]">
                <div 
                    className="grid grid-rows-7 grid-flow-col gap-1" 
                    style={{ gridTemplateColumns: `repeat(${Math.ceil(dates.length / 7)}, min-content)` }}
                >
                    {dates.map((date, i) => {
                        const dateStr = date.toLocaleDateString('en-CA');
                        const activity = dataMap[dateStr];
                        const intensity = getIntensity(activity);
                        
                        // Color scales - Green like GitHub
                        const colors = [
                            'bg-gray-100', // 0
                            'bg-green-200', // 1
                            'bg-green-400', // 2
                            'bg-green-600', // 3
                            'bg-green-800', // 4 (darkest)
                        ];

                        return (
                            <div 
                                key={dateStr}
                                className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-colors hover:ring-1 hover:ring-gray-400 cursor-pointer relative group`}
                                title={`${date.toDateString()}: ${activity ? (activity.tweet_count+activity.reply_count+activity.dm_count) : 0} actions`}
                            >
                            </div>
                        )
                    })}
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 justify-end">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-200"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                        <div className="w-3 h-3 rounded-sm bg-green-800"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </BentoCard>
    );
};
