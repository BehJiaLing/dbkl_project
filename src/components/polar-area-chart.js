import React, { useState, useEffect } from 'react';
import { PolarArea } from 'react-chartjs-2';
import { Chart, ArcElement, RadialLinearScale, Tooltip, Legend } from 'chart.js';
import axios from 'axios';  
import axiosInstance from '../axiosConfig';

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
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get("/api/chart/chart-data"); 
                console.log("Chart Data:", response.data); 

                setChartData(prevState => ({
                    ...prevState,
                    datasets: [
                        {
                            ...prevState.datasets[0],
                            data: [response.data.red, response.data.yellow, response.data.green], 
                        },
                    ],
                }));
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();

        // Set up interval to fetch data every 1 minute (60000 ms)
        const intervalId = setInterval(fetchData, 60000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
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
