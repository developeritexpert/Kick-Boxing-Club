'use client';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './addLocation.css';

interface LocationData {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const AddLocation: React.FC = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [refresh, setRefresh] = useState(false);

    // Fetch all locations
    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/admin/location');
            const data = await res.json();

            if (res.ok) {
                setLocations(data.data || []);
            } else {
                toast.error(data.error || 'Failed to fetch locations');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching locations');
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [refresh]);

    // Handle create location
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/location/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create location');
            }

            toast.success('Location saved successfully');
            setName('');
            setRefresh(!refresh); // Refresh location list
        } catch (error) {
            console.error('Error saving location:', error);
            const message = error instanceof Error ? error.message : 'Failed to save location';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-location-container">
            {/* Left: Form */}
            <div className="left-section">
                <h2 className="page-title">Add Location</h2>
                <p className="page-subtitle">Fill out the details below to add a location.</p>

                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Location Name</label>
                        <input
                            name="location_name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter location name"
                            maxLength={50}
                        />
                    </div>

                    <div className="form-actions full-width">
                        <button
                            type="button"
                            className="btn cancel"
                            onClick={() => window.history.back()}
                        >
                            Close
                        </button>
                        <button type="submit" className="btn save" disabled={loading}>
                            {loading ? 'Creating...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right: List */}
            <div className="right-section">
                <h3 className="list-title">Existing Locations</h3>
                <ul className="location-list">
                    {locations.length > 0 ? (
                        locations.map((loc) => (
                            <li key={loc.id} className="location-item">
                                {/* {loc.name} */}
                                {loc.name.length > 40 ? `${loc.name.slice(0, 40)}...` : loc.name}

                            </li>
                        ))
                    ) : (
                        <p className="no-data">Loading...</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AddLocation;
