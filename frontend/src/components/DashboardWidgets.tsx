import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
} from "recharts";

const overviewData = [
    { name: "Jan", vCards: 1.0 },
    { name: "Feb", vCards: 0.0 },
    { name: "Mar", vCards: 0 },
    { name: "Apr", vCards: 0 },
    { name: "May", vCards: 0 },
    { name: "Jun", vCards: 0 },
    { name: "July", vCards: 0 },
    { name: "Aug", vCards: 0 },
    { name: "Sept", vCards: 0 },
    { name: "Oct", vCards: 0 },
    { name: "Nov", vCards: 0 },
    { name: "Dec", vCards: 0 },
];

const platformData = [
    { name: "AndroidOS", value: 70, color: "#3b82f6" }, // Blue
    { name: "Windows", value: 15, color: "#f97316" }, // Orange
    { name: "Other", value: 15, color: "#000000" }, // Black
];

const deviceData = [
    { name: "Desktop", value: 30, color: "#f97316" }, // Orange
    { name: "Mobile", value: 70, color: "#3b82f6" }, // Blue
];

export const OverviewChart = () => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                        domain={[0, 1.0]}
                        allowDataOverflow={true}
                        allowDecimals={true}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="vCards"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PlatformChart = () => {
    return (
        <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-gray-500 ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};


export const DeviceChart = () => {
    return (
        <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        startAngle={180}
                        endAngle={0}
                    >
                        {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm text-gray-500 ml-1">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const AudienceChart = () => {
    // Mock data matching the curve in the image somewhat
    const data = [
        { name: '1', value: 0 },
        { name: '2', value: 2 },
        { name: '3', value: 1 },
        { name: '4', value: 4 },
        { name: '5', value: 2 },
        { name: '6', value: 6 },
        { name: '7', value: 3 },
        { name: '8', value: 4 },
    ]
    return (
        <div className="h-[100px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
