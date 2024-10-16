import React, { useState, useEffect } from 'react';
import { PolarArea } from 'react-chartjs-2';
import { Chart, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, RadialLinearScale, Tooltip, Legend);

const PolarAreaChart = () => {
    const [chartData, setChartData] = useState({
        labels: ['Red', 'Yellow', 'Green'], // Initial static labels
        datasets: [
            {
                label: 'Status',
                data: [50,20,30], // Initial empty dataset, will be updated with fetched data
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)', // Red
                    'rgba(255, 206, 86, 0.6)', // Yellow
                    'rgba(75, 192, 192, 0.6)'  // Green
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

    const [loading, setLoading] = useState(true);

    // Simulated data fetching from database
    const fetchData = async () => {
        try {
            // Replace with your actual API call
            const response = await fetch("/api/status-data"); // Adjust endpoint accordingly
            const data = await response.json();

            // Assuming the data structure is { green: number, red: number, yellow: number }
            setChartData({
                labels: ['Red', 'Yellow', 'Green'], // Labels remain the same
                datasets: [
                    {
                        label: 'Status',
                        data: [data.red, data.yellow, data.green], // Update with actual values
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)', // Red
                            'rgba(255, 206, 86, 0.6)', // Yellow
                            'rgba(75, 192, 192, 0.6)'  // Green
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

            setLoading(false);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Fetch data when the component mounts
    }, []);

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
            {loading ? (
                <p>Loading...</p>
            ) : (
                <PolarArea data={chartData} options={options} />
            )}
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
