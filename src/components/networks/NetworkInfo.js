import React, { useEffect, useState } from 'react';
import styles from './dropdown.module.css';

// DataFetcher component with dropdown
const NetworkInfo = () => {
    const [data, setData] = useState([]);
    const [selectedChainId, setSelectedChainId] = useState('');

    // Define the options for the dropdown
    const options = [
        { label: "OP Sepolia", value: "11155420" },
        { label: "Base Sepolia", value: "84532" },
    ];

    useEffect(() => {
        if (selectedChainId === '') return;

        const fetchData = async () => {
            const response = await fetch(`https://raw.githubusercontent.com/polymerdao/polymer-registry/main/chains/eip155%3A${selectedChainId}.json`);
            const jsonData = await response.json();
            console.log(jsonData);
            setData(jsonData);
        };

        fetchData();
    }, [selectedChainId]);

    // Handle dropdown change
    const handleDropdownChange = (e) => {
        setData([]); // Clear the previous data
        setSelectedChainId(e.target.value);
    };

    // Render Markdown table
    const renderTable = () => {
        if (data.length === 0) {
            return <p>No data loaded or loading...</p>;
        }

        return (
            <table>
                <thead>
                    <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.column1}</td>
                            <td>{item.column2}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    // Render JSON data or a message
    const renderJSON = () => {
        if (!selectedChainId) {
            return <p>Please select an option from the dropdown to load data for.</p>;
        } else if (data === null) {
            return <p>Loading data...</p>;
        } else if (data.length === 0) {
            return <p>No data available for this option.</p>;
        } else {
            return <pre>{JSON.stringify(data, null, 2)}</pre>;
        }
    };

    return (
        <div className={styles.dropdownContainer}>
            <select onChange={handleDropdownChange} value={selectedChainId} className={styles.dropdown}>
                <option value="">Select an option</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {renderJSON()}
        </div>
    );
};

export default NetworkInfo;
