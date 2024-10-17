import React, { useState, useEffect } from 'react';
import { PolarArea } from 'react-chartjs-2';
import { Chart, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js';

// Register necessary chart elements
Chart.register(ArcElement, RadialLinearScale, Tooltip, Legend);

const PolarAreaChart = () => {
    const [chartData, setChartData] = useState({
        labels: ['Red', 'Yellow', 'Green'],
        datasets: [
            {
                label: 'Status',
                data: [0, 0, 0], // Default data
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        // Fetch data from backend
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/status'); // Make sure this is the correct endpoint
                const data = await response.json();

                // Assuming data format from the backend is something like [{status: 'red', count: 5}, {status: 'yellow', count: 8}, ...]
                const statusData = {
                    red: data.find(item => item.status === 'red')?.count || 0,
                    yellow: data.find(item => item.status === 'yellow')?.count || 0,
                    green: data.find(item => item.status === 'green')?.count || 0,
                };

                // Update chart data with fetched data
                setChartData(prevState => ({
                    ...prevState,
                    datasets: [
                        {
                            ...prevState.datasets[0],
                            data: [statusData.red, statusData.yellow, statusData.green], // Update with fetched values
                        },
                    ],
                }));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData(); // Call the fetch function
    }, []); // Empty dependency array means this runs once on mount

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            r: {
                pointLabels: {
                    display: true,
                    centerPointLabels: true,
                    font: {
                        size: 18
                    }
                }
            }
        }
    };

    return (
        <div style={styles.chartContainer}>
            <PolarArea data={chartData} options={options} />
        </div>
    );
};

const styles = {
    chartContainer: {
        width: '100%',
        height: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
};

export default PolarAreaChart;
